import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, Alert, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { VaultLockGate } from '@/components/VaultLockGate';
import { ReportCard } from '@/components/ReportCard';
import { CompatibilityInfographic } from '@/components/CompatibilityInfographic';
import { ShareableMatchCardModal } from '@/components/report/ShareableMatchCardModal';
import { IcebreakerModal } from '@/components/report/IcebreakerModal';
import { ReportAISummaryCard } from '@/components/report/ReportAISummaryCard';
import { ScenePlannerModal } from '@/components/ScenePlannerModal';
import { SceneRouletteModal } from '@/components/SceneRouletteModal';
import { SceneTimerModal } from '@/components/SceneTimerModal';
import { SceneDebriefModal } from '@/components/SceneDebriefModal';
import { ConversationGuideModal } from '@/components/ConversationGuideModal';
import { SkeletonCardGroup } from '@/components/SkeletonLoader';
import { ReportAnalysisLoader } from '@/components/feedback/ReportAnalysisLoader';
import { NoxHost } from '@/components/nox';
import { colors, fontSize, spacing } from '@/constants/theme';
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
  CATEGORY_LABELS,
} from '@/types';
import { getActivityById } from '@/data/activities';
import { ReportScoreHeader } from '@/components/report/ReportScoreHeader';
import { ReportActionsBar } from '@/components/report/ReportActionsBar';
import { ReportMoodFilter } from '@/components/report/ReportMoodFilter';
import { RadarChart } from '@/components/report/RadarChart';
import { useTranslation } from '@/lib/i18n';
import { getSectionLabel } from '@/lib/localeLabels';

const SECTION_ORDER: ReportSectionType[] = [
  'hard_limit_conflict',
  'mutual_match',
  'explore_together',
  'role_mismatch',
  'guest_only',
  'initiator_only',
];

export default function ReportScreen() {
  const { t } = useTranslation();
  const { isDesktop } = useResponsive();
  const params = useLocalSearchParams<{ token?: string; selfMode?: string }>();
  const router = useRouter();
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const [guestName, setGuestName] = useState<string>('Invitado');
  const [loading, setLoading] = useState(true);
  const isSelfMode = params.selfMode === 'true';

  // Mood filter state
  const [selectedMood, setSelectedMood] = useState<'all' | ActivityMood>('all');

  // Modals State
  const [showShareModal, setShowShareModal] = useState(false);
  const [showIcebreakerModal, setShowIcebreakerModal] = useState(false);
  const [showRouletteModal, setShowRouletteModal] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
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

      const hasGuest = session.status === 'complete' && session.guestResponses;

      if (!hasGuest && !isSelfMode) {
        Alert.alert(
          'Aún no hay reporte de pareja',
          'Espera a que la otra persona complete el cuestionario, o explora tus propios gustos.',
          [
            { text: 'Ver Mis Propios Resultados 📊', onPress: () => router.replace({ pathname: '/report', params: { token, selfMode: 'true' } }) },
            { text: 'Compartir Invitación 🔗', onPress: () => router.replace({ pathname: '/invite', params: { token } }) },
          ]
        );
        setLoading(false);
        return;
      }

      const effectiveGuestResponses = isSelfMode && !session.guestResponses
        ? session.initiatorResponses
        : (session.guestResponses || session.initiatorResponses);

      setGuestName(
        isSelfMode
          ? 'Mi Perfil (Auto-Exploración)'
          : (session.guestNickname ?? session.guestProfile?.nickname ?? 'Invitado')
      );

      const rep = generateReport(
        session.id,
        session.initiatorResponses,
        effectiveGuestResponses,
        session.initiatorProfile,
        isSelfMode ? session.initiatorProfile : session.guestProfile
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
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ReportAnalysisLoader
          initiatorName="Tú"
          guestName={guestName || 'Pareja'}
        />
      </SafeAreaView>
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
          <NoxHost scene="report" variant="compact" />

          <ReportScoreHeader
            report={report}
            displayScore={displayScore}
            confettiOpacity={confettiOpacity}
            guestProfile={guestProfile}
            guestName={guestName}
            isDesktop={isDesktop}
          >
            <ReportActionsBar
              report={report}
              guestName={guestName}
              onShowGuide={() => setShowGuideModal(true)}
              onShowIcebreakers={() => setShowIcebreakerModal(true)}
              onShowRoulette={() => setShowRouletteModal(true)}
              onShowShare={() => setShowShareModal(true)}
              onShowTimer={() => setShowTimerModal(true)}
              isDesktop={isDesktop}
            />
          </ReportScoreHeader>

          {/* AI1 & AI2: Natural Language Summary & Next Steps */}
          <ReportAISummaryCard report={report} guestName={guestName} />

          {report.categoryCompatibilities && (
            <View style={styles.radarContainer}>
              <Text style={styles.radarTitle}>Mapa de Compatibilidad por Categoría</Text>
              <RadarChart
                data={Object.entries(report.categoryCompatibilities).map(([cat, score]) => ({
                  category: cat,
                  label: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat,
                  initiatorScore: score,
                  guestScore: score,
                }))}
                size={320}
                showLegend={!isSelfMode}
              />
            </View>
          )}

          <CompatibilityInfographic
            report={report}
            initiatorName="Tú"
            guestName={guestName}
          />

          <ReportMoodFilter
            selectedMood={selectedMood}
            onSelectMood={setSelectedMood}
          />

          {grouped.length === 0 ? (
            <View style={styles.emptyMoodBox}>
              <Text style={styles.emptyMoodText}>
                No hay actividades que coincidan con el ambiente "{MOOD_LABELS[selectedMood as ActivityMood]?.label ?? selectedMood}".
              </Text>
            </View>
          ) : (
            grouped.map(({ section, items }) => (
              <View key={section} style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{getSectionLabel(section)}</Text>
                <Text style={styles.sectionDesc}>{SECTION_DESCRIPTIONS[section]}</Text>

                <View style={styles.grid}>
                  {items.map((item) => (
                    <View key={item.activityId} style={styles.gridItem}>
                      <ReportCard
                        item={item}
                        hasAgreement={agreedActivityIds.has(item.activityId)}
                        onPlanScene={() => setPlanningItem(item)}
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
          <ShareableMatchCardModal
            visible={showShareModal}
            onClose={() => setShowShareModal(false)}
            report={report}
            initiatorName="Tú"
            guestName={guestName}
          />

          <IcebreakerModal
            visible={showIcebreakerModal}
            onClose={() => setShowIcebreakerModal(false)}
            report={report}
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

          <ConversationGuideModal
            visible={showGuideModal}
            onClose={() => setShowGuideModal(false)}
            report={report}
          />

          {debriefItem && report ? (
            <SceneDebriefModal
              visible={!!debriefItem}
              onClose={() => setDebriefItem(null)}
              sessionId={report.sessionId}
              activityId={debriefItem.activityId}
              activityName={debriefItem.activityName}
            />
          ) : null}
        </VaultLockGate>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  muted: { color: colors.textMuted, fontSize: fontSize.md },
  btn: { marginTop: spacing.md },
  sectionContainer: { marginBottom: spacing.xl },
  sectionTitle: {
    color: colors.primary,
    fontSize: fontSize.lg,
    marginBottom: 2,
  },
  sectionDesc: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  grid: { gap: spacing.md },
  gridItem: { width: '100%' },
  emptyMoodBox: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  radarContainer: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  radarTitle: {
    color: colors.primary,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  emptyMoodText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
