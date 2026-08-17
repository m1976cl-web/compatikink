import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { CompatibilityReport, GuestProfile } from '@/types';

export interface ReportScoreHeaderProps {
  report: CompatibilityReport;
  displayScore: number;
  confettiOpacity: Animated.Value;
  guestProfile: GuestProfile | null;
  guestName: string;
  isDesktop?: boolean;
  children?: React.ReactNode;
}

export function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function ReportScoreHeader({
  report,
  displayScore,
  confettiOpacity,
  guestProfile,
  guestName,
  isDesktop = false,
  children,
}: ReportScoreHeaderProps) {
  if (isDesktop) {
    return (
      <View style={styles.desktopSummaryContainer}>
        {/* Left Column: Overall Match % & Stats */}
        <View style={styles.desktopSummaryLeft}>
          <Text style={styles.score}>{displayScore}%</Text>
          <Text style={styles.scoreLabel}>Compatibilidad general</Text>
          <View style={styles.stats}>
            <Stat value={report.mutualMatchCount} label="Matches" color={colors.success} />
            <Stat value={report.exploreCount} label="Explorar" color={colors.info} />
            <Stat value={report.conflictCount} label="Atención" color={colors.warning} />
          </View>
        </View>

        {/* Right Column: Guest Private Profile & Action Triggers */}
        <View style={styles.desktopSummaryRight}>
          {guestProfile ? (
            <View style={styles.profileCardDesktop}>
              <Text style={styles.profileHeader}>Ficha del Invitado (Privada)</Text>
              <Text style={styles.profileTitle}>Apodo: {guestProfile.nickname}</Text>
              {guestProfile.notes ? (
                <Text style={styles.profileNotes}>Notas: {guestProfile.notes}</Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.profileCardDesktop}>
              <Text style={styles.profileHeader}>Reporte con {guestName}</Text>
              <Text style={styles.profileNotes}>Resultados generados basados en respuestas compartidas.</Text>
            </View>
          )}

          {children}
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.summary}>
        <Text style={styles.score}>{displayScore}%</Text>
        {/* Confetti overlay for high scores */}
        {report.compatibilityScore > 80 && (
          <Animated.View style={[styles.confettiOverlay, { opacity: confettiOpacity }]}>
            <Text style={styles.confettiText}>🎉✨🔥💜✨🎉</Text>
          </Animated.View>
        )}
        <Text style={styles.scoreLabel}>Compatibilidad general</Text>
        <View style={styles.stats}>
          <Stat value={report.mutualMatchCount} label="Matches" color={colors.success} />
          <Stat value={report.exploreCount} label="Explorar" color={colors.info} />
          <Stat value={report.conflictCount} label="Atención" color={colors.warning} />
        </View>

        {children}
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
    </>
  );
}

const styles = StyleSheet.create({
  desktopSummaryContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.xl,
  },
  desktopSummaryLeft: {
    alignItems: 'center',
    paddingRight: spacing.xl,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    minWidth: 240,
  },
  desktopSummaryRight: {
    flex: 1,
    gap: spacing.md,
  },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  score: {
    color: colors.primary,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xxl,
  },
  scoreLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.lg,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  profileCardDesktop: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileHeader: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  profileTitle: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
  },
  profileNotes: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  confettiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  confettiText: {
    fontSize: 24,
  },
});
