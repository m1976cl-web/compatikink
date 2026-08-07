import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { getAllActivities } from '@/data/activities';
import { ActivityResponse, Rating, RolePreference } from '@/types';
import { createLocalSession, saveGuestProfile, saveLocalSessions, loadLocalSessions } from '@/lib/storage';

import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { INTIMACY_QUESTIONS_36 } from '@/data/intimacyQuestions';

const STORAGE_KEY_INTIMACY_36 = 'intimacy_36_progress_v1';

export default function PassAndPlayScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const activities = getAllActivities();

  const [mode, setMode] = useState<'compat_test' | '36_questions'>('compat_test');
  const [step, setStep] = useState<'p1_setup' | 'p1_questions' | 'curtain' | 'p2_setup' | 'p2_questions'>('p1_setup');
  
  // 36 Questions Progress State
  const [q36Index, setQ36Index] = useState(0);
  const [q36Notes, setQ36Notes] = useState<Record<number, string>>({});

  // Person 1
  const [p1Name, setP1Name] = useState('Persona 1');
  const [p1Index, setP1Index] = useState(0);
  const [p1Responses, setP1Responses] = useState<Record<string, ActivityResponse>>({});

  // Person 2
  const [p2Name, setP2Name] = useState('Persona 2');
  const [p2Index, setP2Index] = useState(0);
  const [p2Responses, setP2Responses] = useState<Record<string, ActivityResponse>>({});

  // Load saved 36 questions progress on mount
  React.useEffect(() => {
    readJsonStorage<{ index: number; notes: Record<number, string> }>(STORAGE_KEY_INTIMACY_36, { index: 0, notes: {} })
      .then((saved) => {
        if (saved) {
          setQ36Index(saved.index || 0);
          setQ36Notes(saved.notes || {});
        }
      });
  }, []);

  const handleNextQ36 = async (noteText?: string) => {
    const nextNotes = { ...q36Notes, [q36Index]: noteText || '' };
    const nextIndex = Math.min(q36Index + 1, INTIMACY_QUESTIONS_36.length - 1);
    setQ36Notes(nextNotes);
    setQ36Index(nextIndex);
    await writeJsonStorage(STORAGE_KEY_INTIMACY_36, { index: nextIndex, notes: nextNotes });
  };

  const handleP1Response = (rating: Rating) => {
    const act = activities[p1Index];
    setP1Responses((prev) => ({
      ...prev,
      [act.id]: { activityId: act.id, rating, role: 'flexible', intensity: 3 },
    }));

    if (p1Index < activities.length - 1) {
      setP1Index((i) => i + 1);
    } else {
      setStep('curtain');
    }
  };

  const handleP2Response = async (rating: Rating) => {
    const act = activities[p2Index];
    const newP2 = {
      ...p2Responses,
      [act.id]: { activityId: act.id, rating, role: 'flexible' as RolePreference, intensity: 3 as const },
    };
    setP2Responses(newP2);

    if (p2Index < activities.length - 1) {
      setP2Index((i) => i + 1);
    } else {
      // Both finished! Create session and jump to report
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

  const currentP1Act = activities[p1Index];
  const currentP2Act = activities[p2Index];

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
          >
            <Text style={[styles.tabText, mode === 'compat_test' && styles.tabTextActive]}>
              📱 Test de Compatibilidad
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, mode === '36_questions' && styles.tabActive]}
            onPress={() => setMode('36_questions')}
          >
            <Text style={[styles.tabText, mode === '36_questions' && styles.tabTextActive]}>
              💬 36 Preguntas Íntimas
            </Text>
          </TouchableOpacity>
        </View>

        {mode === '36_questions' ? (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.cardBox}>
              <Text style={styles.cardTitle}>💬 36 Preguntas de Conversación Íntima Profunda</Text>
              <Text style={styles.stepSub}>
                Guía de diálogo presencial para explorar deseos, vulnerabilidad y acuerdos de seguridad.
              </Text>

              <View style={styles.questionCard}>
                <Text style={styles.qIndexLabel}>Pregunta {q36Index + 1} de {INTIMACY_QUESTIONS_36.length}</Text>
                <Text style={styles.qTextMain}>{INTIMACY_QUESTIONS_36[q36Index]}</Text>
              </View>

              <TouchableOpacity
                style={styles.nextQBtn}
                onPress={() => handleNextQ36()}
              >
                <Text style={styles.nextQBtnText}>
                  {q36Index < INTIMACY_QUESTIONS_36.length - 1 ? 'Siguiente Pregunta ➔' : '✓ Completar Guía Íntima'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <>
            {/* Step 1: P1 Setup */}
            {step === 'p1_setup' && (
              <View style={styles.card}>
                <Text style={styles.stepBadge}>PASO 1 DE 2 — INICIADOR</Text>
                <Text style={styles.cardTitle}>Nombre de Persona 1</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Alex"
                  placeholderTextColor={colors.textMuted}
                  value={p1Name}
                  onChangeText={setP1Name}
                />
                <TouchableOpacity style={styles.btnPrimary} onPress={() => setStep('p1_questions')}>
                  <Text style={styles.btnPrimaryText}>Iniciar mis Respuestas 🚀</Text>
                </TouchableOpacity>
              </View>
            )}

        {/* Step 2: P1 Questions */}
        {step === 'p1_questions' && currentP1Act && (
          <View style={styles.card}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {p1Name} · Pregunta {p1Index + 1} de {activities.length}
              </Text>
            </View>

            <Text style={styles.actName}>{currentP1Act.name}</Text>
            <Text style={styles.actDesc}>{currentP1Act.description}</Text>

            <View style={styles.ratingButtons}>
              <TouchableOpacity style={[styles.rBtn, { borderColor: '#4ade80' }]} onPress={() => handleP1Response('love')}>
                <Text style={styles.rBtnText}>🔥 Me Encanta</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.rBtn, { borderColor: colors.primary }]} onPress={() => handleP1Response('like')}>
                <Text style={styles.rBtnText}>💜 Me Interesa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.rBtn, { borderColor: '#38bdf8' }]} onPress={() => handleP1Response('curious')}>
                <Text style={styles.rBtnText}>🤔 Curioso/a</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.rBtn, { borderColor: colors.border }]} onPress={() => handleP1Response('not_interested')}>
                <Text style={styles.rBtnText}>⚪ No me llama</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.rBtn, { borderColor: colors.danger }]} onPress={() => handleP1Response('hard_limit')}>
                <Text style={styles.rBtnText}>🛑 Límite Duro</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 3: Privacy Curtain between P1 and P2 */}
        {step === 'curtain' && (
          <View style={[styles.card, { alignItems: 'center', paddingVertical: spacing.xl }]}>
            <Text style={{ fontSize: 56 }}>🙈📱</Text>
            <Text style={styles.cardTitle}>¡Turno de Persona 1 Finalizado!</Text>
            <Text style={styles.curtainDesc}>
              Entrega el teléfono a <Text style={{ color: colors.accent, fontWeight: '800' }}>Persona 2</Text> sin mirar la pantalla para mantener la privacidad absoluta.
            </Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => setStep('p2_setup')}>
              <Text style={styles.btnPrimaryText}>Soy Persona 2, Comienzo Mi Turno 🚀</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 4: P2 Setup */}
        {step === 'p2_setup' && (
          <View style={styles.card}>
            <Text style={[styles.stepBadge, { color: colors.accent }]}>PASO 2 DE 2 — PAREJA / INVITADO</Text>
            <Text style={styles.cardTitle}>Nombre de Persona 2</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Sam"
              placeholderTextColor={colors.textMuted}
              value={p2Name}
              onChangeText={setP2Name}
            />
            <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.accent }]} onPress={() => setStep('p2_questions')}>
              <Text style={styles.btnPrimaryText}>Iniciar Respuestas de {p2Name} 🚀</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 5: P2 Questions */}
        {step === 'p2_questions' && currentP2Act && (
          <View style={styles.card}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressText, { color: colors.accent }]}>
                {p2Name} · Pregunta {p2Index + 1} de {activities.length}
              </Text>
            </View>

            <Text style={styles.actName}>{currentP2Act.name}</Text>
            <Text style={styles.actDesc}>{currentP2Act.description}</Text>

            <View style={styles.ratingButtons}>
              <TouchableOpacity style={[styles.rBtn, { borderColor: '#4ade80' }]} onPress={() => handleP2Response('love')}>
                <Text style={styles.rBtnText}>🔥 Me Encanta</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.rBtn, { borderColor: colors.primary }]} onPress={() => handleP2Response('like')}>
                <Text style={styles.rBtnText}>💜 Me Interesa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.rBtn, { borderColor: '#38bdf8' }]} onPress={() => handleP2Response('curious')}>
                <Text style={styles.rBtnText}>🤔 Curioso/a</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.rBtn, { borderColor: colors.border }]} onPress={() => handleP2Response('not_interested')}>
                <Text style={styles.rBtnText}>⚪ No me llama</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.rBtn, { borderColor: colors.danger }]} onPress={() => handleP2Response('hard_limit')}>
                <Text style={styles.rBtnText}>🛑 Límite Duro</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 640, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '900' },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    marginVertical: spacing.md,
    gap: spacing.md,
  },
  stepBadge: { color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  cardTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800' },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontSize: fontSize.sm, fontWeight: '800' },

  progressHeader: { alignItems: 'center', marginBottom: spacing.xs },
  progressText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },
  actName: { color: colors.primary, fontSize: fontSize.xl, fontWeight: '900', textAlign: 'center' },
  actDesc: { color: colors.text, fontSize: fontSize.sm, textAlign: 'center', lineHeight: 20 },

  ratingButtons: { gap: spacing.xs, width: '100%' },
  rBtn: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 12,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  rBtnText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },

  curtainDesc: { color: colors.text, fontSize: fontSize.sm, textAlign: 'center', lineHeight: 22 },

  tabsRow: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.sm },
  tab: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.md, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  tabTextActive: { color: '#fff', fontWeight: '900' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },
  cardBox: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle },
  stepSub: { color: colors.textMuted, fontSize: fontSize.xs },
  questionCard: { backgroundColor: colors.surfaceLight, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  qIndexLabel: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },
  qTextMain: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', lineHeight: 26 },
  nextQBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center' },
  nextQBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: '900' },
});
