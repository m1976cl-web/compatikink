import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { VaultLockGate } from '@/components/VaultLockGate';
import { useResponsive } from '@/hooks/useResponsive';
import { getCurrentProfile, createLocalSession, saveGuestProfile, getDatingMessages, sendDatingMessage, DatingMessage, saveProfile } from '@/lib/storage';
import { generateReport } from '@/lib/compatibility';
import { UserProfile, EXPERIENCE_LABELS, FetishBadge } from '@/types';
import { COMMUNITY_PROFILES, CommunityProfile } from '@/data/communityProfiles';
import { VaultLockGateAPI } from '@/lib/cryptoVault';
import { calculateRoleComplementarityScore } from '@/lib/vault';

export default function DatingScreen() {
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

  useEffect(() => {
    (async () => {
      const p = await getCurrentProfile();
      setProfile(p);
      if (p?.fetlifeHandle) {
        setUserFetlifeHandle(p.fetlifeHandle);
      }
    })();
  }, []);

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

      router.push({ pathname: '/report', params: { token: session.initiatorToken } });
    } catch {
      Alert.alert('Error', 'No se pudo generar la sesión de conexión.');
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
        <View style={styles.fetlifeCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 20 }}>🗝️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.fetlifeCardTitle}>Integración & Verificación FetLife</Text>
              <Text style={styles.fetlifeCardDesc}>
                Vincular tu perfil de FetLife otorga la insignia verificada en tus conexiones y permite filtrar por roles avanzados.
              </Text>
            </View>
          </View>

          <View style={styles.fetlifeInputRow}>
            <TextInput
              style={styles.fetlifeInput}
              placeholder="Ej: fetlife.com/users/TuNombre o @TuNombre"
              placeholderTextColor={colors.textMuted}
              value={userFetlifeHandle}
              onChangeText={setUserFetlifeHandle}
            />
            <TouchableOpacity style={styles.fetlifeVerifyBtn} onPress={handleLinkFetlife}>
              <Text style={styles.fetlifeVerifyBtnText}>Vincular FetLife</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dom / Sub / Switch Role Filter Chips */}
        <View style={styles.roleFilterSection}>
          <Text style={styles.filterSectionTitle}>🏷️ Filtrar por Rol Principal:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleScroll}>
            {[
              { id: 'all', label: '🌐 Todos' },
              { id: 'dom', label: '⚡ Dom / Top / Master' },
              { id: 'sub', label: '🪢 Sub / Bottom / Slave' },
              { id: 'switch', label: '🔄 Switch / Versátil' },
              { id: 'brat', label: '😜 Brat' },
            ].map((rf) => (
              <TouchableOpacity
                key={rf.id}
                style={[styles.roleChip, selectedRoleFilter === rf.id && styles.roleChipActive]}
                onPress={() => setSelectedRoleFilter(rf.id)}
              >
                <Text style={[styles.roleChipText, selectedRoleFilter === rf.id && styles.roleChipTextActive]}>
                  {rf.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FetLife Advanced Category Filter Bar */}
        <View style={styles.roleFilterSection}>
          <Text style={styles.filterSectionTitle}>🔍 Fetiche o Interés Específico:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleScroll}>
            {[
              { id: 'all', label: 'Todos los Kinks' },
              { id: 'shibari', label: '🪢 Shibari / Rope' },
              { id: 'bondage', label: '🔒 Bondage' },
              { id: 'impacto', label: '⚡ Impact Play' },
              { id: 'keyholder', label: '🗝️ Castidad' },
              { id: 'sensorial', label: '🕯️ Cera & Hielo' },
              { id: 'afectivo', label: '🪷 Aftercare' },
            ].map((rf) => (
              <TouchableOpacity
                key={rf.id}
                style={[styles.roleChip, fetlifeRoleFilter === rf.id && styles.roleChipActive]}
                onPress={() => setFetlifeRoleFilter(rf.id)}
              >
                <Text style={[styles.roleChipText, fetlifeRoleFilter === rf.id && styles.roleChipTextActive]}>
                  {rf.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

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

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nick, ubicación, insignia o fetiche (ej: Shibari, D/s, Cera)..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Match Percentage Filter Row */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Filtrar por Afinidad:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
            {[
              { label: 'Todos', min: 0 },
              { label: '🔥 >70% Match', min: 70 },
              { label: '⚡ >80% Match', min: 80 },
              { label: '💖 >90% Match', min: 90 },
            ].map((f) => {
              const active = minScoreFilter === f.min;
              return (
                <TouchableOpacity
                  key={f.min}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setMinScoreFilter(f.min)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Feed List */}
        <ScrollView contentContainerStyle={styles.feed} showsVerticalScrollIndicator={false}>
          {filtered.map(({ profile: item, score, roleScore, mutualMatches }) => (
            <View key={item.id} style={styles.profileCard}>
              {/* Top Row: Avatar, Info & Match Score */}
              <View style={styles.cardHeaderRow}>
                <Text style={styles.avatarEmoji}>{item.avatarEmoji}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={styles.nickname}>{item.nickname}</Text>
                    <Text style={styles.ageText}>{item.age}y</Text>

                    {/* Verification Badges */}
                    {item.verificationBadges?.map((v, idx) => (
                      <View key={idx} style={styles.verifBadge}>
                        <Text style={styles.verifBadgeText}>✓ {v}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.metaText}>
                    {item.pronouns ? `${item.pronouns} · ` : ''}{item.location}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <Text style={styles.roleTagText}>🎭 Rol: {item.role || 'Switch'}</Text>
                    <Text style={styles.expBadge}>
                      {EXPERIENCE_LABELS[item.experienceLevel ?? 'intermediate']}
                    </Text>
                  </View>
                </View>

                {/* Score Pill */}
                <View
                  style={[
                    styles.scorePill,
                    score >= 80 ? styles.scoreHigh : score >= 60 ? styles.scoreMed : styles.scoreLow,
                  ]}
                >
                  <Text style={styles.scoreNumber}>{score}%</Text>
                  <Text style={styles.scoreText}>Match Global</Text>
                  <Text style={styles.roleSubScore}>Roles: {roleScore}%</Text>
                </View>
              </View>

              {/* Bio */}
              <Text style={styles.bioText}>{item.bio}</Text>

              {/* Glowing Fetish & Role Badges Matrix */}
              {item.fetishBadges && item.fetishBadges.length > 0 && (
                <View style={styles.badgeMatrixSection}>
                  <Text style={styles.badgeMatrixTitle}>✨ Insignias Visuales Cifradas:</Text>
                  <View style={styles.badgeChipsGrid}>
                    {item.fetishBadges.map((badge: FetishBadge) => (
                      <View
                        key={badge.id}
                        style={[
                          styles.visualBadgeChip,
                          { borderColor: badge.color, backgroundColor: `${badge.color}15` },
                        ]}
                      >
                        <Text style={styles.badgeIcon}>{badge.icon || '🏷️'}</Text>
                        <Text style={[styles.badgeLabel, { color: badge.color }]}>{badge.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Safety Protocols & Safewords */}
              <View style={styles.safetyBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={styles.safetyBoxTitle}>🛡️ Protocolos:</Text>
                  {(item.safetyProtocols || ['SSC']).map((prot, idx) => (
                    <View key={idx} style={styles.protocolChip}>
                      <Text style={styles.protocolText}>{prot}</Text>
                    </View>
                  ))}
                </View>

                {item.safewords && (
                  <View style={styles.safewordsRow}>
                    <Text style={styles.safewordsLabel}>Semáforo:</Text>
                    <Text style={[styles.swItem, { color: colors.success }]}>🟢 {item.safewords.green || 'Verde'}</Text>
                    <Text style={[styles.swItem, { color: colors.warning }]}>🟡 {item.safewords.yellow || 'Amarillo'}</Text>
                    <Text style={[styles.swItem, { color: colors.danger }]}>🔴 {item.safewords.red || 'Rojo'}</Text>
                  </View>
                )}
              </View>

              {/* Mutual Kinks / Top Matches */}
              <View style={styles.kinksSection}>
                <Text style={styles.kinksLabel}>🔥 Intereses principales / Coincidencias:</Text>
                <View style={styles.kinkChipsRow}>
                  {mutualMatches.slice(0, 4).map((kink, idx) => (
                    <View key={idx} style={styles.kinkChip}>
                      <Text style={styles.kinkChipText}>✨ {kink}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Actions Row */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.connectBtn}
                  onPress={() => handleStartSessionWithProfile(item)}
                >
                  <Text style={styles.connectBtnText}>🔥 Comparar Compatibilidad Completa 📊</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.chatBtn}
                  onPress={async () => {
                    setMessagingTarget(item);
                    if (VaultLockGateAPI.isUnlocked()) {
                      const msgs = await getDatingMessages(item.id);
                      setChatMessages(msgs);
                    } else {
                      setChatMessages([]);
                    }
                  }}
                >
                  <Text style={styles.chatBtnText}>💬 Enviar mensaje directo cifrado</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No se encontraron perfiles con esos filtros.</Text>
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>

        {/* Direct Messaging Modal — gated by vault */}
        {messagingTarget ? (
          <Modal
            visible={!!messagingTarget}
            transparent
            animationType="slide"
            onRequestClose={() => setMessagingTarget(null)}
          >
            <View style={styles.chatOverlay}>
              <View style={styles.chatModalCard}>
                <View style={styles.chatModalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.chatModalTitle}>{messagingTarget.nickname}</Text>
                    <Text style={styles.chatModalSub}>Mensajería directa cifrada en bóveda (AES-GCM-256)</Text>
                  </View>
                  <TouchableOpacity onPress={() => setMessagingTarget(null)} style={styles.closeX}>
                    <Text style={styles.closeXText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <VaultLockGate
                  title="Mensajes Cifrados"
                  subtitle="Desbloquea la bóveda para leer y enviar DMs almacenados en tu dispositivo."
                  onUnlock={async () => {
                    if (!messagingTarget) return;
                    const msgs = await getDatingMessages(messagingTarget.id);
                    setChatMessages(msgs);
                  }}
                >
                  <ScrollView contentContainerStyle={styles.chatList} showsVerticalScrollIndicator={false}>
                    {chatMessages.length === 0 ? (
                      <View style={styles.chatEmptyState}>
                        <Text style={styles.chatEmptyText}>
                          Inicia la conversación con {messagingTarget.nickname}. Propón una escena, acuerda safewords o comparte detalles confidenciales.
                        </Text>
                      </View>
                    ) : (
                      chatMessages.map((msg) => {
                        const isMe = msg.senderName === (profile?.nickname || 'Tú');
                        return (
                          <View
                            key={msg.id}
                            style={[styles.chatBubble, isMe ? styles.chatBubbleMe : styles.chatBubbleOther]}
                          >
                            <Text style={styles.chatSender}>{msg.senderName}</Text>
                            <Text style={styles.chatText}>{msg.text}</Text>
                          </View>
                        );
                      })
                    )}
                  </ScrollView>

                  <View style={styles.chatInputRow}>
                    <TextInput
                      style={styles.chatInput}
                      placeholder="Escribe tu propuesta de escena o mensaje..."
                      placeholderTextColor={colors.textMuted}
                      value={messageInput}
                      onChangeText={setMessageInput}
                    />
                    <TouchableOpacity
                      style={styles.sendBtn}
                      onPress={async () => {
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
                      }}
                    >
                      <Text style={styles.sendBtnText}>Enviar</Text>
                    </TouchableOpacity>
                  </View>
                </VaultLockGate>
              </View>
            </View>
          </Modal>
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

  fetlifeCard: {
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.neonPurple,
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  fetlifeCardTitle: { color: colors.neonPurple, fontSize: fontSize.sm, fontWeight: '900' },
  fetlifeCardDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 16 },
  fetlifeInputRow: { flexDirection: 'row', gap: spacing.xs },
  fetlifeInput: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    color: colors.text,
    fontSize: fontSize.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fetlifeVerifyBtn: {
    backgroundColor: colors.neonPurple,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.md,
    justifyContent: 'center',
  },
  fetlifeVerifyBtnText: { color: '#000', fontSize: fontSize.xs, fontWeight: '900' },

  roleFilterSection: { gap: 6, marginVertical: spacing.xs },
  filterSectionTitle: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  roleScroll: { gap: 6 },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleChipActive: { backgroundColor: colors.neonPurple, borderColor: colors.neonPurple },
  roleChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  roleChipTextActive: { color: '#000' },

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

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    gap: spacing.xs,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, paddingVertical: 10, color: colors.text, fontSize: fontSize.sm },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  filterLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  filterChips: { flexDirection: 'row', gap: 6, paddingVertical: 4 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.neonRose,
    borderColor: colors.neonRose,
  },
  filterChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  filterChipTextActive: { color: '#fff' },

  feed: { gap: spacing.md, paddingTop: spacing.xs },

  profileCard: {
    backgroundColor: '#120b22',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    gap: spacing.sm,
    shadowColor: '#c084fc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarEmoji: { fontSize: 44 },
  nickname: { color: colors.neonPurple, fontSize: fontSize.lg, fontWeight: '900' },
  ageText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600' },
  metaText: { color: colors.textMuted, fontSize: fontSize.xs },
  roleTagText: { color: colors.neonRose, fontSize: fontSize.xs, fontWeight: '700' },
  expBadge: { color: colors.neonEmerald, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  verifBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifBadgeText: { color: '#38bdf8', fontSize: 9, fontWeight: '800' },

  scorePill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.lg,
    borderWidth: 1.5,
  },
  scoreHigh: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: colors.neonEmerald },
  scoreMed: { backgroundColor: 'rgba(192, 132, 252, 0.15)', borderColor: colors.neonPurple },
  scoreLow: { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderColor: colors.warning },
  scoreNumber: { color: colors.text, fontSize: fontSize.lg, fontWeight: '900' },
  scoreText: { color: colors.textMuted, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  roleSubScore: { color: colors.neonRose, fontSize: 8, fontWeight: '700', marginTop: 2 },

  bioText: { color: colors.text, fontSize: fontSize.sm, lineHeight: 20 },

  badgeMatrixSection: { gap: 6, marginVertical: 2 },
  badgeMatrixTitle: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  badgeChipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  visualBadgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.md,
    borderWidth: 1.5,
  },
  badgeIcon: { fontSize: 12 },
  badgeLabel: { fontSize: fontSize.xs, fontWeight: '800' },

  safetyBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    gap: 6,
  },
  safetyBoxTitle: { color: colors.neonEmerald, fontSize: fontSize.xs, fontWeight: '800' },
  protocolChip: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  protocolText: { color: colors.neonEmerald, fontSize: 10, fontWeight: '900' },
  safewordsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  safewordsLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  swItem: { fontSize: fontSize.xs, fontWeight: '700' },

  kinksSection: { gap: 4 },
  kinksLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  kinkChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  kinkChip: {
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  kinkChipText: { color: colors.neonPurple, fontSize: fontSize.xs, fontWeight: '600' },

  actionsRow: { marginTop: 4, gap: spacing.xs },
  connectBtn: {
    backgroundColor: colors.neonPurple,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  connectBtnText: { color: '#000', fontSize: fontSize.sm, fontWeight: '900' },
  chatBtn: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatBtnText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md },

  // Direct Messaging Modal Styles
  chatOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  chatModalCard: {
    backgroundColor: '#120b22',
    borderRadius: 24,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 520,
    height: '75%',
    borderWidth: 1.5,
    borderColor: colors.neonPurple,
    gap: spacing.sm,
  },
  chatModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatModalTitle: { color: colors.neonPurple, fontSize: fontSize.md, fontWeight: '800' },
  chatModalSub: { color: colors.textMuted, fontSize: fontSize.xs },
  closeX: { padding: 6 },
  closeXText: { color: colors.textMuted, fontSize: 16, fontWeight: '700' },
  chatList: { gap: spacing.sm, paddingVertical: spacing.xs },
  chatEmptyState: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.xs },
  chatEmptyText: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', lineHeight: 18 },
  chatBubble: {
    maxWidth: '85%',
    padding: spacing.md,
    borderRadius: radii.lg,
    gap: 2,
  },
  chatBubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: colors.neonPurple,
    borderBottomRightRadius: 4,
  },
  chatBubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceLight,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatSender: { color: '#000', fontSize: 10, fontWeight: '900' },
  chatText: { color: '#fff', fontSize: fontSize.sm, lineHeight: 18 },
  chatInputRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: fontSize.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    backgroundColor: colors.neonRose,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  sendBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },
});
