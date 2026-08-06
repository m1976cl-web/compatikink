import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { AdminMetrics } from '@/lib/vaultUnified';

interface Props {
  metrics: AdminMetrics | null;
}

export function MetricsGrid({ metrics }: Props) {
  if (!metrics) return null;

  return (
    <View style={styles.metricsGrid}>
      <View style={styles.metricCard}>
        <Text style={styles.metricEmoji}>👥</Text>
        <Text style={styles.metricValue}>{metrics.totalProfiles}</Text>
        <Text style={styles.metricLabel}>Perfiles Registrados</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricEmoji}>🛡️</Text>
        <Text style={styles.metricValue}>{metrics.verifiedProfiles}</Text>
        <Text style={styles.metricLabel}>Perfiles Verificados</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricEmoji}>⚡</Text>
        <Text style={styles.metricValue}>{metrics.activePartnerships}</Text>
        <Text style={styles.metricLabel}>Parejas Activas</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricEmoji}>🔒</Text>
        <Text style={styles.metricValue}>{metrics.totalSessionEntries}</Text>
        <Text style={styles.metricLabel}>Sesiones en Bóveda</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricEmoji: { fontSize: 24 },
  metricValue: { fontSize: 28, fontWeight: '900', color: colors.text },
  metricLabel: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },
});
