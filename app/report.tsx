import { useEffect, useState, useMemo, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { ReportCard } from '@/components/ReportCard';
import { CompatibilityInfographic } from '@/components/CompatibilityInfographic';
import { SocialShareModal } from '@/components/SocialShareModal';
import { ScenePlannerModal } from '@/components/ScenePlannerModal';
import { colors, fontSize, spacing } from '@/constants/theme';
import { generateReport } from '@/lib/compatibility';
import { getSessionByToken, refreshSession } from '@/lib/sessions';
import { getInitiatorToken, getGuestProfile, getSceneAgreements } from '@/lib/storage';
import {
  CompatibilityReport,
  GuestProfile,
  ReportItem,
  ReportSectionType,
  SceneAgreement,
  SECTION_DESCRIPTIONS,
  SECTION_LABELS,
} from '@/types';

const SECTION_ORDER: ReportSectionType[] = [
  'mutual_match',
  'explore_together',
  'role_mismatch',
  'guest_only',
  'initiator_only',
  'hard_limit_conflict',
];

export default function ReportScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const [guestName, setGuestName] = useState<string>('Invitado');
  const [loading, setLoading] = useState(true);

  // New Modals State
  const [showShareModal, setShowShareModal] = useState(false);
  const [planningItem, setPlanningItem] = useState<ReportItem | null>(null);
  const [agreements, setAgreements] = useState<SceneAgreement[]>([]);

  const loadAgreements = useCallback(async (sessionId: string) => {
    const list = await getSceneAgreements(sessionId);
    setAgreements(list);
  }, []);

  useEffect(() => {
    (async () => {
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

      setLoading(false);
    })();
  }, [params.token, router, loadAgreements]);

  const grouped = useMemo(() => {
    if (!report) return [];
    return SECTION_ORDER.map((section) => ({
      section,
      items: report.items.filter((i) => i.section === section),
    })).filter((g) => g.items.length > 0);
  }, [report]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Generando reporte...</Text>
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
        <View style={styles.summary}>
          <Text style={styles.score}>{report.compatibilityScore}%</Text>
          <Text style={styles.scoreLabel}>Compatibilidad general</Text>
          <View style={styles.stats}>
            <Stat value={report.mutualMatchCount} label="Matches" color={colors.success} />
            <Stat value={report.exploreCount} label="Explorar" color={colors.info} />
            <Stat value={report.conflictCount} label="Atención" color={colors.warning} />
          </View>

          {/* Export PDF and Social Share Triggers */}
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs, flexWrap: 'wrap', justifyContent: 'center' }}>
            <TouchableOpacity
              style={styles.shareCardTrigger}
              onPress={() => setShowShareModal(true)}
            >
              <Text style={styles.shareCardTriggerText}>📸 Tarjeta Infografía</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareCardTrigger, { borderColor: colors.secondary, backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}
              onPress={() => {
                import('@/lib/exportPDF').then(({ exportReportAsPDF }) => {
                  exportReportAsPDF(report, 'Tú', guestName);
                });
              }}
            >
              <Text style={[styles.shareCardTriggerText, { color: '#60a5fa' }]}>📄 Exportar PDF</Text>
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

        <CompatibilityInfographic
          report={report}
          initiatorName="Tú"
          guestName={guestName}
        />

        <Text style={styles.guestNote}>
          Reporte privado vs. {guestName}. Solo tú ves las secciones marcadas como privadas.
        </Text>

        {grouped.map(({ section, items }) => (
          <View key={section} style={styles.section}>
            <Text style={styles.sectionTitle}>{SECTION_LABELS[section]}</Text>
            <Text style={styles.sectionDesc}>{SECTION_DESCRIPTIONS[section]}</Text>
            {items.map((item) => (
              <ReportCard
                key={item.activityId}
                item={item}
                showInitiatorOnly
                onPlanScene={(selectedItem) => setPlanningItem(selectedItem)}
                hasAgreement={agreedActivityIds.has(item.activityId)}
              />
            ))}
          </View>
        ))}

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
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
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
    fontWeight: '800',
  },
  scoreLabel: {
    color: colors.textMuted,
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
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: spacing.xs,
  },
  shareCardTriggerText: {
    color: colors.primaryLight,
    fontWeight: '700',
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
});
