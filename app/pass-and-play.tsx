import React, { useState, useEffect } from 'react';
import {
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
import { getAllActivities } from '@/data/activities';
import { QUICK_PROFILE_ACTIVITIES } from '@/data/quickProfile';
import { ActivityResponse, Rating, RolePreference } from '@/types';
import { createLocalSession, saveGuestProfile, saveLocalSessions, loadLocalSessions } from '@/lib/storage';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { INTIMACY_QUESTIONS_36 } from '@/data/intimacyQuestions';
import { PassAndPlaySetup } from '@/components/pass-and-play/PassAndPlaySetup';
import { PassAndPlayQuestionsStep } from '@/components/pass-and-play/PassAndPlayQuestionsStep';
import { PassAndPlayCurtain } from '@/components/pass-and-play/PassAndPlayCurtain';
import { IntimacyQuestions36Step } from '@/components/pass-and-play/IntimacyQuestions36Step';

const STORAGE_KEY_INTIMACY_36 = 'intimacy_36_progress_v1';

export default function PassAndPlayScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [mode, setMode] = useState<'compat_test' | '36_questions'>('compat_test');
  const [step, setStep] = useState<'p1_setup' | 'p1_questions' | 'curtain' | 'p2_questions'>('p1_setup');
  const [questionMode, setQuestionMode] = useState<'express' | 'full'>('express');
  const [curtainPin, setCurtainPin] = useState('');
  
  // 36 Questions Progress State
  const [q36Index, setQ36Index] = useState(0);

  // Person 1
  const [p1Name, setP1Name] = useState('Persona 1');
  const [p1Index, setP1Index] = useState(0);
  const [p1Responses, setP1Responses] = useState<Record<string, ActivityResponse>>({});

  // Person 2
  const [p2Name, setP2Name] = useState('Persona 2');
  const [p2Index, setP2Index] = useState(0);
  const [p2Responses, setP2Responses] = useState<Record<string, ActivityResponse>>({});

  // Determine current activity list (Express 10 items vs Full catalog)
  const activitiesList = questionMode === 'express' ? QUICK_PROFILE_ACTIVITIES : getAllActivities();

  // Load saved 36 questions progress on mount
  useEffect(() => {
    readJsonStorage<{ index: number }>(STORAGE_KEY_INTIMACY_36, { index: 0 })
      .then((saved) => {
        if (saved) setQ36Index(saved.index || 0);
      });
  }, []);

  const handleNextQ36 = async () => {
    const nextIndex = Math.min(q36Index + 1, INTIMACY_QUESTIONS_36.length - 1);
    setQ36Index(nextIndex);
    await writeJsonStorage(STORAGE_KEY_INTIMACY_36, { index: nextIndex });
  };

  const handleP1Response = (rating: Rating, role: RolePreference, intensity: 1 | 2 | 3 | 4 | 5) => {
    const act = activitiesList[p1Index];
    setP1Responses((prev) => ({
      ...prev,
      [act.id]: { activityId: act.id, rating, role, intensity },
    }));

    if (p1Index < activitiesList.length - 1) {
      setP1Index((i) => i + 1);
    } else {
      setStep('curtain');
    }
  };

  const handleP2Response = async (rating: Rating, role: RolePreference, intensity: 1 | 2 | 3 | 4 | 5) => {
    const act = activitiesList[p2Index];
    const newP2 = {
      ...p2Responses,
      [act.id]: { activityId: act.id, rating, role, intensity },
    };
    setP2Responses(newP2);

    if (p2Index < activitiesList.length - 1) {
      setP2Index((i) => i + 1);
    } else {
      // Both finished! Create ZK session and jump to report
      try {
        const finalP1 = Object.values(p1Responses);
        const finalP2 = Object.values(newP2);
        const session = await createLocalSession(p1Name, finalP1);

        const allSessions = await loadLocalSessions();
        if (allSessions[session.id]) {
          allSessions[session.id].guestNickname = p2Name;
          allSessions[session.id].guestResponses = finalP2;
          allSessions[session.id].status = 'complete';
          allSessions[session.id].completedAt = new Date().toISOString();
          await saveLocalSessions(allSessions);
        }

        await saveGuestProfile(session.id, { nickname: p2Name, notes: '' });

        Alert.alert('¡Cuestionario Presencial Completado! 🎉', 'Generando reporte de compatibilidad en pantalla...');
        router.replace({ pathname: '/report', params: { token: session.initiatorToken } });
      } catch {
        Alert.alert('Error', 'No se pudo generar la sesión presencial.');
      }
    }
  };

  const currentP1Act = activitiesList[p1Index];
  const currentP2Act = activitiesList[p2Index];

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Modo Presencial (Mismo Teléfono)</Text>
          <Text style={styles.subtitle}>
            Turnos alternados en un solo dispositivo con cortina de privacidad entre personas
          </Text>
        </View>

        {/* Mode Selector Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, mode === 'compat_test' && styles.tabActive]}
            onPress={() => setMode('compat_test')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, mode === 'compat_test' && styles.tabTextActive]}>
              📱 Test de Compatibilidad
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, mode === '36_questions' && styles.tabActive]}
            onPress={() => setMode('36_questions')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, mode === '36_questions' && styles.tabTextActive]}>
              💬 36 Preguntas Íntimas
            </Text>
          </TouchableOpacity>
        </View>

        {mode === '36_questions' ? (
          <IntimacyQuestions36Step
            q36Index={q36Index}
            onNextQ36={handleNextQ36}
          />
        ) : (
          <>
            {/* Step 1: P1 Setup */}
            {step === 'p1_setup' && (
              <PassAndPlaySetup
                p1Name={p1Name}
                setP1Name={setP1Name}
                p2Name={p2Name}
                setP2Name={setP2Name}
                questionMode={questionMode}
                setQuestionMode={setQuestionMode}
                curtainPin={curtainPin}
                setCurtainPin={setCurtainPin}
                onStart={() => setStep('p1_questions')}
              />
            )}

            {/* Step 2: P1 Questions */}
            {step === 'p1_questions' && currentP1Act && (
              <PassAndPlayQuestionsStep
                personName={p1Name}
                currentIndex={p1Index}
                totalCount={activitiesList.length}
                activity={currentP1Act}
                badgeColor={colors.primary}
                onResponse={handleP1Response}
              />
            )}

            {/* Step 3: Privacy Curtain between P1 and P2 */}
            {step === 'curtain' && (
              <PassAndPlayCurtain
                p1Name={p1Name}
                p2Name={p2Name}
                curtainPin={curtainPin}
                onUnlockP2Turn={() => setStep('p2_questions')}
              />
            )}

            {/* Step 4: P2 Questions */}
            {step === 'p2_questions' && currentP2Act && (
              <PassAndPlayQuestionsStep
                personName={p2Name}
                currentIndex={p2Index}
                totalCount={activitiesList.length}
                activity={currentP2Act}
                badgeColor={colors.accent}
                onResponse={handleP2Response}
              />
            )}
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 640, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.xl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  tabsRow: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.sm },
  tab: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.md, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textMuted, fontFamily: fonts.bodySemi, fontSize: fontSize.xs },
  tabTextActive: { color: colors.text, fontFamily: fonts.bodyBold },
});
