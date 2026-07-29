import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

interface SoundscapePreset {
  id: string;
  emoji: string;
  title: string;
  bpm: string;
  description: string;
  tags: string[];
  trackSuggestions: string[];
}

const PRESETS: SoundscapePreset[] = [
  {
    id: 'shibari_rhythm',
    emoji: '🪢',
    title: 'Shibari Focus & Meditative Flow',
    bpm: '60 - 75 BPM (Pausado / Fluido)',
    description: 'Ritmo bajo y atmosférico ideal para mantener la concentración y la respiración sincronizada durante ataduras complejas.',
    tags: ['Ataduras', 'Concentración', 'Meditativo', 'Ambient'],
    trackSuggestions: [
      '🎵 Max Richter — Sleep / Path 5',
      '🎵 Ólafur Arnalds — Saman',
      '🎵 Jon Hopkins — Immunity (Acoustic)',
      '🎵 Nils Frahm — Says',
    ],
  },
  {
    id: 'sensual_wax',
    emoji: '🕯️',
    title: 'Sensual Slow Touch & Wax',
    bpm: '70 - 85 BPM (Sensual / Cálido)',
    description: 'Vibraciones envolventes y cálidas para juegos de sensaciones térmicas, vendas en ojos y masajes tántricos.',
    tags: ['Cera', 'Sensaciones', 'Masaje', 'Neosoul / Downtempo'],
    trackSuggestions: [
      '🎵 Portishead — Glory Box',
      '🎵 Massive Attack — Teardrop',
      '🎵 Sabrina Claudio — Belong to You',
      '🎵 Two Feet — Go Fuck Yourself',
    ],
  },
  {
    id: 'impact_pulse',
    emoji: '⚡',
    title: 'High Energy Impact & Power Exchange',
    bpm: '95 - 120 BPM (Pulsante / Intenso)',
    description: 'Bases rítmicas profundas y electrónica oscura para sesiones de impact play, flogger y dinámicas D/s intensas.',
    tags: ['Impacto', 'Dominación', 'Dark Electronic', 'Industrial Light'],
    trackSuggestions: [
      '🎵 Trentemøller — Moan',
      '🎵 Lorn — Acid Rain',
      '🎵 Boy Harsher — Pain',
      '🎵 ZHU — Faded',
    ],
  },
  {
    id: 'aftercare_relax',
    emoji: '🪷',
    title: 'Deep Relax & Reconnection (Aftercare)',
    bpm: '45 - 60 BPM (Suave / Orgánico)',
    description: 'Sonidos de lluvia, cuencos tibetanos y acordes acústicos suaves para regular el pulso y acompañar el aftercare post-escena.',
    tags: ['Aftercare', 'Relajación', 'Lluvia', 'Acústico'],
    trackSuggestions: [
      '🎵 Marconi Union — Weightless',
      '🎵 Brian Eno — Music for Airports',
      '🎵 Ludovico Einaudi — Nuvole Bianche',
      '🎵 Lluvia suave & Cuencos Tibetanos 432Hz',
    ],
  },
];

export default function PlaylistsScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [activePreset, setActivePreset] = useState<SoundscapePreset | null>(PRESETS[0]);
  const [metronomePlaying, setMetronomePlaying] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎶 Ambientes Sonoros & Playlists</Text>
          <Text style={styles.subtitle}>
            Ambientes auditivos diseñados para sincronizar el ritmo, la concentración y la relajación en escenas
          </Text>
        </View>

        {/* Preset Selector Grid */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {PRESETS.map((preset) => {
              const isActive = activePreset?.id === preset.id;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.presetCard, isActive && styles.presetCardActive]}
                  onPress={() => setActivePreset(preset)}
                >
                  <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                  <Text style={styles.presetTitle}>{preset.title}</Text>
                  <Text style={styles.presetBpm}>{preset.bpm}</Text>
                  <View style={styles.tagsRow}>
                    {preset.tags.map((t) => (
                      <View key={t} style={styles.tagChip}>
                        <Text style={styles.tagText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Active Preset Detail Panel */}
          {activePreset && (
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Text style={{ fontSize: 32 }}>{activePreset.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailTitle}>{activePreset.title}</Text>
                  <Text style={styles.detailBpm}>{activePreset.bpm}</Text>
                </View>
              </View>

              <Text style={styles.detailDesc}>{activePreset.description}</Text>

              {/* Rhythm Pulse Generator */}
              <View style={styles.rhythmBox}>
                <Text style={styles.rhythmTitle}>⏱️ Guía de Ritmo Corporal</Text>
                <TouchableOpacity
                  style={[styles.pulseBtn, metronomePlaying && styles.pulseBtnActive]}
                  onPress={() => setMetronomePlaying(!metronomePlaying)}
                >
                  <Text style={styles.pulseBtnText}>
                    {metronomePlaying ? '⏹ Pausar Guía de Ritmo' : '▶️ Activar Pulso Visual de Escena'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tracks Recommendations */}
              <View style={styles.tracksSection}>
                <Text style={styles.tracksTitle}>🎵 Pistas Sugeridas:</Text>
                {activePreset.trackSuggestions.map((track, idx) => (
                  <View key={idx} style={styles.trackRow}>
                    <Text style={styles.trackText}>{track}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.xs },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },
  grid: { gap: spacing.sm },

  presetCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 4,
  },
  presetCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
  },
  presetEmoji: { fontSize: 32 },
  presetTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  presetBpm: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  tagChip: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: { color: colors.textMuted, fontSize: 10, fontWeight: '600' },

  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  detailTitle: { color: colors.neonPurple, fontSize: fontSize.lg, fontWeight: '900' },
  detailBpm: { color: colors.textMuted, fontSize: fontSize.xs },
  detailDesc: { color: colors.text, fontSize: fontSize.sm, lineHeight: 20 },

  rhythmBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    alignItems: 'center',
  },
  rhythmTitle: { color: colors.text, fontSize: fontSize.xs, fontWeight: '700' },
  pulseBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginTop: 4,
  },
  pulseBtnActive: { backgroundColor: colors.warning },
  pulseBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },

  tracksSection: { gap: 6 },
  tracksTitle: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  trackRow: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trackText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
});
