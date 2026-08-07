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
import { Button } from '@/components/Button';
import { AppHeader } from '@/components/AppHeader';
import {
  colors,
  fonts,
  fontSize,
  radii,
  spacing,
  typography,
} from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { ARCHETYPE_QUESTIONS, calculateArchetypes, ArchetypeResult } from '@/lib/archetypes';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

const RESULT_ROWS: { key: keyof ArchetypeResult; label: string }[] = [
  { key: 'dominant', label: 'Dominante' },
  { key: 'submissive', label: 'Sumiso/a' },
  { key: 'rigger', label: 'Rigger' },
  { key: 'ropeBunny', label: 'Rope bunny' },
  { key: 'sadist', label: 'Sadista' },
  { key: 'masochist', label: 'Masoquista' },
  { key: 'primal', label: 'Primal' },
  { key: 'sensorySpecialist', label: 'Especialista sensorial' },
];

export default function ArchetypesScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<ArchetypeResult | null>(null);

  // Load saved archetype profile on mount
  useEffect(() => {
    readJsonStorage<ArchetypeResult | null>('user_kink_archetype_profile_v1', null).then((saved: ArchetypeResult | null) => {
      if (saved) setResult(saved);
    });
  }, []);

  const handleSelectOption = async (optionIdx: number) => {
    const nextAnswers = [...answers, optionIdx];
    setAnswers(nextAnswers);

    if (currentQ < ARCHETYPE_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const calculated = calculateArchetypes(nextAnswers);
      setResult(calculated);
      await writeJsonStorage('user_kink_archetype_profile_v1', calculated);
    }
  };

  const handleResetQuiz = () => {
    setAnswers([]);
    setCurrentQ(0);
    setResult(null);
  };

  const handleShareResult = () => {
    Alert.alert(
      'Perfil listo',
      'Puedes capturar esta pantalla para compartirla o adjuntarla a tu informe.'
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Volver</Text>
        </TouchableOpacity>

        <AppHeader
          title="Arquetipos"
          subtitle="Perfil porcentual de roles e inclinaciones."
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {!result ? (
            <View style={styles.panel}>
              <Text style={styles.qIndex}>
                Pregunta {currentQ + 1} de {ARCHETYPE_QUESTIONS.length}
              </Text>
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
            <View style={styles.panel}>
              <Text style={styles.resultTitle}>Tu perfil de arquetipos</Text>
              <Text style={styles.resultSub}>Distribución estimada de roles y preferencias</Text>

              <View style={styles.breakdownGrid}>
                {RESULT_ROWS.map((item) => {
                  const val = result[item.key] as number;
                  return (
                    <View key={item.key} style={styles.barItem}>
                      <View style={styles.barRow}>
                        <Text style={styles.barLabel}>{item.label}</Text>
                        <Text style={styles.barVal}>{val}%</Text>
                      </View>
                      <View style={styles.track}>
                        <View style={[styles.fill, { width: `${Math.min(100, val)}%` }]} />
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
                <Button title="Compartir perfil" onPress={handleShareResult} style={{ flex: 1 }} />
                <TouchableOpacity onPress={handleResetQuiz} style={styles.resetBtn}>
                  <Text style={styles.resetBtnText}>🔄 Repetir Test</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.lg },
  containerDesktop: { maxWidth: 640, alignSelf: 'center', width: '100%' },
  backBtn: { alignSelf: 'flex-start', marginTop: spacing.md, marginBottom: spacing.xs },
  backBtnText: {
    fontFamily: fonts.bodySemi,
    color: colors.primary,
    fontSize: fontSize.sm,
  },
  scroll: { gap: spacing.md, paddingBottom: spacing.xxl },
  panel: { gap: spacing.sm },
  qIndex: {
    ...typography.label,
    color: colors.primary,
  },
  qText: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    color: colors.text,
    lineHeight: 30,
  },
  optBtn: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  optText: {
    fontFamily: fonts.bodySemi,
    color: colors.text,
    fontSize: fontSize.sm,
  },
  resultTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  resultSub: { ...typography.bodyMuted, fontSize: fontSize.sm },
  breakdownGrid: { gap: spacing.sm, marginTop: spacing.md },
  barItem: { gap: 4 },
  barRow: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: {
    fontFamily: fonts.bodySemi,
    color: colors.text,
    fontSize: fontSize.sm,
  },
  barVal: {
    fontFamily: fonts.bodyBold,
    color: colors.primary,
    fontSize: fontSize.sm,
  },
  track: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  resetBtn: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetBtnText: {
    fontFamily: fonts.bodySemi,
    color: colors.text,
    fontSize: fontSize.xs,
  },
});
