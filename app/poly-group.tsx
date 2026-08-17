import React, { useState, useEffect } from 'react';
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
import { listMyLocalSessions, getCurrentProfile } from '@/lib/storage';
import { Session, UserProfile } from '@/types';
import { calculatePolyGroupReport, generatePolyMarkdownReport, GroupParticipant } from '@/lib/polyCompatibility';
import { PolyParticipantSelector } from '@/components/poly/PolyParticipantSelector';
import { PolyPairwiseMatrix } from '@/components/poly/PolyPairwiseMatrix';
import { PolyGroupConsensusList } from '@/components/poly/PolyGroupConsensusList';

export default function PolyGroupScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await getCurrentProfile();
      setProfile(p);
      const all = await listMyLocalSessions();
      const completeSessions = all.filter((s) => s.status === 'complete');
      setSessions(completeSessions);
      setSelectedSessionIds(completeSessions.map((s) => s.id));
    })();
  }, []);

  const toggleSelectSession = (id: string) => {
    setSelectedSessionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedSessions = sessions.filter((s) => selectedSessionIds.includes(s.id));

  // Build group participants list: Host (user) + Selected Guests
  const participants: GroupParticipant[] = [
    {
      name: profile?.nickname || 'Tú',
      responses: profile?.baseResponses ?? [],
    },
    ...selectedSessions.map((s) => ({
      name: s.guestNickname || s.guestProfile?.nickname || 'Pareja',
      responses: s.guestResponses ?? [],
    })),
  ];

  const polyReport = calculatePolyGroupReport(participants);

  const handleCopyMarkdown = () => {
    const md = generatePolyMarkdownReport(polyReport);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('¡Copiado! 📋', 'Reporte grupal en Markdown copiado al portapapeles.');
    }
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Matriz Grupal & Poliamor (3+ personas)</Text>
          <Text style={styles.subtitle}>
            Cruza la compatibilidad erótica simultánea entre 3 o más participantes (triadas, quirks o dinámicas de grupo)
          </Text>
        </View>

        {/* Selection Bar */}
        <PolyParticipantSelector
          sessions={sessions}
          selectedSessionIds={selectedSessionIds}
          onToggleSession={toggleSelectSession}
          userNickname={profile?.nickname || 'Tú'}
        />

        {/* Group Matrix Display */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {selectedSessions.length < 1 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 44 }}>👥</Text>
              <Text style={styles.emptyTitle}>Selecciona al menos 1 pareja adicional</Text>
              <Text style={styles.emptyText}>
                Necesitas tener al menos 1 o 2 sesiones completas para calcular la matriz de compatibilidad grupal de 3+ integrantes.
              </Text>
            </View>
          ) : (
            <View style={styles.matrixCard}>
              <View style={styles.matrixHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.matrixTitle}>
                    🌐 Matriz Grupal ({participants.length} Participantes)
                  </Text>
                  <Text style={styles.matrixSub}>
                    Integrantes: <Text style={{ color: colors.primary }}>{participants.map((p) => p.name).join(', ')}</Text>
                  </Text>
                </View>

                <TouchableOpacity style={styles.exportBtn} onPress={handleCopyMarkdown} activeOpacity={0.8}>
                  <Text style={styles.exportBtnText}>{copied ? '✓ Copiado' : '📄 Exportar MD'}</Text>
                </TouchableOpacity>
              </View>

              {/* Group Score Pill */}
              <View style={styles.overallScoreBanner}>
                <Text style={styles.overallScoreNum}>{polyReport.overallGroupConsensusScore}%</Text>
                <Text style={styles.overallScoreLabel}>Compatibilidad Promedio del Grupo</Text>
              </View>

              {/* Pairwise Cross Scores */}
              <PolyPairwiseMatrix pairwiseScores={polyReport.pairwiseScores} />

              {/* Unanimous & Hard Limit Consensus */}
              <PolyGroupConsensusList
                unanimousMatches={polyReport.unanimousMatches}
                groupHardLimits={polyReport.groupHardLimits}
                exploreTogetherItems={polyReport.exploreTogetherItems}
              />
            </View>
          )}
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },
  matrixCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.md,
  },
  matrixHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  matrixTitle: { color: colors.primary, fontFamily: fonts.displaySemi, fontSize: fontSize.md },
  matrixSub: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSize.xs, marginTop: 2 },

  exportBtn: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  exportBtnText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  overallScoreBanner: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  overallScoreNum: {
    color: colors.primary,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xxl,
  },
  overallScoreLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyTitle: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.lg },
  emptyText: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSize.sm, textAlign: 'center', maxWidth: 360 },
});
