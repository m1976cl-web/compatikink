import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { ShibariKnot } from '@/data/shibariData';

interface Props {
  knot: ShibariKnot;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onBackToCatalog: () => void;
}

export function KnotInstructionStepper({
  knot,
  currentStepIndex,
  onStepChange,
  onBackToCatalog,
}: Props) {
  const currentStep = knot.steps[currentStepIndex];

  return (
    <View style={styles.knotDetailCard}>
      <TouchableOpacity onPress={onBackToCatalog} style={styles.backCatalogBtn}>
        <Text style={styles.backCatalogBtnText}>← Volver al Catálogo de Nudos</Text>
      </TouchableOpacity>

      <Text style={styles.knotTitle}>{knot.name} ({knot.japaneseName})</Text>
      <Text style={styles.knotDesc}>{knot.description}</Text>

      {/* Step Stepper Header */}
      <View style={styles.stepperHeader}>
        <Text style={styles.stepCounterText}>
          Paso {currentStepIndex + 1} de {knot.steps.length}: {currentStep.title}
        </Text>

        <View style={styles.stepperDots}>
          {knot.steps.map((_, idx) => (
            <View
              key={idx}
              style={[styles.stepperDot, currentStepIndex === idx && styles.stepperDotActive]}
            />
          ))}
        </View>
      </View>

      {/* Step Content Box */}
      <View style={styles.stepBox}>
        <Text style={styles.stepInstructionText}>{currentStep.instruction}</Text>

        {currentStep.tip ? (
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>💡 Consejo Pro: {currentStep.tip}</Text>
          </View>
        ) : null}

        {currentStep.safetyCheck ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>⚠️ Verificación de Seguridad: {currentStep.safetyCheck}</Text>
          </View>
        ) : null}
      </View>

      {/* Stepper Navigation Buttons */}
      <View style={styles.stepperNavRow}>
        <TouchableOpacity
          style={[styles.navBtn, currentStepIndex === 0 && styles.navBtnDisabled]}
          onPress={() => onStepChange(Math.max(0, currentStepIndex - 1))}
          disabled={currentStepIndex === 0}
        >
          <Text style={styles.navBtnText}>← Paso Anterior</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navBtn,
            styles.navBtnPrimary,
            currentStepIndex === knot.steps.length - 1 && styles.navBtnDisabled,
          ]}
          onPress={() => onStepChange(Math.min(knot.steps.length - 1, currentStepIndex + 1))}
          disabled={currentStepIndex === knot.steps.length - 1}
        >
          <Text style={[styles.navBtnText, styles.navBtnTextPrimary]}>Paso Siguiente ➔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  knotDetailCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  backCatalogBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backCatalogBtnText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },
  knotTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  knotDesc: { color: colors.textMuted, fontSize: fontSize.xs },

  stepperHeader: { gap: 6, marginVertical: 4 },
  stepCounterText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },
  stepperDots: { flexDirection: 'row', gap: 4 },
  stepperDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surfaceLight },
  stepperDotActive: { width: 20, backgroundColor: colors.primary },

  stepBox: { backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: radii.md, padding: spacing.md, gap: spacing.xs, borderWidth: 1, borderColor: colors.border },
  stepInstructionText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 20 },
  tipBox: { backgroundColor: 'rgba(192, 132, 252, 0.1)', borderRadius: 6, padding: spacing.xs },
  tipText: { color: colors.primary, fontSize: 11 },
  warningBox: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: 6, padding: spacing.xs },
  warningText: { color: colors.danger, fontSize: 11, fontWeight: '700' },

  stepperNavRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  navBtn: { flex: 1, backgroundColor: colors.surfaceLight, borderRadius: radii.md, paddingVertical: 10, alignItems: 'center' },
  navBtnPrimary: { backgroundColor: colors.primary },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  navBtnTextPrimary: { color: colors.onPrimary },
});
