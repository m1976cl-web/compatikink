import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, Alert, TouchableOpacity, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { VaultLockGate } from '@/components/VaultLockGate';
import { ReportCard } from '@/components/ReportCard';
import { CompatibilityInfographic } from '@/components/CompatibilityInfographic';
import { SocialShareModal } from '@/components/SocialShareModal';
import { ScenePlannerModal } from '@/components/ScenePlannerModal';
import { SceneRouletteModal } from '@/components/SceneRouletteModal';
import { SceneTimerModal } from '@/components/SceneTimerModal';
import { SceneDebriefModal } from '@/components/SceneDebriefModal';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { generateReport } from '@/lib/compatibility';
import { getSessionByToken, refreshSession } from '@/lib/sessions';
import { getInitiatorToken, getGuestProfile, getSceneAgreements, getWishlist, toggleWishlist, WishlistItem } from '@/lib/storage';
import { VaultLockGateAPI } from '@/lib/cryptoVault';
import {
  ActivityMood,
  CompatibilityReport,
  GuestProfile,
  MOOD_LABELS,
  ReportItem,
  ReportSectionType,
  SceneAgreement,
  SECTION_DESCRIPTIONS,
  SECTION_LABELS,
} from '@/types';
import { getActivityById } from '@/data/activities';

const SECTION_ORDER: ReportSectionType[] = [
  'mutual_match',
  'explore_together',
  'role_mismatch',
  'guest_only',
  'initiator_only',
  'hard_limit_conflict',
];

