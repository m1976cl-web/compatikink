import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { SessionDiffReport } from '@/lib/sessionDiff';

export interface SessionDiffHeaderProps {
  diff: SessionDiffReport;
  onExportMarkdown: () => void;
  copied: boolean;
}

export function SessionDiffHeader({ diff, onExportMarkdown, copied }: SessionDiffHeaderProps) {
  const isPositiveDelta = diff.scoreDelta >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.partnerName}>Vínculo: {diff.sessionB.partnerName}</Text>
          <Text style={styles.datesSub}>
            {new Date(diff.sessionA.date).toLocaleDateString()} ➔ {new Date(diff.sessionB.date).toLocaleDateString()}
          </Text>
        </View>

        <TouchableOpacity style={styles.exportBtn} onPress={onExportMarkdown} activeOpacity={0.8}>
          <Text style={styles.exportBtnText}>{copied ? '✓ Copiado' : '📄 Exportar MD'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.banner}>
        <View style={styles.bannerCol}>
          <Text style={styles.bannerLabel}>Anterior</Text>
          <Text style={styles.bannerScore}>{diff.sessionA.score}%</Text>
        </View>

        <View style={styles.deltaBox}>
          <Text style={[styles.deltaText, isPositiveDelta ? styles.deltaPlus : styles.deltaMinus]}>
            {isPositiveDelta ? `+${diff.scoreDelta}%` : `${diff.scoreDelta}%`}
          </Text>
          <Text style={styles.deltaSub}>Variación</Text>
        </View>

        <View style={styles.bannerCol}>
          <Text style={styles.bannerLabel}>Reciente</Text>
          <Text style={styles.bannerScorePrimary}>{diff.sessionB.score}%</Text>
        </View>
      </View>

      <Text style={styles.totalChangesText}>
        Se registraron <Text style={{ color: colors.primary, fontWeight: '800' }}>{diff.totalChanges} cambios significativos</Text> entre ambas sesiones.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  partnerName: {
    color: colors.primary,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
  },
  datesSub: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
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
  banner: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerCol: {
    alignItems: 'center',
  },
  bannerLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  bannerScore: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
  },
  bannerScorePrimary: {
    color: colors.primary,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
  },
  deltaBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deltaText: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
  },
  deltaPlus: {
    color: colors.success,
  },
  deltaMinus: {
    color: colors.danger,
  },
  deltaSub: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: fonts.body,
  },
  totalChangesText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});
