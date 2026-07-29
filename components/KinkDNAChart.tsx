import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import { CATEGORY_LABELS, CATEGORY_EMOJIS, ActivityCategory } from '@/types';

interface Props {
  scores: Record<ActivityCategory, number>;
}

export function KinkDNAChart({ scores }: Props) {
  const categories = Object.keys(scores) as ActivityCategory[];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🧬 Tu Kink DNA (Huella Digital de Afinidad)</Text>
      <Text style={styles.sub}>Representación visual de tus categorías dominantes</Text>

      <View style={styles.grid}>
        {categories.map((cat) => {
          const score = scores[cat] || 50;
          const emoji = CATEGORY_EMOJIS[cat] || '✨';
          const label = CATEGORY_LABELS[cat] || cat;

          return (
            <View key={cat} style={styles.barItem}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.catLabel}>{emoji} {label}</Text>
                <Text style={styles.catPct}>{score}%</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${score}%` }]} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    gap: spacing.sm,
  },
  title: { color: colors.text, fontSize: fontSize.md, fontWeight: '900' },
  sub: { color: colors.textMuted, fontSize: fontSize.xs },
  grid: { gap: spacing.xs, marginTop: 4 },
  barItem: { gap: 2 },
  catLabel: { color: colors.text, fontSize: fontSize.xs, fontWeight: '700' },
  catPct: { color: colors.neonPurple, fontSize: fontSize.xs, fontWeight: '900' },
  track: { height: 8, backgroundColor: colors.surfaceLight, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
});
