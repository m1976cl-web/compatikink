import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, fontSize, spacing, fonts, radii, glowShadowPrimary } from '@/constants/theme';
import { CompatibilityReport } from '@/types';
import { generateReportAISummary, AIReportAnalysis, AINextStep } from '@/lib/aiReportInsights';
import { triggerLightHaptic, triggerSuccessHaptic } from '@/lib/haptics';

interface Props {
  report: CompatibilityReport;
  guestName?: string;
}

export function ReportAISummaryCard({ report, guestName }: Props) {
  const [analysis, setAnalysis] = useState<AIReportAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSteps, setShowSteps] = useState(false);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const res = await generateReportAISummary(report, guestName);
      setAnalysis(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, [report.sessionId]);

  const handleShareAnalysis = async () => {
    if (!analysis) return;
    triggerLightHaptic();
    const text =
      `🤖 Análisis de Compatibilidad con IA\n\n` +
      `"${analysis.summary}"\n\n` +
      `✨ Fortalezas: ${analysis.strengths.join(', ')}\n` +
      `💡 Consejo: ${analysis.conversationTip}\n\n` +
      `🔒 Generado de forma segura y Zero-Knowledge en CompatKink.`;

    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'Análisis de Compatibilidad', text });
      } else {
        await Share.share({ title: 'Análisis de Compatibilidad', message: text });
      }
      triggerSuccessHaptic();
    } catch {}
  };

  if (loading) {
    return (
      <View style={styles.cardLoading}>
        <ActivityIndicator color={colors.primary} size="small" />
        <Text style={styles.loadingText}>Generando análisis inteligente del vínculo...</Text>
      </View>
    );
  }

  if (!analysis) return null;

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>🤖 SÍNTESIS INTELIGENTE (AI1 & AI2)</Text>
        </View>

        <TouchableOpacity onPress={handleShareAnalysis} style={styles.shareBtn}>
          <Text style={{ fontSize: 14 }}>📤</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.cardTitle}>Lectura Narrativa de su Conexión</Text>
      <Text style={styles.summaryBody}>{analysis.summary}</Text>

      {/* Strengths & Exploration Row */}
      <View style={styles.pillsContainer}>
        {analysis.strengths.length > 0 && (
          <View style={styles.pillGroup}>
            <Text style={styles.pillGroupLabel}>✨ Fortalezas Clave:</Text>
            <View style={styles.tagsRow}>
              {analysis.strengths.map((str, idx) => (
                <View key={idx} style={[styles.pill, styles.pillStrength]}>
                  <Text style={styles.pillStrengthText}>{str}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {analysis.explorationZones.length > 0 && (
          <View style={styles.pillGroup}>
            <Text style={styles.pillGroupLabel}>🔍 Zonas para Dialogar:</Text>
            <View style={styles.tagsRow}>
              {analysis.explorationZones.map((zone, idx) => (
                <View key={idx} style={[styles.pill, styles.pillExploration]}>
                  <Text style={styles.pillExplorationText}>{zone}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Conversation Tip Box */}
      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>💡 Consejo para la Conversación:</Text>
        <Text style={styles.tipBody}>{analysis.conversationTip}</Text>
      </View>

      {/* Suggested Next Steps (AI2) */}
      <TouchableOpacity
        style={styles.stepsToggleBtn}
        onPress={() => {
          triggerLightHaptic();
          setShowSteps(!showSteps);
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.stepsToggleText}>
          {showSteps ? '▲ Ocultar Próximos Pasos' : '🚀 Ver 3 Próximos Pasos Sugeridos por IA ▼'}
        </Text>
      </TouchableOpacity>

      {showSteps && (
        <View style={styles.stepsList}>
          {analysis.suggestedSteps.map((step) => (
            <View key={step.id} style={styles.stepItemCard}>
              <View style={styles.stepTopRow}>
                <View style={styles.stepNumBadge}>
                  <Text style={styles.stepNumText}>Paso {step.stepNumber}</Text>
                </View>
                <Text style={styles.stepTimeText}>⏱️ {step.estimatedMinutes} min</Text>
                <View style={styles.diffBadge}>
                  <Text style={styles.diffText}>{step.difficulty}</Text>
                </View>
              </View>

              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.description}</Text>

              <View style={styles.stepAdviceBox}>
                <Text style={styles.stepAdviceText}>🛡️ {step.safetyAdvice}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardLoading: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.xs,
  },
  loadingText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.4)',
    marginVertical: spacing.xs,
    gap: spacing.xs,
    ...glowShadowPrimary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiBadge: {
    backgroundColor: 'rgba(192, 132, 252, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  aiBadgeText: {
    color: colors.primary,
    fontSize: 9,
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.5,
  },
  shareBtn: {
    padding: 4,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    marginTop: 2,
  },
  summaryBody: {
    color: '#e4e4e7',
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    lineHeight: 19,
  },
  pillsContainer: {
    gap: spacing.xs,
    marginTop: 4,
  },
  pillGroup: {
    gap: 4,
  },
  pillGroupLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: fonts.bodyBold,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  pillStrength: {
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderColor: '#4ade80',
  },
  pillStrengthText: {
    color: '#4ade80',
    fontSize: 10,
    fontFamily: fonts.bodySemi,
  },
  pillExploration: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderColor: '#fbbf24',
  },
  pillExplorationText: {
    color: '#fbbf24',
    fontSize: 10,
    fontFamily: fonts.bodySemi,
  },
  tipBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radii.lg,
    padding: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginVertical: 4,
    gap: 2,
  },
  tipTitle: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
  tipBody: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
  },
  stepsToggleBtn: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 8,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  stepsToggleText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  stepsList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  stepItemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: radii.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  stepTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepNumBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  stepNumText: {
    color: '#000',
    fontFamily: fonts.bodyBold,
    fontSize: 9,
  },
  stepTimeText: {
    color: colors.textMuted,
    fontSize: 9,
  },
  diffBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  diffText: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily: fonts.bodyBold,
  },
  stepTitle: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  stepDesc: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
  },
  stepAdviceBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    padding: 4,
    borderRadius: 4,
    marginTop: 2,
  },
  stepAdviceText: {
    color: '#38bdf8',
    fontSize: 9,
  },
});