export default function ReportScreen() {
  const { isDesktop } = useResponsive();
  const params = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const [guestName, setGuestName] = useState<string>('Invitado');
  const [loading, setLoading] = useState(true);

  // Mood filter state
  const [selectedMood, setSelectedMood] = useState<'all' | ActivityMood>('all');

  // New Modals State
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRouletteModal, setShowRouletteModal] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [debriefItem, setDebriefItem] = useState<{ activityId: string; activityName: string } | null>(null);
  const [planningItem, setPlanningItem] = useState<ReportItem | null>(null);
  const [agreements, setAgreements] = useState<SceneAgreement[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [unlocked, setUnlocked] = useState(() => VaultLockGateAPI.isUnlocked());

  const loadWishlist = useCallback(async () => {
    const list = await getWishlist();
    setWishlist(list);
  }, []);

  // Animated score
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const [displayScore, setDisplayScore] = useState(0);
  const confettiOpacity = useRef(new Animated.Value(0)).current;
  const cardFadeAnims = useRef<Animated.Value[]>([]).current;

  const loadAgreements = useCallback(async (sessionId: string) => {
    const list = await getSceneAgreements(sessionId);
    setAgreements(list);
  }, []);

  useEffect(() => VaultLockGateAPI.subscribe((s) => setUnlocked(s.unlocked)), []);

  useEffect(() => {
    if (!unlocked) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const token = params.token ?? (await getInitiatorToken());
      if (!token) {
        setLoading(false);
        return;
      }
      let session = await getSessionByToken(token);
      if (session) {
        session = (await refreshSession(session)) ?? session;
      }
      if (!session) {
        setLoading(false);
        return;
      }
      if (session.status !== 'complete' || !session.guestResponses) {
        Alert.alert(
          'Aún no hay reporte',
          'Espera a que la otra persona complete el cuestionario.',
          [{ text: 'OK', onPress: () => router.replace({ pathname: '/invite', params: { token } }) }]
        );
        setLoading(false);
        return;
      }
      setGuestName(session.guestNickname ?? session.guestProfile?.nickname ?? 'Invitado');
      const rep = generateReport(
        session.id,
        session.initiatorResponses,
        session.guestResponses,
        session.initiatorProfile,
        session.guestProfile
      );
      setReport(rep);
      const gp = await getGuestProfile(session.id);
      setGuestProfile(gp);

      await loadAgreements(session.id);
      await loadWishlist();

      // Animate score
      const finalScore = rep.compatibilityScore;
      scoreAnim.setValue(0);
      Animated.timing(scoreAnim, {
        toValue: finalScore,
        duration: 1400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      const listenerId = scoreAnim.addListener(({ value }) => {
        setDisplayScore(Math.round(value));
      });

      // Confetti for high scores
      if (finalScore > 80) {
        Animated.sequence([
          Animated.delay(800),
          Animated.timing(confettiOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
          }),
          Animated.delay(2500),
          Animated.timing(confettiOpacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
          }),
        ]).start();
      }

      setLoading(false);

      return () => scoreAnim.removeListener(listenerId);
    })();
  }, [params.token, router, loadAgreements, unlocked]);

  const filteredItems = useMemo(() => {
    if (!report) return [];
    if (selectedMood === 'all') return report.items;
    return report.items.filter((item) => {
      const act = getActivityById(item.activityId);
      return act?.moods?.includes(selectedMood);
    });
  }, [report, selectedMood]);

  const grouped = useMemo(() => {
    return SECTION_ORDER.map((section) => ({
      section,
      items: filteredItems.filter((i) => i.section === section),
    })).filter((g) => g.items.length > 0);
  }, [filteredItems]);

  if (!unlocked) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.center}>
          <VaultLockGate
            title="Reporte cifrado"
            subtitle="Desbloquea la bóveda para ver el análisis de compatibilidad."
            showLockButton={false}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Generando reporte…</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={styles.title}>Sin reporte</Text>
          <Text style={styles.muted}>Crea una sesión o espera a que respondan.</Text>
          <Button title="Volver al inicio" onPress={() => router.replace('/')} style={styles.btn} />
        </View>
      </SafeAreaView>
    );
  }

  const agreedActivityIds = new Set(agreements.map((a) => a.activityId));

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <VaultLockGate showLockButton>
        {isDesktop ? (
          <View style={styles.desktopSummaryContainer}>
            {/* Left Column: Overall Match % & Stats */}
            <View style={styles.desktopSummaryLeft}>
              <Text style={styles.score}>{displayScore}%</Text>
              <Text style={styles.scoreLabel}>Compatibilidad general</Text>
              <View style={styles.stats}>
                <Stat value={report.mutualMatchCount} label="Matches" color={colors.success} />
                <Stat value={report.exploreCount} label="Explorar" color={colors.info} />
                <Stat value={report.conflictCount} label="Atención" color={colors.warning} />
              </View>
            </View>

            {/* Right Column: Guest Private Profile & Action Triggers */}
            <View style={styles.desktopSummaryRight}>
              {guestProfile ? (
                <View style={styles.profileCardDesktop}>
                  <Text style={styles.profileHeader}>Ficha del Invitado (Privada)</Text>
                  <Text style={styles.profileTitle}>Apodo: {guestProfile.nickname}</Text>
                  {guestProfile.notes ? (
                    <Text style={styles.profileNotes}>Notas: {guestProfile.notes}</Text>
                  ) : null}
                </View>
              ) : (
                <View style={styles.profileCardDesktop}>
                  <Text style={styles.profileHeader}>Reporte con {guestName}</Text>
                  <Text style={styles.profileNotes}>Resultados generados basados en respuestas compartidas.</Text>
                </View>
              )}

              <View style={styles.actionsRowDesktop}>
                <TouchableOpacity
                  style={[styles.shareCardTrigger, { borderColor: colors.neonPurple, backgroundColor: 'rgba(192, 132, 252, 0.15)' }]}
                  onPress={() => setShowRouletteModal(true)}
                >
                  <Text style={[styles.shareCardTriggerText, { color: colors.neonPurple }]}>🎲 Ruleta de Citas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareCardTrigger}
                  onPress={() => setShowShareModal(true)}
                >
                  <Text style={styles.shareCardTriggerText}>📸 Tarjeta Infografía</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.shareCardTrigger, { borderColor: colors.info, backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}
                  onPress={() => {
                    import('@/lib/exportPDF').then(({ exportReportAsPDF }) => {
                      exportReportAsPDF(report, 'Tú', guestName);
                    });
                  }}
                >
                  <Text style={[styles.shareCardTriggerText, { color: '#60a5fa' }]}>📄 Exportar PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.shareCardTrigger, { borderColor: colors.warning, backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}
                  onPress={() => setShowTimerModal(true)}
                >
                  <Text style={[styles.shareCardTriggerText, { color: colors.warning }]}>⏱️ Temporizador</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.summary}>
              <Text style={styles.score}>{displayScore}%</Text>
              {/* Confetti overlay for high scores */}
              {report.compatibilityScore > 80 && (
                <Animated.View style={[styles.confettiOverlay, { opacity: confettiOpacity }]}>
                  <Text style={styles.confettiText}>🎉✨🔥💜✨🎉</Text>
                </Animated.View>
              )}
              <Text style={styles.scoreLabel}>Compatibilidad general</Text>
              <View style={styles.stats}>
                <Stat value={report.mutualMatchCount} label="Matches" color={colors.success} />
                <Stat value={report.exploreCount} label="Explorar" color={colors.info} />
                <Stat value={report.conflictCount} label="Atención" color={colors.warning} />
              </View>

              {/* Export PDF, Social Share and Scene Roulette Triggers */}
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs, flexWrap: 'wrap', justifyContent: 'center' }}>
                <TouchableOpacity
                  style={[styles.shareCardTrigger, { borderColor: colors.neonPurple, backgroundColor: 'rgba(192, 132, 252, 0.15)' }]}
                  onPress={() => setShowRouletteModal(true)}
                >
                  <Text style={[styles.shareCardTriggerText, { color: colors.neonPurple }]}>🎲 Ruleta de Citas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareCardTrigger}
                  onPress={() => setShowShareModal(true)}
                >
                  <Text style={styles.shareCardTriggerText}>📸 Tarjeta Infografía</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.shareCardTrigger, { borderColor: colors.info, backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}
                  onPress={() => {
                    import('@/lib/exportPDF').then(({ exportReportAsPDF }) => {
                      exportReportAsPDF(report, 'Tú', guestName);
                    });
                  }}
                >
                  <Text style={[styles.shareCardTriggerText, { color: '#60a5fa' }]}>📄 Exportar PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.shareCardTrigger, { borderColor: colors.warning, backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}
                  onPress={() => setShowTimerModal(true)}
                >
                  <Text style={[styles.shareCardTriggerText, { color: colors.warning }]}>⏱️ Temporizador</Text>
                </TouchableOpacity>
              </View>
            </View>

            {guestProfile ? (
              <View style={styles.profileCard}>
                <Text style={styles.profileHeader}>Ficha del Invitado (Privada)</Text>
                <Text style={styles.profileTitle}>Apodo: {guestProfile.nickname}</Text>
                {guestProfile.notes ? (
                  <Text style={styles.profileNotes}>Notas: {guestProfile.notes}</Text>
                ) : null}
              </View>
            ) : null}
          </>
        )}

        <CompatibilityInfographic
          report={report}
          initiatorName="Tú"
          guestName={guestName}
        />

        <Text style={styles.guestNote}>
          Reporte privado vs. {guestName}. Solo tú ves las secciones marcadas como privadas.
        </Text>

        {/* Mood Filter Chip Bar */}
        <View style={styles.moodFilterBar}>
          <Text style={styles.moodFilterTitle}>Filtrar por Ambiente / Mood:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodFilterChips}
          >
            <TouchableOpacity
              style={[styles.moodChip, selectedMood === 'all' && styles.moodChipActive]}
              onPress={() => setSelectedMood('all')}
            >
              <Text style={[styles.moodChipText, selectedMood === 'all' && styles.moodChipTextActive]}>
                Todas
              </Text>
            </TouchableOpacity>

            {(Object.keys(MOOD_LABELS) as ActivityMood[]).map((mKey) => {
              const info = MOOD_LABELS[mKey];
              const active = selectedMood === mKey;
              return (
                <TouchableOpacity
                  key={mKey}
                  style={[styles.moodChip, active && styles.moodChipActive]}
                  onPress={() => setSelectedMood(mKey)}
                >
                  <Text style={[styles.moodChipText, active && styles.moodChipTextActive]}>
                    {info.emoji} {info.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {grouped.length === 0 ? (
          <View style={styles.emptyMoodBox}>
            <Text style={styles.emptyMoodText}>
              No hay actividades registradas para este ambiente ({MOOD_LABELS[selectedMood as ActivityMood]?.label ?? 'seleccionado'}).
            </Text>
          </View>
        ) : (
          grouped.map(({ section, items }) => (
            <View key={section} style={styles.section}>
              <Text style={styles.sectionTitle}>{SECTION_LABELS[section]}</Text>
              <Text style={styles.sectionDesc}>{SECTION_DESCRIPTIONS[section]}</Text>
              <View style={isDesktop ? styles.cardGridDesktop : undefined}>
                {items.map((item) => (
                  <View key={item.activityId} style={isDesktop ? styles.cardGridItemDesktop : undefined}>
                    <ReportCard
                      item={item}
                      showInitiatorOnly
                      onPlanScene={(selectedItem) => setPlanningItem(selectedItem)}
                      hasAgreement={agreedActivityIds.has(item.activityId)}
                      isWishlisted={wishlist.some((w) => w.activityId === item.activityId)}
                      onToggleWishlist={async (targetItem) => {
                        await toggleWishlist({
                          activityId: targetItem.activityId,
                          activityName: targetItem.activityName,
                          category: targetItem.category,
                        });
                        await loadWishlist();
                      }}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))
        )}

        <Button
          title="Compartir resultados con ellos"
          onPress={() =>
            router.push({ pathname: '/share', params: { token: params.token ?? '' } })
          }
        />
        <Button title="Volver al inicio" onPress={() => router.replace('/')} variant="ghost" />

        {/* Modals */}
        <SocialShareModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          report={report}
          initiatorName="Tú"
          guestName={guestName}
        />

        <ScenePlannerModal
          visible={Boolean(planningItem)}
          onClose={() => setPlanningItem(null)}
          sessionId={report.sessionId}
          item={planningItem}
          onSaved={() => loadAgreements(report.sessionId)}
        />
        <SceneRouletteModal
          visible={showRouletteModal}
          onClose={() => setShowRouletteModal(false)}
          report={report}
          onSelectForPlanning={(selectedItem: ReportItem) => {
            setShowRouletteModal(false);
            setPlanningItem(selectedItem);
          }}
        />

        <SceneTimerModal
          visible={showTimerModal}
          onClose={() => setShowTimerModal(false)}
          activityName={planningItem?.activityName ?? 'Escena en Curso'}
          onSceneEnded={() => {
            setShowTimerModal(false);
            if (planningItem && report) {
              setDebriefItem({ activityId: planningItem.activityId, activityName: planningItem.activityName });
            }
          }}
        />

        {debriefItem && report ? (
          <SceneDebriefModal
            visible={!!debriefItem}
            onClose={() => setDebriefItem(null)}
            sessionId={report.sessionId}
            activityId={debriefItem.activityId}
            activityName={debriefItem.activityName}
            onSaved={() => setDebriefItem(null)}
          />
        ) : null}
        </VaultLockGate>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    maxWidth: 1140,
    alignSelf: 'center',
    width: '100%',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  desktopSummaryContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 24,
    alignItems: 'center',
  },
  desktopSummaryLeft: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingRight: spacing.lg,
  },
  desktopSummaryRight: {
    flex: 1,
    gap: spacing.md,
  },
  profileCardDesktop: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionsRowDesktop: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  cardGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cardGridItemDesktop: {
    width: '48.5%',
  },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  score: {
    color: colors.primary,
    fontSize: 48,
    fontFamily: fonts.display,
  },
  scoreLabel: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    marginBottom: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.md,
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: fontSize.xl, fontWeight: '700' },
  statLabel: { color: colors.textMuted, fontSize: fontSize.sm },
  shareCardTrigger: {
    backgroundColor: colors.accentSoft,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: spacing.xs,
  },
  shareCardTriggerText: {
    color: colors.primary,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
  },
  guestNote: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDesc: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  muted: { color: colors.textMuted, textAlign: 'center' },
  btn: { marginTop: spacing.lg },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileHeader: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  profileTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileNotes: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  moodFilterBar: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  moodFilterTitle: {
    color: colors.primaryLight,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  moodFilterChips: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: 4,
  },
  moodChip: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moodChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
  },
  moodChipText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  moodChipTextActive: {
    color: colors.neonPurple,
    fontWeight: '700',
  },
  emptyMoodBox: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyMoodText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  confettiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  confettiText: {
    fontSize: 36,
    textAlign: 'center',
    letterSpacing: 8,
  },
});
