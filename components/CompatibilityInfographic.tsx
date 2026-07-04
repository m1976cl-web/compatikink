import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import { CompatibilityReport, CATEGORY_LABELS } from '@/types';
import { CATEGORY_ORDER } from '@/data/activities';

interface Props {
  report: CompatibilityReport;
  initiatorName: string;
  guestName: string;
}

export function CompatibilityInfographic({ report, initiatorName, guestName }: Props) {
  const {
    initiatorCompass,
    guestCompass,
    initiatorArchetype,
    guestArchetype,
    categoryCompatibilities,
    overlapStats,
  } = report;

  return (
    <View style={styles.container}>
      {/* 1. Compás Kink */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>El Compás Kink</Text>
        <Text style={styles.cardDesc}>
          Ubicación de ambos en los ejes de Rol (Dominante/Sumiso) e Intensidad/Exploración.
        </Text>

        <View style={styles.compassContainer}>
          {/* Axis Labels */}
          <Text style={[styles.axisLabel, styles.axisTop]}>Dominación (Dom)</Text>
          <Text style={[styles.axisLabel, styles.axisBottom]}>Sumisión (Sub)</Text>
          <Text style={[styles.axisLabel, styles.axisLeft]}>Vanilla</Text>
          <Text style={[styles.axisLabel, styles.axisRight]}>Experimental</Text>

          {/* Grid lines */}
          <View style={styles.gridLineX} />
          <View style={styles.gridLineY} />

          {/* Initiator Dot */}
          <View
            style={[
              styles.dot,
              styles.initiatorDot,
              { left: `${initiatorCompass.x}%`, bottom: `${initiatorCompass.y}%` },
            ]}
          >
            <View style={styles.dotPulse} />
            <Text style={styles.dotLabel}>Tú</Text>
          </View>

          {/* Guest Dot */}
          <View
            style={[
              styles.dot,
              styles.guestDot,
              { left: `${guestCompass.x}%`, bottom: `${guestCompass.y}%` },
            ]}
          >
            <View style={styles.dotPulse} />
            <Text style={styles.dotLabel}>{guestName}</Text>
          </View>
        </View>
      </View>

      {/* 2. Arquetipos */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Arquetipos Kink</Text>
        <View style={styles.archetypeRow}>
          <View style={styles.archetypeBox}>
            <Text style={styles.archetypeUser}>Tú</Text>
            <Text style={styles.archetypeValue}>{initiatorArchetype}</Text>
          </View>
          <View style={styles.archetypeBox}>
            <Text style={styles.archetypeUser}>{guestName}</Text>
            <Text style={styles.archetypeValue}>{guestArchetype}</Text>
          </View>
        </View>
      </View>

      {/* 3. Conexión de Intereses (Venn Diagram alternativo) */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Conexión de Intereses</Text>
        <Text style={styles.cardDesc}>
          Distribución de las actividades en las que se expresó interés activo.
        </Text>

        <View style={styles.vennBar}>
          <View style={[styles.vennSegment, styles.segmentLeft, { flex: Math.max(1, overlapStats.initiatorOnlyCount) }]}>
            <Text style={styles.vennNum}>{overlapStats.initiatorOnlyCount}</Text>
            <Text style={styles.vennLabel} numberOfLines={1}>Solo Tú</Text>
          </View>
          <View style={[styles.vennSegment, styles.segmentCenter, { flex: Math.max(1, overlapStats.sharedCount) }]}>
            <Text style={styles.vennNum}>{overlapStats.sharedCount}</Text>
            <Text style={styles.vennLabel} numberOfLines={1}>Mutuos</Text>
          </View>
          <View style={[styles.vennSegment, styles.segmentRight, { flex: Math.max(1, overlapStats.guestOnlyCount) }]}>
            <Text style={styles.vennNum}>{overlapStats.guestOnlyCount}</Text>
            <Text style={styles.vennLabel} numberOfLines={1}>Solo Ellos</Text>
          </View>
        </View>
      </View>

      {/* 4. Compatibilidad por Categorías */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Compatibilidad por Categorías</Text>
        <View style={styles.categoryList}>
          {CATEGORY_ORDER.map((cat) => {
            const pct = categoryCompatibilities[cat] ?? 100;
            let barColor = colors.success;
            if (pct < 40) barColor = colors.danger;
            else if (pct < 75) barColor = colors.warning;

            return (
              <View key={cat} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{CATEGORY_LABELS[cat]}</Text>
                  <Text style={[styles.categoryPct, { color: barColor }]}>{pct}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  cardDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  compassContainer: {
    height: 220,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    marginVertical: spacing.sm,
    overflow: 'hidden',
  },
  axisLabel: {
    position: 'absolute',
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  axisTop: {
    top: 6,
    alignSelf: 'center',
  },
  axisBottom: {
    bottom: 6,
    alignSelf: 'center',
  },
  axisLeft: {
    left: 8,
    top: '48%',
  },
  axisRight: {
    right: 8,
    top: '48%',
  },
  gridLineX: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  gridLineY: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -6 }, { translateY: 6 }],
  },
  initiatorDot: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  guestDot: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  dotPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    opacity: 0.6,
  },
  dotLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
    position: 'absolute',
    top: 14,
    backgroundColor: 'rgba(15, 10, 20, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    textAlign: 'center',
    minWidth: 40,
  },
  archetypeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  archetypeBox: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  archetypeUser: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  archetypeValue: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  vennBar: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  vennSegment: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  segmentLeft: {
    backgroundColor: 'rgba(147, 51, 234, 0.25)', // Primary dark transparent
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  segmentCenter: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)', // Success transparent
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  segmentRight: {
    backgroundColor: 'rgba(244, 114, 182, 0.25)', // Accent transparent
  },
  vennNum: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  vennLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  categoryList: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  categoryItem: {
    gap: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  categoryPct: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
