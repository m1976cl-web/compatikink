import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import { CompatibilityReport, CATEGORY_LABELS, EXPERIENCE_LABELS } from '@/types';
import { CATEGORY_ORDER } from '@/data/activities';
import { useResponsive } from '@/hooks/useResponsive';

interface Props {
  report: CompatibilityReport;
  initiatorName: string;
  guestName: string;
}

export function CompatibilityInfographic({ report, initiatorName, guestName }: Props) {
  const { isDesktop } = useResponsive();
  const {
    initiatorCompass,
    guestCompass,
    initiatorArchetype,
    guestArchetype,
    categoryCompatibilities,
    overlapStats,
    initiatorProfile,
    guestProfile,
  } = report;

  const sectionCompass = (
    <View style={styles.neonCard}>
      <Text style={styles.neonCardHeader}>🧭 El Compás Kink</Text>
      <Text style={styles.cardDesc}>
        Ubicación de ambos en los ejes de Rol (Dominante/Sumiso) e Intensidad/Exploración.
      </Text>

      <View style={styles.compassContainer}>
        {/* Glowing quadrant hints */}
        <View style={[styles.quadrant, styles.quadrantTR]} />
        <View style={[styles.quadrant, styles.quadrantBL]} />

        {/* Axis Labels */}
        <Text style={[styles.axisLabel, styles.axisTop]}>⬆ Dom</Text>
        <Text style={[styles.axisLabel, styles.axisBottom]}>⬇ Sub</Text>
        <Text style={[styles.axisLabel, styles.axisLeft]}>Vanilla</Text>
        <Text style={[styles.axisLabel, styles.axisRight]}>Exp</Text>

        {/* Grid lines */}
        <View style={styles.gridLineX} />
        <View style={styles.gridLineY} />

        {/* Initiator Dot — Neon Purple Glow */}
        <View
          style={[
            styles.dot,
            styles.initiatorDot,
            { left: `${initiatorCompass.x}%`, bottom: `${initiatorCompass.y}%` },
          ]}
        >
          <View style={styles.initiatorGlow} />
          <Text style={[styles.dotLabel, styles.initiatorLabel]}>
            {initiatorProfile?.nickname || initiatorName || 'Tú'}
          </Text>
        </View>

        {/* Guest Dot — Neon Pink Glow */}
        <View
          style={[
            styles.dot,
            styles.guestDot,
            { left: `${guestCompass.x}%`, bottom: `${guestCompass.y}%` },
          ]}
        >
          <View style={styles.guestGlow} />
          <Text style={[styles.dotLabel, styles.guestLabel]}>
            {guestProfile?.nickname || guestName || 'Invitado'}
          </Text>
        </View>
      </View>

      {/* Compass Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={styles.legendDotPurple} />
          <Text style={styles.legendText}>{initiatorProfile?.nickname || initiatorName || 'Tú'}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendDotPink} />
          <Text style={styles.legendText}>{guestProfile?.nickname || guestName || 'Invitado'}</Text>
        </View>
      </View>
    </View>
  );

  const sectionArchetypes = (
    <View style={styles.neonCard}>
      <Text style={styles.neonCardHeader}>✨ Arquetipos Kink</Text>
      <View style={styles.archetypeRow}>
        {/* Initiator Card */}
        <View style={[styles.archetypeBox, styles.archetypeBoxInit]}>
          <View style={styles.archetypeGlowBorder} />
          <Text style={styles.archetypeUser}>{initiatorProfile?.nickname || initiatorName || 'Tú'}</Text>
          {initiatorProfile?.pronouns ? (
            <Text style={styles.badgeText}>{initiatorProfile.pronouns}</Text>
          ) : null}
          <Text style={styles.archetypeValue}>{initiatorArchetype}</Text>

          {initiatorProfile?.experienceLevel ? (
            <View style={styles.experienceTag}>
              <Text style={styles.experienceTagText}>
                {EXPERIENCE_LABELS[initiatorProfile.experienceLevel]}
              </Text>
            </View>
          ) : null}

          {initiatorProfile?.notes ? (
            <Text style={styles.profileBio}>"{initiatorProfile.notes}"</Text>
          ) : null}
        </View>

        {/* VS divider */}
        <View style={styles.vsDivider}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* Guest Card */}
        <View style={[styles.archetypeBox, styles.archetypeBoxGuest]}>
          <Text style={styles.archetypeUser}>{guestProfile?.nickname || guestName || 'Invitado'}</Text>
          {guestProfile?.pronouns ? (
            <Text style={styles.badgeText}>{guestProfile.pronouns}</Text>
          ) : null}
          <Text style={[styles.archetypeValue, styles.archetypeValuePink]}>{guestArchetype}</Text>

          {guestProfile?.experienceLevel ? (
            <View style={styles.experienceTag}>
              <Text style={styles.experienceTagText}>
                {EXPERIENCE_LABELS[guestProfile.experienceLevel]}
              </Text>
            </View>
          ) : null}

          {guestProfile?.notes ? (
            <Text style={styles.profileBio}>"{guestProfile.notes}"</Text>
          ) : null}
        </View>
      </View>
    </View>
  );

  const sectionInterests = (
    <View style={styles.neonCard}>
      <Text style={styles.neonCardHeader}>🔗 Conexión de Intereses</Text>
      <Text style={styles.cardDesc}>
        Distribución de las actividades en las que se expresó interés activo.
      </Text>

      <View style={styles.vennBar}>
        <View style={[styles.vennSegment, styles.segmentLeft, { flex: Math.max(1, overlapStats.initiatorOnlyCount) }]}>
          <Text style={styles.vennNum}>{overlapStats.initiatorOnlyCount}</Text>
          <Text style={styles.vennLabel} numberOfLines={1}>Solo Tú</Text>
        </View>
        <View style={[styles.vennSegment, styles.segmentCenter, { flex: Math.max(1, overlapStats.sharedCount) }]}>
          <Text style={[styles.vennNum, styles.vennNumGlow]}>{overlapStats.sharedCount}</Text>
          <Text style={styles.vennLabel} numberOfLines={1}>Mutuos 🔥</Text>
        </View>
        <View style={[styles.vennSegment, styles.segmentRight, { flex: Math.max(1, overlapStats.guestOnlyCount) }]}>
          <Text style={styles.vennNum}>{overlapStats.guestOnlyCount}</Text>
          <Text style={styles.vennLabel} numberOfLines={1}>Solo Ellos</Text>
        </View>
      </View>
    </View>
  );

  const sectionCategories = (
    <View style={styles.neonCard}>
      <Text style={styles.neonCardHeader}>📊 Compatibilidad por Categorías</Text>
      <View style={styles.categoryList}>
        {CATEGORY_ORDER.map((cat) => {
          const pct = categoryCompatibilities[cat] ?? 100;
          let barColor = colors.neonGreen;
          if (pct < 40) barColor = colors.danger;
          else if (pct < 75) barColor = colors.warning;

          return (
            <View key={cat} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{CATEGORY_LABELS[cat]}</Text>
                <Text style={[styles.categoryPct, { color: barColor }]}>{pct}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${pct}%`,
                      backgroundColor: barColor,
                      shadowColor: barColor,
                      shadowOpacity: 0.6,
                      shadowRadius: 4,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopGrid}>
        <View style={styles.desktopColLeft}>
          {sectionCompass}
          {sectionArchetypes}
        </View>
        <View style={styles.desktopColRight}>
          {sectionInterests}
          {sectionCategories}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sectionCompass}
      {sectionArchetypes}
      {sectionInterests}
      {sectionCategories}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  desktopGrid: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  desktopColLeft: {
    flex: 1,
    gap: spacing.lg,
  },
  desktopColRight: {
    flex: 1,
    gap: spacing.lg,
  },
  neonCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.25)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  neonCardHeader: {
    color: colors.neonPurple,
    fontSize: fontSize.sm,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
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
    backgroundColor: 'rgba(13, 8, 25, 0.9)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.2)',
    position: 'relative',
    marginVertical: spacing.sm,
    overflow: 'hidden',
  },
  quadrant: {
    position: 'absolute',
    width: '50%',
    height: '50%',
  },
  quadrantTR: {
    top: 0,
    right: 0,
    backgroundColor: 'rgba(192, 132, 252, 0.04)',
  },
  quadrantBL: {
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(244, 114, 182, 0.04)',
  },
  axisLabel: {
    position: 'absolute',
    color: colors.neonPurple,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  axisTop: { top: 6, alignSelf: 'center' },
  axisBottom: { bottom: 6, alignSelf: 'center' },
  axisLeft: { left: 8, top: '47%' },
  axisRight: { right: 8, top: '47%' },
  gridLineX: {
    position: 'absolute',
    left: 0, right: 0, top: '50%',
    height: 1,
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
  },
  gridLineY: {
    position: 'absolute',
    top: 0, bottom: 0, left: '50%',
    width: 1,
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
  },
  dot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -7 }, { translateY: 7 }],
  },
  initiatorDot: {
    backgroundColor: colors.neonPurple,
    elevation: 6,
  },
  guestDot: {
    backgroundColor: colors.neonPink,
    elevation: 6,
  },
  initiatorGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(192, 132, 252, 0.3)',
  },
  guestGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(244, 114, 182, 0.3)',
  },
  dotLabel: {
    fontSize: 11,
    fontWeight: '700',
    position: 'absolute',
    top: 16,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    textAlign: 'center',
    minWidth: 40,
  },
  initiatorLabel: {
    color: colors.neonPurple,
    backgroundColor: 'rgba(10, 6, 18, 0.85)',
  },
  guestLabel: {
    color: colors.neonPink,
    backgroundColor: 'rgba(10, 6, 18, 0.85)',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDotPurple: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.neonPurple,
  },
  legendDotPink: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.neonPink,
  },
  legendText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  archetypeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'stretch',
  },
  archetypeBox: {
    flex: 1,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1.5,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  archetypeBoxInit: {
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
    borderColor: 'rgba(192, 132, 252, 0.4)',
  },
  archetypeBoxGuest: {
    backgroundColor: 'rgba(244, 114, 182, 0.08)',
    borderColor: 'rgba(244, 114, 182, 0.4)',
  },
  archetypeGlowBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.1)',
  },
  vsDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  vsText: {
    color: colors.textMuted,
    fontWeight: '800',
    fontSize: fontSize.xs,
    letterSpacing: 1,
  },
  archetypeUser: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  badgeText: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 6,
  },
  archetypeValue: {
    color: colors.neonPurple,
    fontSize: fontSize.sm,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(192, 132, 252, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  archetypeValuePink: {
    color: colors.neonPink,
    textShadowColor: 'rgba(244, 114, 182, 0.5)',
  },
  experienceTag: {
    backgroundColor: 'rgba(10, 6, 18, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 6,
  },
  experienceTagText: {
    color: colors.neonPurple,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileBio: {
    color: colors.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 15,
  },
  vennBar: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  segmentCenter: {
    backgroundColor: 'rgba(74, 222, 128, 0.18)',
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  segmentRight: {
    backgroundColor: 'rgba(244, 114, 182, 0.15)',
  },
  vennNum: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  vennNumGlow: {
    color: colors.neonGreen,
    textShadowColor: 'rgba(74, 222, 128, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  vennLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  categoryList: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  categoryItem: {
    gap: 6,
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
    fontWeight: '800',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
