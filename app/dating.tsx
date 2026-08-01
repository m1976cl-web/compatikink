import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { VaultLockGate } from '@/components/VaultLockGate';
import { useResponsive } from '@/hooks/useResponsive';
import { getCurrentProfile, createLocalSession, saveGuestProfile, getDatingMessages, sendDatingMessage, DatingMessage } from '@/lib/storage';
import { generateReport } from '@/lib/compatibility';
import { UserProfile, EXPERIENCE_LABELS } from '@/types';
import { COMMUNITY_PROFILES, CommunityProfile } from '@/data/communityProfiles';
import { Modal } from 'react-native';
import { VaultLockGateAPI } from '@/lib/cryptoVault';

export default function DatingScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [roleFilter, setRoleFilter] = useState<'all' | 'give' | 'receive' | 'both'>('all');
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
    })();
  }, []);

  // Compute compatibility score for each community profile against user's baseResponses
  const rankedProfiles = useMemo(() => {
    const myResponses = profile?.baseResponses ?? [];
    if (myResponses.length === 0) {
      return COMMUNITY_PROFILES.map((p) => ({
        profile: p,
        score: 75,
        mutualMatches: p.topKinks,
      }));
    }

    return COMMUNITY_PROFILES.map((p) => {
      const report = generateReport('dating_sim', myResponses, p.baseResponses, profile ?? undefined, p);
      const mutualNames = report.items
        .filter((i) => i.section === 'mutual_match' || i.section === 'explore_together')
        .map((i) => i.activityName);

      return {
        profile: p,
        score: report.compatibilityScore,
        mutualMatches: mutualNames.length > 0 ? mutualNames : p.topKinks,
      };
    }).sort((a, b) => b.score - a.score);
  }, [profile]);

  const filtered = useMemo(() => {
    return rankedProfiles.filter(({ profile: p, score }) => {
      if (score < minScoreFilter) return false;

      if (fetlifeRoleFilter !== 'all') {
        const q = fetlifeRoleFilter.toLowerCase();
        const matchesRole = p.bio.toLowerCase().includes(q) || p.topKinks.some((k) => k.toLowerCase().includes(q));
        if (!matchesRole) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.nickname.toLowerCase().includes(q);
        const matchesBio = p.bio.toLowerCase().includes(q);
        const matchesKinks = p.topKinks.some((k) => k.toLowerCase().includes(q));
        if (!matchesName && !matchesBio && !matchesKinks) return false;
      }
      return true;
    });
  }, [rankedProfiles, minScoreFilter, fetlifeRoleFilter, searchQuery]);

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
      // Create a local session with initiator profile and target guest profile
      const session = await createLocalSession(profile.nickname, profile.baseResponses, profile);
      
      // Inject guest responses into session directly for instant report viewing
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

  return (
    <ScreenContainer title="Conexiones" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Conexiones</Text>
          <Text style={styles.subtitle}>
            Buscador por roles, compatibilidad y mensajería directa cifrada en dispositivo
          </Text>
        </View>

        {/* FetLife profile linker */}
        <View style={styles.fetlifeCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fetlifeCardTitle}>Integración FetLife</Text>
              <Text style={styles.fetlifeCardDesc}>
                FetLife no permite filtrar por roles complejos o compatibilidad. Vincula tu usuario de FetLife para verificar tu perfil.
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
            <TouchableOpacity
              style={styles.fetlifeVerifyBtn}
              onPress={() => {
                if (!userFetlifeHandle.trim()) {
                  Alert.alert('Ingresa tu Usuario', 'Escribe tu usuario o enlace de FetLife.');
                  return;
                }
                Alert.alert('Perfil FetLife vinculado', `Se ha verificado el perfil ${userFetlifeHandle}. Tus conexiones podrán ver tu insignia verificada.`);
              }}
            >
              <Text style={styles.fetlifeVerifyBtnText}>Vincular FetLife</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FetLife Advanced Role Search Bar */}
        <View style={styles.roleFilterSection}>
          <Text style={styles.filterSectionTitle}>🔍 Buscador Avanzado por Roles & Fetiches FetLife:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleScroll}>
            {[
              { id: 'all', label: '🌐 Todos los Roles' },
              { id: 'shibari', label: '🪢 Shibari / Rope Top/Bottom' },
              { id: 'bondage', label: '🔒 Bondage & Restricción' },
              { id: 'impacto', label: '⚡ Impacto & Spanking' },
              { id: 'keyholder', label: '🗝️ Keyholder / Castidad' },
              { id: 'sensorial', label: '🕯️ Sensorial & Cera' },
              { id: 'afectivo', label: '🪷 Aftercare & Afectivo' },
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
            <Text style={styles.warningTitle}>⚠️ Cuestionario Incompleto</Text>
            <Text style={styles.warningText}>
              Responde tu cuestionario base para calcular el % de compatibilidad exacto con cada perfil.
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
            placeholder="Buscar por nick, ubicación o kink (ej: Shibari, D/s, Cera)..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters Row */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Filtrar por Match:</Text>
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
          {filtered.map(({ profile: item, score, mutualMatches }) => (
            <View key={item.id} style={styles.profileCard}>
              {/* Top Row: Avatar, Info & Match Score */}
              <View style={styles.cardHeaderRow}>
                <Text style={styles.avatarEmoji}>{item.avatarEmoji}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.nickname}>{item.nickname}</Text>
                    <Text style={styles.ageText}>{item.age}y</Text>
                  </View>
                  <Text style={styles.metaText}>
                    {item.pronouns ? `${item.pronouns} · ` : ''}{item.location}
                  </Text>
                  <Text style={styles.expBadge}>
                    {EXPERIENCE_LABELS[item.experienceLevel ?? 'intermediate']}
                  </Text>
                </View>

                {/* Score Pill */}
                <View
                  style={[
                    styles.scorePill,
                    score >= 80 ? styles.scoreHigh : score >= 60 ? styles.scoreMed : styles.scoreLow,
                  ]}
                >
                  <Text style={styles.scoreNumber}>{score}%</Text>
                  <Text style={styles.scoreText}>Match</Text>
                </View>
              </View>

              {/* Bio */}
              <Text style={styles.bioText}>{item.bio}</Text>

              {/* Mutual Kinks / Top Matches */}
              <View style={styles.kinksSection}>
                <Text style={styles.kinksLabel}>🔥 Intereses en común / Favoritos:</Text>
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
                  <Text style={styles.chatBtnText}>Enviar mensaje</Text>
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
                    <Text style={styles.chatModalSub}>Mensajería directa (bóveda)</Text>
                  </View>
                  <TouchableOpacity onPress={() => setMessagingTarget(null)} style={styles.closeX}>
                    <Text style={styles.closeXText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <VaultLockGate
                  title="Mensajes cifrados"
                  subtitle="Desbloquea la bóveda para leer y enviar DMs almacenados en este dispositivo."
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
                          Inicia la conversación con {messagingTarget.nickname}. Propón una escena o consulta safewords.
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
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  containerDesktop: {
    maxWidth: 760,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    gap: 4,
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
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
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  filterChipTextActive: { color: '#fff' },

  feed: { gap: spacing.md, paddingTop: spacing.xs },

  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    gap: spacing.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarEmoji: { fontSize: 44 },
  nickname: { color: colors.primary, fontSize: fontSize.lg, fontWeight: '900' },
  ageText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600' },
  metaText: { color: colors.textMuted, fontSize: fontSize.xs },
  expBadge: { color: colors.accent, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },

  scorePill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.lg,
    borderWidth: 1.5,
  },
  scoreHigh: { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderColor: colors.success },
  scoreMed: { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: colors.info },
  scoreLow: { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderColor: colors.warning },
  scoreNumber: { color: colors.text, fontSize: fontSize.lg, fontWeight: '900' },
  scoreText: { color: colors.textMuted, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },

  bioText: { color: colors.text, fontSize: fontSize.sm, lineHeight: 20 },

  kinksSection: { gap: 4 },
  kinksLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  kinkChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  kinkChip: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  kinkChipText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '600' },

  actionsRow: { marginTop: 4, gap: spacing.xs },
  connectBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  connectBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: '800' },
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
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  chatModalCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 480,
    height: '75%',
    borderWidth: 1.5,
    borderColor: colors.primary,
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
  chatModalTitle: { color: colors.primary, fontSize: fontSize.md, fontWeight: '800' },
  chatModalSub: { color: colors.textMuted, fontSize: fontSize.xs },
  closeX: {
    padding: 6,
  },
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
    backgroundColor: colors.primaryDark,
    borderBottomRightRadius: 4,
  },
  chatBubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceLight,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatSender: { color: colors.primaryLight, fontSize: 10, fontWeight: '700' },
  chatText: { color: colors.text, fontSize: fontSize.sm, lineHeight: 18 },
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
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  sendBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },

  // FetLife Integration Styles
  fetlifeCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  fetlifeCardTitle: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '900' },
  fetlifeCardDesc: { color: colors.text, fontSize: fontSize.xs, lineHeight: 16 },

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
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.md,
    justifyContent: 'center',
  },
  fetlifeVerifyBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },

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
  roleChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  roleChipTextActive: { color: '#fff' },
});
