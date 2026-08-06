import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { ManualModule } from '@/data/manualData';

interface Props {
  module: ManualModule;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export function ManualModuleCard({ module: mod, isExpanded, onToggle }: Props) {
  return (
    <View style={[styles.moduleCard, isExpanded && styles.moduleCardExpanded]}>
      <TouchableOpacity
        style={styles.moduleHeader}
        onPress={() => onToggle(mod.id)}
        activeOpacity={0.8}
      >
        <View style={styles.moduleHeaderLeft}>
          <Text style={styles.moduleCategoryTag}>{mod.category}</Text>
          <Text style={styles.moduleTitle}>{mod.title}</Text>
        </View>
        <Text style={styles.expandChevron}>{isExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      <Text style={styles.moduleDescription}>{mod.description}</Text>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>💡 Resumen Ejecutivo:</Text>
            <Text style={styles.summaryText}>{mod.summary}</Text>
          </View>

          {mod.stepByStepGuide && mod.stepByStepGuide.length > 0 && (
            <View style={styles.guideSection}>
              <Text style={styles.guideTitle}>📋 Guía Paso a Paso:</Text>
              {mod.stepByStepGuide.map((step, idx) => (
                <View key={idx} style={styles.stepRow}>
                  <Text style={styles.stepBullet}>•</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}

          {mod.tags && mod.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {mod.tags.map((tag, idx) => (
                <View key={idx} style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  moduleCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  moduleCardExpanded: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  moduleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  moduleHeaderLeft: { flex: 1, gap: 2 },
  moduleCategoryTag: { color: colors.accent, fontSize: 10, fontFamily: fonts.bodySemi, fontWeight: '700' },
  moduleTitle: { color: colors.text, fontSize: fontSize.md, fontFamily: fonts.bodySemi, fontWeight: '800' },
  expandChevron: { color: colors.primary, fontSize: 14, fontWeight: '900', paddingLeft: spacing.xs },
  moduleDescription: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 4, lineHeight: 18 },
  expandedContent: { marginTop: spacing.md, gap: spacing.md, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.borderSubtle },
  summaryBox: { backgroundColor: 'rgba(192, 132, 252, 0.08)', borderRadius: radii.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle },
  summaryTitle: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800', marginBottom: 2 },
  summaryText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },
  guideSection: { gap: 4 },
  guideTitle: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800', marginBottom: 2 },
  stepRow: { flexDirection: 'row', gap: 6 },
  stepBullet: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },
  stepText: { color: colors.text, fontSize: fontSize.xs, flex: 1, lineHeight: 18 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  tagBadge: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagBadgeText: { color: colors.textDim, fontSize: 9, fontWeight: '700' },
});
