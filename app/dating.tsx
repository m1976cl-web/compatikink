import React, { useState, useEffect, useMemo } from 'react';
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
        const report = generateReport('dating_sim', myResponses, p.baseResponses, profile ?? undefined, p);
        baseScore = report.compatibilityScore;
        const filteredMatches = report.items
          .filter((i) => i.section === 'mutual_match' || i.section === 'explore_together')
          .map((i) => i.activityName);
        if (filteredMatches.length > 0) {
          mutualNames = filteredMatches;
        }
      }

      // Calculate role complementarity score
      const roleScore = calculateRoleComplementarityScore(myRole, p.role || 'Switch');
      const combinedScore = Math.round(baseScore * 0.6 + roleScore * 0.4);

      return {
        profile: p,
        score: combinedScore,
        roleScore,
        mutualMatches: mutualNames,
      };
    }).sort((a, b) => b.score - a.score);
  }, [profile]);

  const filtered = useMemo(() => {
    return rankedProfiles.filter(({ profile: p, score }) => {
      if (score < minScoreFilter) return false;

      if (selectedRoleFilter !== 'all') {
        const pRole = (p.role || '').toLowerCase();
        const target = selectedRoleFilter.toLowerCase();
        if (!pRole.includes(target)) return false;
      }

      if (fetlifeRoleFilter !== 'all') {
        const q = fetlifeRoleFilter.toLowerCase();
        const matchesRole = (p.bio || '').toLowerCase().includes(q) || p.topKinks.some((k) => k.toLowerCase().includes(q));
        if (!matchesRole) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.nickname.toLowerCase().includes(q);
        const matchesBio = p.bio.toLowerCase().includes(q);
        const matchesKinks = p.topKinks.some((k) => k.toLowerCase().includes(q));
        const matchesBadges = (p.fetishBadges || []).some((b) => b.label.toLowerCase().includes(q));
        if (!matchesName && !matchesBio && !matchesKinks && !matchesBadges) return false;
      }
      return true;
    });
  }, [rankedProfiles, minScoreFilter, selectedRoleFilter, fetlifeRoleFilter, searchQuery]);

  const handleStartSessionWithProfile = async (target: CommunityProfile) => {
    if (!profile || !profile.baseResponses || profile.baseResponses.length === 0) {
      Alert.alert(
        'Completa tu Cuestionario Base',
        'Debes responder tu cuestionario primero para comparar compatibilidad real con perfiles.',
        [
          { text: 'Ir al Cuestionario', onPress: () => router.push('/questionnaire') },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
      return;
    }

    try {
      const session = await createLocalSession(profile.nickname, profile.baseResponses, profile);
      const { saveLocalSessions, loadLocalSessions } = await import('@/lib/storage');
      const sessions = await loadLocalSessions();
      if (sessions[session.id]) {
        sessions[session.id].guestNickname = target.nickname;
        sessions[session.id].guestProfile = target;
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
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
        <AuthorizedMediaGallery
          visible={!!mediaTarget}
          targetProfileNickname={mediaTarget?.nickname || ''}
          currentProfileNickname={profile?.nickname || 'Usuario'}
          onClose={() => setMediaTarget(null)}
        />

        {/* Mutual Crush Match Celebration Modal */}
        <CrushMatchModal
          visible={!!crushMatchTarget}
          targetNickname={crushMatchTarget?.nickname || ''}
          onStartVirtualDate={() => {
            const target = crushMatchTarget;
            setCrushMatchTarget(null);
            if (target) setVirtualDateTarget(target);
          }}
          onClose={() => setCrushMatchTarget(null)}
        />

        {/* Guided Virtual Date Session Modal */}
        <VirtualDateModal
          visible={!!virtualDateTarget}
          targetNickname={virtualDateTarget?.nickname || ''}
          onClose={() => setVirtualDateTarget(null)}
        />

        {/* Direct Comparison Modal (Comparate Conmigo) */}
        {comparisonTarget && profile ? (
          <DirectComparisonModal
            visible={!!comparisonTarget}
            targetProfile={comparisonTarget}
            currentProfile={profile}
            onClose={() => setComparisonTarget(null)}
          />
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    backgroundColor: '#0a0612',
  },
  containerDesktop: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    gap: 4,
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.neonPurple, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  warningBanner: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    gap: spacing.xs,
  },
  warningTitle: { color: colors.warning, fontSize: fontSize.sm, fontWeight: '800' },
  warningText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },
  warningBtn: {
    backgroundColor: colors.warning,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  warningBtnText: { color: '#000', fontSize: fontSize.xs, fontWeight: '800' },

  feed: { gap: spacing.md, paddingTop: spacing.xs },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md },
});

export default function DatingScreen() {
  return (
    <RouteFeatureGuard route="/dating" title="Match Directo & Dating">
      <DatingScreenContent />
    </RouteFeatureGuard>
  );
}
