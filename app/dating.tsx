import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import {
  getCurrentProfile,
  createLocalSession,
  saveGuestProfile,
  getDatingMessages,
  sendDatingMessage,
  DatingMessage,
  saveProfile,
} from '@/lib/storage';
import { generateReport } from '@/lib/compatibility';
import { UserProfile } from '@/types';
import { COMMUNITY_PROFILES, CommunityProfile } from '@/data/communityProfiles';
import { VaultLockGateAPI } from '@/lib/cryptoVault';
import { calculateRoleComplementarityScore } from '@/lib/vaultUnified';

import { FetlifeLinkerCard } from '@/components/dating/FetlifeLinkerCard';
import { MatchFilterBar } from '@/components/dating/MatchFilterBar';
import { DatingProfileCard } from '@/components/dating/DatingProfileCard';
import { DirectMessageModal } from '@/components/dating/DirectMessageModal';

import { AuthorizedMediaGallery } from '@/components/profile/AuthorizedMediaGallery';
import { CrushMatchModal } from '@/components/profile/CrushMatchModal';
import { VirtualDateModal } from '@/components/profile/VirtualDateModal';
import { DirectComparisonModal } from '@/components/profile/DirectComparisonModal';

import { toggleBlindCrush, getCrushStatus } from '@/lib/blindCrushManager';
import { BlockedUser, getBlockedUsers, filterBlockedItems } from '@/lib/trustSafety';
import { ReportContentModal } from '@/components/safety/ReportContentModal';
import { BlockUserModal } from '@/components/safety/BlockUserModal';
import { BlockedUsersManagerModal } from '@/components/safety/BlockedUsersManagerModal';
import { triggerLightHaptic } from '@/lib/haptics';

import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';

