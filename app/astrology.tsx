import React, { useState } from 'react';
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
import { ZODIAC_SIGNS, calculateSynastry, ZodiacSign, SynastryResult } from '@/lib/astrology';

export default function AstrologyScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [mySign, setMySign] = useState<ZodiacSign>('escorpio');
  const [partnerSign, setPartnerSign] = useState<ZodiacSign>('tauro');
  const [synastry, setSynastry] = useState<SynastryResult | null>(null);

  const signsKeys = Object.keys(ZODIAC_SIGNS) as ZodiacSign[];

  const handleCalculateSynastry = () => {
    const result = calculateSynastry(mySign, partnerSign);
    setSynastry(result);
    Alert.alert(
      '¡Sinastría Calculada! 🔮✨',
      `Afinidad Cósmica: ${result.score}% para ${ZODIAC_SIGNS[mySign].name} + ${ZODIAC_SIGNS[partnerSign].name}.`
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
          <Text style={styles.title}>🔮 Compatibilidad Astrológica & Sinastría Kink</Text>
          <Text style={styles.subtitle}>
            Calcula la afinidad cósmica de pareja según los signos del zodíaco, sus elementos y arquetipos de deseo
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Sign Selectors */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>👤 Tu Signo del Zodíaco:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.signsScroll}>
              {signsKeys.map((key) => {
                const s = ZODIAC_SIGNS[key];
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.signChip, mySign === key && styles.signChipActive]}
                    onPress={() => setMySign(key)}
                  >
                    <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
                    <Text style={[styles.signChipText, mySign === key && { color: '#fff' }]}>{s.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={[styles.sectionLabel, { marginTop: spacing.md }]}>💘 Signo de tu Pareja / Vínculo:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.signsScroll}>
              {signsKeys.map((key) => {
                const s = ZODIAC_SIGNS[key];
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.signChip, partnerSign === key && styles.signChipPartnerActive]}
                    onPress={() => setPartnerSign(key)}
                  >
                    <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
                    <Text style={[styles.signChipText, partnerSign === key && { color: '#fff' }]}>{s.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={styles.calcBtn} onPress={handleCalculateSynastry}>
              <Text style={styles.calcBtnText}>Calcular Sinastría Kink Cósmica 🔮✨</Text>
            </TouchableOpacity>
          </View>

          {/* Daily Advice for User's Sign */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {ZODIAC_SIGNS[mySign].emoji} Horóscopo Kink Diario — {ZODIAC_SIGNS[mySign].name}
            </Text>
            <Text style={styles.archetypeBadge}>Arquetipo: {ZODIAC_SIGNS[mySign].kinkArchetype}</Text>
            <Text style={styles.cardDesc}>{ZODIAC_SIGNS[mySign].description}</Text>
            <View style={styles.adviceBox}>
              <Text style={styles.adviceText}>✨ Consejo Cósmico: {ZODIAC_SIGNS[mySign].dailyAdvice}</Text>
            </View>
          </View>

          {/* Synastry Result Card */}
          {synastry ? (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>🌌 Resultado de la Sinastría de Pareja</Text>
              <Text style={styles.scoreText}>{synastry.score}% Afinidad</Text>
              <Text style={styles.synergyTitle}>{synastry.synergyTitle}</Text>
              <Text style={styles.synergyDesc}>{synastry.synergyDesc}</Text>

              <View style={styles.recommendedBox}>
                <Text style={styles.recommendedText}>🎬 Escena Sugerida: {synastry.recommendedScene}</Text>
                <Text style={styles.aftercareText}>🪷 Aftercare Cósmico: {synastry.aftercareTip}</Text>
              </View>
            </View>
          ) : null}

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

  card: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.lg, borderWidth: 1.5, borderColor: 'rgba(192, 132, 252, 0.3)', gap: spacing.sm },
  sectionLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '800' },
  signsScroll: { gap: 6, marginVertical: 4 },
  signChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  signChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  signChipPartnerActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  signChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '800' },

  calcBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: 14, alignItems: 'center', marginTop: spacing.xs },
  calcBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '900' },

  cardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900' },
  archetypeBadge: { color: colors.neonPink, fontSize: fontSize.xs, fontWeight: '800' },
  cardDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  adviceBox: { backgroundColor: 'rgba(192, 132, 252, 0.1)', padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(192, 132, 252, 0.3)' },
  adviceText: { color: colors.neonPurple, fontSize: fontSize.xs, fontWeight: '700' },

  resultCard: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.lg, borderWidth: 2, borderColor: colors.success, gap: spacing.xs, alignItems: 'center' },
  resultTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900' },
  scoreText: { color: colors.warning, fontSize: 36, fontWeight: '900' },
  synergyTitle: { color: colors.neonPurple, fontSize: fontSize.sm, fontWeight: '800' },
  synergyDesc: { color: colors.text, fontSize: fontSize.xs, textAlign: 'center', lineHeight: 18 },

  recommendedBox: { backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: 14, gap: 4, width: '100%', borderWidth: 1, borderColor: colors.border, marginTop: 4 },
  recommendedText: { color: colors.warning, fontSize: fontSize.xs, fontWeight: '800' },
  aftercareText: { color: colors.success, fontSize: fontSize.xs, fontWeight: '700' },
});
