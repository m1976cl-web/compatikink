import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { INTIMACY_QUESTIONS_36 } from '@/data/intimacyQuestions';

export interface IntimacyQuestions36StepProps {
  q36Index: number;
  onNextQ36: () => void;
}

export function IntimacyQuestions36Step({ q36Index, onNextQ36 }: IntimacyQuestions36StepProps) {
  const isLast = q36Index === INTIMACY_QUESTIONS_36.length - 1;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.cardBox}>
        <Text style={styles.cardTitle}>💬 36 Preguntas de Conversación Íntima Profunda</Text>
        <Text style={styles.stepSub}>
          Guía de diálogo presencial para explorar deseos, vulnerabilidad y acuerdos de seguridad.
        </Text>

        <View style={styles.questionCard}>
          <Text style={styles.qIndexLabel}>Pregunta {q36Index + 1} de {INTIMACY_QUESTIONS_36.length}</Text>
          <Text style={styles.qTextMain}>{INTIMACY_QUESTIONS_36[q36Index]}</Text>
        </View>

        <TouchableOpacity style={styles.nextQBtn} onPress={onNextQ36} activeOpacity={0.85}>
          <Text style={styles.nextQBtnText}>
            {!isLast ? 'Siguiente Pregunta ➔' : '✓ Completar Guía Íntima'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  cardBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
  },
  stepSub: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  questionCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qIndexLabel: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  qTextMain: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    lineHeight: 26,
  },
  nextQBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  nextQBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
});
