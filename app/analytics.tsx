import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { SceneDebrief } from '@/lib/storage';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [allDebriefs, setAllDebriefs] = useState<SceneDebrief[]>([]);

  useEffect(() => {
    (async () => {
      const keys = await AsyncStorage.getAllKeys();
      const debriefKeys = keys.filter((k) => k.startsWith('scene_debriefs_'));
      let list: SceneDebrief[] = [];
      for (const k of debriefKeys) {
        const raw = await AsyncStorage.getItem(k);
        if (raw) {
          list = list.concat(JSON.parse(raw));
        }
      }
      setAllDebriefs(list);
    })();
  }, []);

  const stats = useMemo(() => {
    if (allDebriefs.length === 0) {
      return { avgRating: 5, avgAftercare: 5, totalScenes: 0, topEmotions: [] };
    }

    let ratingSum = 0;
    let aftercareSum = 0;
    const emotionCounts: Record<string, number> = {};

    for (const d of allDebriefs) {
      ratingSum += d.ratingStars;
      aftercareSum += d.aftercareRating;
      if (d.emotions) {
        for (const e of d.emotions) {
          emotionCounts[e] = (emotionCounts[e] || 0) + 1;
        }
      }
    }

    const sortedEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);

    return {
      avgRating: (ratingSum / allDebriefs.length).toFixed(1),
      avgAftercare: (aftercareSum / allDebriefs.length).toFixed(1),
      totalScenes: allDebriefs.length,
      topEmotions: sortedEmotions,
    };
  }, [allDebriefs]);

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Analítica Emocional & Subspace Tracker</Text>
          <Text style={styles.subtitle}>
            Monitoreo histórico de satisfacción, frecuencia de subspace y efectividad del aftercare
          </Text>
        </View>

        {/* Dashboard Grid */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{stats.totalScenes}</Text>
              <Text style={styles.metricLabel}>Escenas Registradas</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: colors.warning }]}>★ {stats.avgRating}</Text>
              <Text style={styles.metricLabel}>Satisfacción Promedio</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: colors.success }]}>💛 {stats.avgAftercare}</Text>
              <Text style={styles.metricLabel}>Calidad de Aftercare</Text>
            </View>
          </View>

          {/* Top Emotions Chart Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>✨ Emociones Frecuentes Post-Escena</Text>
            {stats.topEmotions.length === 0 ? (
              <Text style={styles.emptyText}>
                Registra tus primeras impresiones en el Diario Post-Escena para visualizar tus estados emocionales.
              </Text>
            ) : (
              <View style={{ gap: spacing.xs }}>
                {stats.topEmotions.map(([emotion, count]) => {
                  const pct = Math.round((count / Math.max(1, stats.totalScenes)) * 100);
                  return (
                    <View key={emotion} style={{ gap: 2 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: colors.text, fontSize: fontSize.xs, fontWeight: '700' }}>
                          {emotion}
                        </Text>
                        <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' }}>
                          {count} veces ({pct}%)
                        </Text>
                      </View>
                      <View style={{ height: 8, backgroundColor: colors.surfaceLight, borderRadius: 4, overflow: 'hidden' }}>
                        <View style={{ height: '100%', width: `${Math.min(100, pct)}%`, backgroundColor: colors.primary, borderRadius: 4 }} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Subspace Health Advice */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>🌌 Monitoreo de Subspace & Topspace</Text>
            <Text style={styles.infoText}>
              Mantener un promedio de Aftercare sobre 4.0 previene episodios de Afterdrop intenso y consolida el vínculo afectivo de largo plazo.
            </Text>
          </View>
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },
  metricsRow: { flexDirection: 'row', gap: spacing.xs },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricValue: { color: colors.primary, fontSize: fontSize.xl, fontWeight: '900' },
  metricLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 2 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    gap: spacing.md,
  },
  cardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  emptyText: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  infoBox: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 4,
  },
  infoTitle: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },
  infoText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },
});
