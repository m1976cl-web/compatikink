import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { generateAISceneRecommendations, SceneRecommendation } from '@/lib/sceneRecommender';

export default function SceneAIScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [recommendations, setRecommendations] = useState<SceneRecommendation[]>([]);

  useEffect(() => {
    (async () => {
      const recs = await generateAISceneRecommendations();
      setRecommendations(recs);
    })();
  }, []);

  const handleScheduleScene = (rec: SceneRecommendation) => {
    Alert.alert(
      `Agendar "${rec.title}" 🗓️`,
      `¿Deseas agregar esta rutina personalizada de ${rec.durationMinutes} minutos a tu Calendario de Escenas?`,
      [
        { text: 'Ir al Calendario 📅', onPress: () => router.push('/calendar') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🤖 Recomendador IA de Escenas</Text>
          <Text style={styles.subtitle}>
            Rutinas paso a paso diseñadas a medida según tu historial, wishlist y nivel de intensidad preferido
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {recommendations.map((rec) => (
            <View key={rec.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={{ fontSize: 32 }}>{rec.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.intensityBadge}>{rec.intensity.toUpperCase()}</Text>
                    <Text style={styles.categoryText}>· {rec.category}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{rec.title}</Text>
                </View>
                <Text style={styles.durationText}>⏱️ {rec.durationMinutes}m</Text>
              </View>

              <View style={styles.matchReasonBox}>
                <Text style={styles.matchReasonText}>💡 {rec.matchReason}</Text>
              </View>

              {/* Step-by-step activities breakdown */}
              <View style={styles.activitiesBox}>
                <Text style={styles.sectionLabel}>📋 Pasos de la Escena:</Text>
                {rec.activities.map((act, idx) => (
                  <View key={idx} style={styles.actRow}>
                    <Text style={styles.actIndex}>{idx + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actName}>{act.name} ({act.durationMinutes} min)</Text>
                      <Text style={styles.actNotes}>{act.notes}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Playlist & Aftercare */}
              <View style={styles.detailsRow}>
                <Text style={styles.detailItem}>🎶 Playlist: <Text style={{ color: colors.text }}>{rec.suggestedPlaylist}</Text></Text>
                <Text style={styles.detailItem}>🪷 Aftercare: <Text style={{ color: colors.text }}>{rec.aftercarePlan}</Text></Text>
              </View>

              <TouchableOpacity style={styles.scheduleBtn} onPress={() => handleScheduleScene(rec)}>
                <Text style={styles.scheduleBtnText}>Agendar Esta Escena 🗓️</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.xs },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    gap: spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  intensityBadge: { color: colors.neonPink, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  categoryText: { color: colors.textMuted, fontSize: fontSize.xs },
  cardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900', marginTop: 2 },
  durationText: { color: colors.neonPurple, fontSize: fontSize.sm, fontWeight: '900' },

  matchReasonBox: { backgroundColor: 'rgba(192, 132, 252, 0.1)', borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: 'rgba(192, 132, 252, 0.3)' },
  matchReasonText: { color: colors.neonPurple, fontSize: fontSize.xs, fontWeight: '700' },

  activitiesBox: { gap: 8 },
  sectionLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '800' },
  actRow: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  actIndex: { color: colors.primary, fontSize: fontSize.md, fontWeight: '900' },
  actName: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  actNotes: { color: colors.textMuted, fontSize: 10, marginTop: 2 },

  detailsRow: { backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: 12, gap: 4 },
  detailItem: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },

  scheduleBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: 14, alignItems: 'center' },
  scheduleBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },
});
