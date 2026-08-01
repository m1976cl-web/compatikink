import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { PRESET_PATTERNS, VibrationPattern } from '@/lib/musicVibrationSync';

export default function MusicSyncScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [activePattern, setActivePattern] = useState<VibrationPattern>(PRESET_PATTERNS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIntensity, setCurrentIntensity] = useState(30);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        const randomVal = Math.floor(Math.random() * 40) + 40;
        setCurrentIntensity(randomVal);
      }, 300);
    } else {
      setCurrentIntensity(0);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleToggleSync = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      Alert.alert(
        'Sincronización de Audio & Dispositivo Activada 🎶⚡',
        `Dispositivo Bluetooth sincronizado con el patrón "${activePattern.name}" a ${activePattern.bpm} BPM.`
      );
    }
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Sync de Vibraciones & Ambientes</Text>
          <Text style={styles.subtitle}>
            Sincroniza la intensidad de tu dispositivo Bluetooth (QIUI / Lovense) con los ritmos y frecuencias de las playlists de escena
          </Text>
        </View>

        {/* Live Audio Visualizer Card */}
        <View style={styles.visualizerCard}>
          <Text style={styles.visStatus}>{isPlaying ? '🟢 TRANSMITIENDO A DISPOSITIVO' : '⏸️ EN ESPERA'}</Text>
          <Text style={styles.visIntensity}>{currentIntensity}%</Text>
          <Text style={styles.visLabel}>Intensidad Hápitica de Salida</Text>

          {/* Equalizer Bar Chart */}
          <View style={styles.eqRow}>
            {activePattern.pulseGraph.map((val, idx) => (
              <View key={idx} style={styles.eqCol}>
                <View
                  style={[
                    styles.eqBar,
                    { height: isPlaying ? `${(val * currentIntensity) / 100}%` : '15%' },
                    isPlaying && { backgroundColor: colors.accent },
                  ]}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.syncBtn, isPlaying && styles.syncBtnActive]}
            onPress={handleToggleSync}
          >
            <Text style={styles.syncBtnText}>
              {isPlaying ? 'Detener Sincronización ⏸️' : 'Iniciar Sincronización Háptica 🎵⚡'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>🎶 Seleccionar Patrón de Ambientes Sonoros:</Text>
          <View style={{ gap: spacing.md }}>
            {PRESET_PATTERNS.map((pat) => (
              <TouchableOpacity
                key={pat.id}
                style={[styles.patternCard, activePattern.id === pat.id && styles.patternCardActive]}
                onPress={() => setActivePattern(pat)}
              >
                <View style={styles.patHeader}>
                  <Text style={styles.patName}>{pat.name}</Text>
                  <Text style={styles.patBpm}>⏱️ {pat.bpm} BPM</Text>
                </View>

                <Text style={styles.patLevel}>Intensidad: {pat.intensityLevel}</Text>
              </TouchableOpacity>
            ))}
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
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  visualizerCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: 24,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  visStatus: { color: colors.success, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  visIntensity: { color: colors.text, fontSize: 48, fontWeight: '900' },
  visLabel: { color: colors.textMuted, fontSize: fontSize.xs },

  eqRow: { flexDirection: 'row', gap: 6, height: 60, alignItems: 'flex-end', marginVertical: spacing.md },
  eqCol: { flex: 1, height: '100%', backgroundColor: colors.surfaceLight, borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  eqBar: { width: '100%', backgroundColor: colors.primary, borderRadius: 4 },

  syncBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: radii.lg, width: '100%', alignItems: 'center' },
  syncBtnActive: { backgroundColor: colors.danger },
  syncBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '900' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },
  sectionTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },

  patternCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1.5, borderColor: colors.border, gap: 4 },
  patternCardActive: { borderColor: colors.primary, backgroundColor: colors.accentSoft },
  patHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  patName: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  patBpm: { color: colors.warning, fontSize: fontSize.xs, fontWeight: '800' },
  patLevel: { color: colors.textMuted, fontSize: 10 },
});
