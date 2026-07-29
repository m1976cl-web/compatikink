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
import { ARCHETYPE_QUESTIONS, calculateArchetypes, ArchetypeResult } from '@/lib/archetypes';

export default function ArchetypesScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<ArchetypeResult | null>(null);

  const handleSelectOption = (optionIdx: number) => {
    const nextAnswers = [...answers, optionIdx];
    setAnswers(nextAnswers);

    if (currentQ < ARCHETYPE_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const calculated = calculateArchetypes(nextAnswers);
      setResult(calculated);
    }
  };

  const handleShareResult = () => {
    Alert.alert('¡Tarjeta de Arquetipos Lista! 📸', 'Puedes guardar esta captura de tu perfil de arquetipos para compartirla o adjuntarla a tu informe de compatibilidad.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📊 Quiz de Arquetipos BDSM</Text>
          <Text style={styles.subtitle}>
            Descubre tu perfil porcentual de roles e inclinaciones (Estilo BDSMTest.org)
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {!result ? (
            /* Quiz Questions */
            <View style={styles.card}>
              <Text style={styles.qIndex}>Pregunta {currentQ + 1} de {ARCHETYPE_QUESTIONS.length}</Text>
              <Text style={styles.qText}>{ARCHETYPE_QUESTIONS[currentQ].question}</Text>

              <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                {ARCHETYPE_QUESTIONS[currentQ].options.map((opt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.optBtn}
                    onPress={() => handleSelectOption(idx)}
                  >
                    <Text style={styles.optText}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            /* Quiz Results Breakdown */
            <View style={styles.card}>
              <Text style={styles.resultTitle}>🎯 Tu Perfil de Arquetipos BDSM</Text>
              <Text style={styles.resultSub}>Distribución estimada de tus roles dominantes y preferencias</Text>

              <View style={styles.breakdownGrid}>
                {[
                  { label: '👑 Dominante', val: result.dominant },
                  { label: '🧎 Sumiso/a', val: result.submissive },
                  { label: '🪢 Rigger (Cuerdas)', val: result.rigger },
                  { label: '🐰 Rope Bunny', val: result.ropeBunny },
                  { label: '🔥 Sadista', val: result.sadist },
                  { label: '🕯️ Masoquista', val: result.masochist },
                  { label: '✨ Especialista Sensorial', val: result.sensorySpecialist },
                ].map((item, idx) => (
                  <View key={idx} style={styles.barItem}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={styles.barLabel}>{item.label}</Text>
                      <Text style={styles.barVal}>{item.val}%</Text>
                    </View>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${Math.min(100, item.val)}%` }]} />
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.shareBtn} onPress={handleShareResult}>
                <Text style={styles.shareBtnText}>Compartir Mi Perfil de Arquetipos 📲</Text>
              </TouchableOpacity>
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
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.xs },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  card: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.lg, borderWidth: 1.5, borderColor: 'rgba(192, 132, 252, 0.3)', gap: spacing.md },
  qIndex: { color: colors.neonPurple, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  qText: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },

  optBtn: { backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  optText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '700' },

  resultTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '900' },
  resultSub: { color: colors.textMuted, fontSize: fontSize.xs },

  breakdownGrid: { gap: spacing.xs, marginTop: spacing.xs },
  barItem: { gap: 2 },
  barLabel: { color: colors.text, fontSize: fontSize.xs, fontWeight: '700' },
  barVal: { color: colors.neonPurple, fontSize: fontSize.xs, fontWeight: '900' },
  track: { height: 8, backgroundColor: colors.surfaceLight, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },

  shareBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: 16, alignItems: 'center', marginTop: spacing.md },
  shareBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '900' },
});
