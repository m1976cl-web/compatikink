import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { PairwiseScore } from '@/lib/polyCompatibility';

export interface PolyPairwiseMatrixProps {
  pairwiseScores: PairwiseScore[];
}

export function PolyPairwiseMatrix({ pairwiseScores }: PolyPairwiseMatrixProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.matrixTitle}>📊 Matriz de Coincidencias Cruzadas (Pares)</Text>
      <View style={styles.scoresGrid}>
        {pairwiseScores.map((p, idx) => (
          <View key={`${p.p1Name}-${p.p2Name}-${idx}`} style={styles.scoreRowItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scorePartnerName}>{p.p1Name} ↔ {p.p2Name}</Text>
              <Text style={styles.scoreMeta}>
                {p.mutualMatches} Matches Mutuos · {p.conflicts} Puntos de Cuidado
              </Text>
            </View>
            <View style={[styles.scorePill, p.score > 70 ? styles.pillHigh : styles.pillMid]}>
              <Text style={[styles.scorePillNum, p.score > 70 ? styles.textHigh : styles.textMid]}>
                {p.score}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  matrixTitle: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoresGrid: {
    gap: spacing.xs,
  },
  scoreRowItem: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scorePartnerName: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  scoreMeta: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  pillHigh: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: colors.success,
  },
  pillMid: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: colors.info,
  },
  scorePillNum: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  textHigh: {
    color: colors.success,
  },
  textMid: {
    color: colors.info,
  },
});
