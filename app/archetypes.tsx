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
import { getIntimateArchetypes, getNoxAvatarById, saveUserAvatarSelection } from '@/lib/noxAvatars';
import { notify } from '@/lib/notify';
import { Image } from 'react-native';

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

  const handleAssignAvatar = async () => {
    if (!result) return;
    const archs = getIntimateArchetypes();
    let highestKey = 'dominant';
    let highestScore = result.dominant || 0;
    
    RESULT_ROWS.forEach(row => {
      const score = result[row.key] as number;
      if (score > highestScore) {
        highestScore = score;
        highestKey = row.key;
      }
    });

    let archName = 'Switch';
    if (highestKey === 'dominant' || highestKey === 'sadist' || highestKey === 'primal') archName = 'Dominante';
    if (highestKey === 'submissive' || highestKey === 'masochist') archName = 'Sumiso/a';
    if (highestKey === 'rigger') archName = 'Rigger';
    if (highestKey === 'ropeBunny') archName = 'Rope Bunny';
    
    const recommended = archs.find(a => a.name === archName) || archs[0];
    await saveUserAvatarSelection(recommended.recommendedAvatarId, recommended.name);
    notify('Avatar Asignado', `Has asignado el avatar de ${recommended.name} a tu perfil.`);
  };

  const getRecommendedAvatarItem = () => {
    if (!result) return null;
    const archs = getIntimateArchetypes();
    let highestKey = 'dominant';
    let highestScore = result.dominant || 0;
    
    RESULT_ROWS.forEach(row => {
      const score = result[row.key] as number;
      if (score > highestScore) {
        highestScore = score;
        highestKey = row.key;
      }
    });

    let archName = 'Switch';
    if (highestKey === 'dominant' || highestKey === 'sadist' || highestKey === 'primal') archName = 'Dominante';
    if (highestKey === 'submissive' || highestKey === 'masochist') archName = 'Sumiso/a';
    if (highestKey === 'rigger') archName = 'Rigger';
    if (highestKey === 'ropeBunny') archName = 'Rope Bunny';
    
    const recommended = archs.find(a => a.name === archName) || archs[0];
    return {
      archName: recommended.name,
      avatar: getNoxAvatarById(recommended.recommendedAvatarId)
    };
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

              {getRecommendedAvatarItem() && (
                <View style={styles.recommendedContainer}>
                  <Text style={styles.recommendedTitle}>Avatar Recomendado</Text>
                  <View style={styles.recommendedAvatarRow}>
                    <View style={[styles.recommendedAvatarFrame, { borderColor: getRecommendedAvatarItem()!.avatar.glowColor }]}>
                      <Image source={getRecommendedAvatarItem()!.avatar.imageSource} style={styles.recommendedAvatarImage} />
                    </View>
                    <View style={styles.recommendedInfo}>
                      <Text style={styles.recommendedName}>{getRecommendedAvatarItem()!.avatar.name}</Text>
                      <Text style={styles.recommendedArch}>{getRecommendedAvatarItem()!.archName} {getRecommendedAvatarItem()!.avatar.emoji}</Text>
                    </View>
                  </View>
                  <Button 
                    title="🎭 Asignar este Avatar a mi Perfil" 
                    onPress={handleAssignAvatar}
                    style={{ marginTop: spacing.md }}
                  />
                </View>
              )}

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
    color: colors.primaryLight,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.md,
  },
  recommendedContainer: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  recommendedTitle: {
    color: colors.primaryLight,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  recommendedAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendedAvatarFrame: {
    borderWidth: 2,
    borderRadius: 30,
    padding: 2,
  },
  recommendedAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  recommendedInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  recommendedName: {
    color: colors.primaryLight,
    fontFamily: fonts.bodyBold,
    fontSize: 18,
  },
  recommendedArch: {
    color: colors.primary,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
  },
});