function DatingScreenContent() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fetlifeRoleFilter, setFetlifeRoleFilter] = useState<string>('all');
  const [userFetlifeHandle, setUserFetlifeHandle] = useState('');
  const [messagingTarget, setMessagingTarget] = useState<CommunityProfile | null>(null);
  const [chatMessages, setChatMessages] = useState<DatingMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');

  // Profile Enhancements State
  const [mediaTarget, setMediaTarget] = useState<CommunityProfile | null>(null);
  const [crushMatchTarget, setCrushMatchTarget] = useState<CommunityProfile | null>(null);
  const [virtualDateTarget, setVirtualDateTarget] = useState<CommunityProfile | null>(null);
  const [comparisonTarget, setComparisonTarget] = useState<CommunityProfile | null>(null);
  const [crushStateMap, setCrushStateMap] = useState<Record<string, { hasCrush: boolean; isMutual: boolean }>>({});

  // Trust & Safety State
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [reportModalData, setReportModalData] = useState<{
    targetType: 'user';
    targetId: string;
    targetAuthorName?: string;
    targetPreviewText?: string;
  } | null>(null);

  const [blockModalData, setBlockModalData] = useState<{
    targetUserId: string;
    targetUserNickname: string;
  } | null>(null);

  const [showBlockedManager, setShowBlockedManager] = useState(false);

  const loadBlockedList = useCallback(async () => {
    const list = await getBlockedUsers();
    setBlockedUsers(list);
  }, []);

  useEffect(() => {
    loadBlockedList();
  }, [loadBlockedList]);

  useEffect(() => {
    (async () => {
      const p = await getCurrentProfile();
      setProfile(p);
      if (p?.fetlifeHandle) {
        setUserFetlifeHandle(p.fetlifeHandle);
      }

      // Load crush states
      if (p?.nickname) {
        const map: Record<string, { hasCrush: boolean; isMutual: boolean }> = {};
        for (const cp of COMMUNITY_PROFILES) {
          const st = await getCrushStatus(p.nickname, cp.nickname);
          map[cp.nickname] = { hasCrush: st.hasCrushOnTarget, isMutual: st.isMutualMatch };
        }
        setCrushStateMap(map);
      }
    })();
  }, []);

  const handleToggleCrush = async (target: CommunityProfile) => {
    const userNick = profile?.nickname || 'Usuario';
    const res = await toggleBlindCrush(userNick, target.nickname);

    setCrushStateMap((prev) => ({
      ...prev,
      [target.nickname]: { hasCrush: res.isCrushActiveNow, isMutual: res.isMutualMatch },
    }));

    if (res.isMutualMatch) {
      setCrushMatchTarget(target);
    } else if (res.isCrushActiveNow) {
      Alert.alert(
        '💖 Crush Enviado',
        `Has registrado tu crush ciego por ${target.nickname}. Nadie lo sabrá a menos que sea mutuo.`
      );
    }
  };

  // Compute compatibility score for each community profile
  const rankedProfiles = useMemo(() => {
    const myResponses = profile?.baseResponses ?? [];
    const myRole = profile?.role || 'Switch';

    return COMMUNITY_PROFILES.map((p) => {
      let baseScore = 75;
      let mutualNames: string[] = p.topKinks;

      if (myResponses.length > 0) {
        try {
          const report = generateReport('local-dating-preview', myResponses, p.baseResponses || []);
          baseScore = report.compatibilityScore;
          mutualNames = report.items
            .filter((i) => i.section === 'mutual_match')
            .map((i) => i.activityName);
        } catch {
          baseScore = 70;
        }
      }

      const roleScore = calculateRoleComplementarityScore(myRole, p.role || 'Switch');
      const finalScore = Math.round(baseScore * 0.7 + roleScore * 0.3);

      return {
        profile: p,
        score: finalScore,
        roleScore,
        mutualMatches: mutualNames,
      };
    });
  }, [profile]);

  // Filter blocked profiles and apply search / role filters
  const filtered = useMemo(() => {
    const unblocked = filterBlockedItems(
      rankedProfiles.map((r) => ({
        ...r,
        nickname: r.profile.nickname,
        id: r.profile.id,
      })),
      blockedUsers
    );

    return unblocked.filter(({ profile: p, score }) => {
      if (score < minScoreFilter) return false;
      if (selectedRoleFilter !== 'all' && p.role?.toLowerCase() !== selectedRoleFilter.toLowerCase()) return false;
      if (fetlifeRoleFilter !== 'all' && p.role?.toLowerCase() !== fetlifeRoleFilter.toLowerCase()) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNick = p.nickname.toLowerCase().includes(q);
        const matchBio = p.bio.toLowerCase().includes(q);
        const matchKink = p.topKinks.some((k) => k.toLowerCase().includes(q));
        const matchFetish = p.fetishBadges?.some((b) => b.label.toLowerCase().includes(q));
        if (!matchNick && !matchBio && !matchKink && !matchFetish) return false;
      }

      return true;
    });
  }, [rankedProfiles, blockedUsers, minScoreFilter, selectedRoleFilter, fetlifeRoleFilter, searchQuery]);

  const handleStartSessionWithProfile = async (target: CommunityProfile) => {
    if (!profile) {
      Alert.alert(
        'Perfil Incompleto',
        'Crea tu perfil y responde el cuestionario base para comparar tu compatibilidad.',
        [
          { text: 'Ir al Cuestionario', onPress: () => router.push('/questionnaire') },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
      return;
    }

    try {
      const session = await createLocalSession(profile.nickname, profile.baseResponses || [], profile);
      const { saveLocalSessions, loadLocalSessions } = await import('@/lib/storage');
      const sessions = await loadLocalSessions();
      if (sessions[session.id]) {
        sessions[session.id].guestNickname = target.nickname;
        sessions[session.id].guestProfile = target as any;
        sessions[session.id].guestResponses = target.baseResponses;
        sessions[session.id].status = 'complete';
        sessions[session.id].completedAt = new Date().toISOString();
        await saveLocalSessions(sessions);
      }

      await saveGuestProfile(session.id, { nickname: target.nickname, notes: target.bio });

      Alert.alert(
        '🔥 Conexión Generada',
        `Se ha generado la sesión de compatibilidad con ${target.nickname}. Redirigiendo al reporte completo...`
      );
      setComparisonTarget(target);
    } catch (e) {
      console.warn('Error starting session profile:', e);
    }
  };

  const handleLinkFetlife = async () => {
    if (!userFetlifeHandle.trim()) {
      Alert.alert('Ingresa tu Usuario', 'Escribe tu usuario o enlace de FetLife.');
      return;
    }

    if (profile) {
      const updated: UserProfile = {
        ...profile,
        fetlifeHandle: userFetlifeHandle.trim(),
        verificationBadges: Array.from(new Set([...(profile.verificationBadges || []), 'FetLife Verified'])),
      };
      await saveProfile(updated);
      setProfile(updated);
    }

    Alert.alert(
      'Perfil FetLife vinculado ✓',
      `Se ha verificado el perfil ${userFetlifeHandle}. Tu insignia 'FetLife Verified' ya está activa en tu perfil.`
    );
  };

  const handleOpenChat = async (target: CommunityProfile) => {
    setMessagingTarget(target);
    if (VaultLockGateAPI.isUnlocked()) {
      const msgs = await getDatingMessages(target.id);
      setChatMessages(msgs);
    } else {
      setChatMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !messagingTarget) return;
    const sender = profile?.nickname || 'Tú';
    await sendDatingMessage({
      targetProfileId: messagingTarget.id,
      senderName: sender,
      text: messageInput,
    });
    setMessageInput('');
    const updated = await getDatingMessages(messagingTarget.id);
    setChatMessages(updated);
  };

  const handleUnlockVaultForChat = async () => {
    if (!messagingTarget) return;
    const msgs = await getDatingMessages(messagingTarget.id);
    setChatMessages(msgs);
  };

  return (
    <ScreenContainer title="Conexiones Fetish & Dating" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Volver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.safetyBtn}
              onPress={() => {
                triggerLightHaptic();
                setShowBlockedManager(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.safetyBtnText}>
                🛡️ Bloqueados ({blockedUsers.length})
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Fetish Social & Dating Suite</Text>
          <Text style={styles.subtitle}>
            Buscador por roles (Dom/Sub/Switch), insignias fetichistas, protocolos SSC/RACK y mensajería cifrada
          </Text>
        </View>

        {/* FetLife profile linker */}
        <FetlifeLinkerCard
          userFetlifeHandle={userFetlifeHandle}
          onChangeHandle={setUserFetlifeHandle}
          onLinkFetlife={handleLinkFetlife}
        />

        {/* Filter Bar */}
        <MatchFilterBar
          selectedRoleFilter={selectedRoleFilter}
          onSelectRoleFilter={setSelectedRoleFilter}
          fetlifeRoleFilter={fetlifeRoleFilter}
          onSelectFetlifeFilter={setFetlifeRoleFilter}
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
          minScoreFilter={minScoreFilter}
          onSelectMinScore={setMinScoreFilter}
        />

        {/* User Status Warning Banner if questionnaire not done */}
        {(!profile?.baseResponses || profile.baseResponses.length === 0) && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningTitle}>⚠️ Cuestionario Base Incompleto</Text>
            <Text style={styles.warningText}>
              Responde tu cuestionario para calcular el % de compatibilidad exacto y activar la matriz de complementariedad de roles.
            </Text>
            <TouchableOpacity style={styles.warningBtn} onPress={() => router.push('/questionnaire')}>
              <Text style={styles.warningBtnText}>Responder Cuestionario 📋</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Feed List */}
        <ScrollView contentContainerStyle={styles.feed} showsVerticalScrollIndicator={false}>
          {filtered.map(({ profile: item, score, roleScore, mutualMatches }) => {
            const cs = crushStateMap[item.nickname];
            return (
              <DatingProfileCard
                key={item.id}
                profile={item}
                score={score}
                roleScore={roleScore}
                mutualMatches={mutualMatches}
                hasCrushOnTarget={cs?.hasCrush}
                isMutualCrush={cs?.isMutual}
                onStartSession={handleStartSessionWithProfile}
                onOpenChat={handleOpenChat}
                onToggleCrush={handleToggleCrush}
                onOpenAuthorizedMedia={(p) => setMediaTarget(p)}
                onReport={(p) =>
                  setReportModalData({
                    targetType: 'user',
                    targetId: p.id,
                    targetAuthorName: p.nickname,
                    targetPreviewText: p.bio,
                  })
                }
                onBlock={(p) =>
                  setBlockModalData({
                    targetUserId: p.id,
                    targetUserNickname: p.nickname,
                  })
                }
              />
            );
          })}

          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No se encontraron perfiles con esos filtros.</Text>
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>

        {/* Direct Messaging Modal — gated by vault */}
        <DirectMessageModal
          messagingTarget={messagingTarget}
          onClose={() => setMessagingTarget(null)}
          chatMessages={chatMessages}
          messageInput={messageInput}
          onChangeMessageInput={setMessageInput}
          onSendMessage={handleSendMessage}
          onUnlockVault={handleUnlockVaultForChat}
          myNickname={profile?.nickname || 'Tú'}
        />

        {/* Authorized ZK Media Gallery Modal */}
        {mediaTarget && profile ? (
          <AuthorizedMediaGallery
            visible={!!mediaTarget}
            targetProfileNickname={mediaTarget.nickname}
            currentProfileNickname={profile.nickname}
            onClose={() => setMediaTarget(null)}
          />
        ) : null}

        {/* Crush Match Modal */}
        {crushMatchTarget ? (
          <CrushMatchModal
            visible={!!crushMatchTarget}
            targetNickname={crushMatchTarget.nickname}
            onStartVirtualDate={() => {
              const t = crushMatchTarget;
              setCrushMatchTarget(null);
              setVirtualDateTarget(t);
            }}
            onClose={() => setCrushMatchTarget(null)}
          />
        ) : null}

        {/* Virtual Date Simulator Modal */}
        {virtualDateTarget ? (
          <VirtualDateModal
            visible={!!virtualDateTarget}
            targetNickname={virtualDateTarget.nickname}
            onClose={() => setVirtualDateTarget(null)}
          />
        ) : null}

        {/* Direct Comparison Modal */}
        {comparisonTarget && profile ? (
          <DirectComparisonModal
            visible={!!comparisonTarget}
            targetProfile={comparisonTarget as any}
            currentProfile={profile}
            currentResponses={profile.baseResponses || []}
            targetResponses={comparisonTarget.baseResponses || []}
            onClose={() => setComparisonTarget(null)}
          />
        ) : null}

        {/* Safety Modals */}
        {reportModalData ? (
          <ReportContentModal
            visible={!!reportModalData}
            onClose={() => setReportModalData(null)}
            targetType={reportModalData.targetType}
            targetId={reportModalData.targetId}
            targetAuthorName={reportModalData.targetAuthorName}
            targetPreviewText={reportModalData.targetPreviewText}
            onReportSubmitted={loadBlockedList}
          />
        ) : null}

        {blockModalData ? (
          <BlockUserModal
            visible={!!blockModalData}
            onClose={() => setBlockModalData(null)}
            targetUserId={blockModalData.targetUserId}
            targetUserNickname={blockModalData.targetUserNickname}
            onUserBlocked={loadBlockedList}
          />
        ) : null}

        <BlockedUsersManagerModal
          visible={showBlockedManager}
          onClose={() => setShowBlockedManager(false)}
          onListUpdated={loadBlockedList}
        />
      </View>
    </ScreenContainer>
  );
}

export default function DatingScreen() {
  return (
    <RouteFeatureGuard route="/dating" title="Módulo de Dating y Perfiles">
      <DatingScreenContent />
    </RouteFeatureGuard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },
  header: { paddingTop: spacing.md, paddingBottom: spacing.sm, gap: 4 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start' },
  backBtnText: { color: colors.primary, fontFamily: fonts.bodySemi, fontSize: fontSize.sm },
  safetyBtn: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderColor: '#f87171',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  safetyBtnText: {
    color: '#f87171',
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
  title: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.xs },
  feed: { gap: spacing.md, paddingBottom: spacing.xxl },
  warningBanner: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: '#fbbf24',
    padding: spacing.md,
    borderRadius: radii.lg,
    marginVertical: spacing.xs,
    gap: 4,
  },
  warningTitle: { color: '#fbbf24', fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
  warningText: { color: colors.text, fontSize: 11, lineHeight: 16 },
  warningBtn: {
    backgroundColor: '#fbbf24',
    paddingVertical: 6,
    borderRadius: radii.sm,
    alignItems: 'center',
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
  },
  warningBtnText: { color: '#000', fontSize: 11, fontFamily: fonts.bodyBold },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText: { color: colors.textMuted, fontSize: fontSize.sm },
});
