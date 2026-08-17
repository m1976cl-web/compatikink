import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';

export interface BurnoutCheckIn {
  id: string;
  timestamp: string;
  physicalFatigue: number;
  emotionalBattery: number;
  aftercareQuality: number;
  totalScore: number;
  recommendation: string;
}

export interface BurnoutAssessmentTabProps {
  physicalFatigue: number;
  setPhysicalFatigue: (val: number) => void;
  emotionalBattery: number;
  setEmotionalBattery: (val: number) => void;
  aftercareQuality: number;
  setAftercareQuality: (val: number) => void;
  onSaveBurnoutCheckin: () => void;
  burnoutLogs: BurnoutCheckIn[];
}

export function BurnoutAssessmentTab({
  physicalFatigue,
  setPhysicalFatigue,
  emotionalBattery,
  setEmotionalBattery,
  aftercareQuality,
  setAftercareQuality,
  onSaveBurnoutCheckin,
  burnoutLogs,
}: BurnoutAssessmentTabProps) {
  return (
    <View style={styles.sectionGap}>
      <View style={styles.cardBox}>
        <Text style={styles.cardBoxTitle}>📊 Auto-Evaluación de Kink-Burnout & Bienestar</Text>
        <Text style={typography.bodyMuted}>
          Evalúa la sobrecarga física o emocional en tu dinámica para mantener un equilibrio saludable.
        </Text>

        <Text style={styles.fieldLabel}>1. Cansancio Físico / Fatiga Post-Escena (1 = Leve, 5 = Extremo)</Text>
        <View style={styles.chipGrid}>
          {[1, 2, 3, 4, 5].map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.chip, physicalFatigue === val && styles.chipActive]}
              onPress={() => setPhysicalFatigue(val)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, physicalFatigue === val && styles.chipTextActive]}>{val}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>2. Saturación / Batería Emocional (1 = Llena, 5 = Ahorro)</Text>
        <View style={styles.chipGrid}>
          {[1, 2, 3, 4, 5].map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.chip, emotionalBattery === val && styles.chipActive]}
              onPress={() => setEmotionalBattery(val)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, emotionalBattery === val && styles.chipTextActive]}>{val}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>3. Calidad del Aftercare & Atención Mutua (1 = Insuficiente, 5 = Excelente)</Text>
        <View style={styles.chipGrid}>
          {[1, 2, 3, 4, 5].map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.chip, aftercareQuality === val && styles.chipActive]}
              onPress={() => setAftercareQuality(val)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, aftercareQuality === val && styles.chipTextActive]}>{val}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onSaveBurnoutCheckin} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>📊 Guardar Diagnóstico en Bóveda</Text>
        </TouchableOpacity>
      </View>

      {/* History */}
      {burnoutLogs.length > 0 && (
        <View style={styles.cardBox}>
          <Text style={styles.cardBoxTitle}>📋 Historial de Diagnósticos ({burnoutLogs.length}):</Text>
          {burnoutLogs.map((log) => (
            <View key={log.id} style={styles.journalItem}>
              <Text style={styles.journalItemDate}>📅 {log.timestamp}</Text>
              <Text style={styles.journalItemText}>{log.recommendation}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionGap: { gap: spacing.md },
  cardBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardBoxTitle: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    marginTop: spacing.md,
    marginBottom: 6,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  chipActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  chipTextActive: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  primaryBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  journalItem: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    gap: 2,
  },
  journalItemDate: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: fonts.bodyBold,
  },
  journalItemText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontFamily: fonts.bodySemi,
  },
});
