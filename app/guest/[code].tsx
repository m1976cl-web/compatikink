import { useEffect, useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { RatingPicker } from '@/components/RatingPicker';
import { RolePicker } from '@/components/RolePicker';
import { IntensityPicker } from '@/components/IntensityPicker';
import { PronounsPicker } from '@/components/PronounsPicker';
import { ExperiencePicker } from '@/components/ExperiencePicker';
import { ProgressBar, ProgressLabel } from '@/components/ProgressBar';
import { useQuestionnaire } from '@/hooks/useQuestionnaire';
import { colors, fontSize, spacing } from '@/constants/theme';
import { CATEGORY_LABELS, ExperienceLevel, UserProfile, ActivityCategory, Rating } from '@/types';
import { getSessionByInviteCode, submitGuestResponses } from '@/lib/sessions';
import { CATEGORY_ORDER, ACTIVITIES } from '@/data/activities';
import { SwipeDeckView } from '@/components/SwipeDeckView';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GuestQuestionnaireScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | undefined>(undefined);
  const [userNotes, setUserNotes] = useState('');

  const [step, setStep] = useState<'consent' | 'categories' | 'questions'>('consent');
  const [enabledCategories, setEnabledCategories] = useState<ActivityCategory[]>([...CATEGORY_ORDER]);
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);

  // Item 6: Restore guest name if they return to the link
  const GUEST_DRAFT_KEY = `guest_draft_${code}`;

  useEffect(() => {
    if (!code) return;
    // Restore nickname draft
    AsyncStorage.getItem(GUEST_DRAFT_KEY).then((raw) => {
      if (raw) {
        try {
          const draft = JSON.parse(raw);
          if (draft.nickname) setNickname(draft.nickname);
          if (draft.pronouns) setPronouns(draft.pronouns);
          if (draft.userNotes) setUserNotes(draft.userNotes);
        } catch {}
      }
    });

    getSessionByInviteCode(code).then((session) => {
      if (!session) {
        setValid(false);
      } else if (session.status === 'complete') {
        setValid(false);
        Alert.alert('Sesión cerrada', 'Esta invitación ya fue completada.');
      } else if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
        setValid(false);
        Alert.alert('Código expirado', 'Esta invitación ya no es válida. Pide a la otra persona que genere una nueva.');
      } else {
        setValid(true);
      }
    });
  }, [code]);

  // Save draft whenever nickname/pronouns/notes change
  useEffect(() => {
    if (!code || !nickname) return;
    AsyncStorage.setItem(GUEST_DRAFT_KEY, JSON.stringify({ nickname, pronouns, userNotes }));
  }, [nickname, pronouns, userNotes, code]);

  const toggleCategory = (cat: ActivityCategory) => {
    setEnabledCategories((prev) => {
      if (prev.includes(cat)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== cat);
      } else {
        return [...prev, cat];
      }
    });
  };

  const selectedQuestionsCount = useMemo(() => {
    return ACTIVITIES.filter((a) => enabledCategories.includes(a.category)).length;
  }, [enabledCategories]);

  const handleFinish = async (finalResponses: any[]) => {
    if (!code) return;
    const name = nickname.trim() || 'Invitado';
    setLoading(true);
    try {
      const guestProfile: UserProfile = {
        nickname: name,
        pronouns: pronouns || undefined,
        experienceLevel,
        notes: userNotes.trim() || undefined,
      };

      const session = await submitGuestResponses(code, name, finalResponses, guestProfile);
      // Clear draft on successful submission
      await AsyncStorage.removeItem(GUEST_DRAFT_KEY);
      // Save session token temporarily to local storage to allow converting to profile in done.tsx
      await AsyncStorage.setItem('last_completed_guest_session_token', session.initiatorToken);
      router.replace('/guest/done');
    } catch {
      Alert.alert('Error', 'No se pudieron enviar las respuestas. Verifica el código.');
    } finally {
      setLoading(false);
    }
  };

  if (valid === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Código inválido o sesión ya completada.</Text>
        <Button title="Volver" onPress={() => router.replace('/')} variant="secondary" />
      </View>
    );
  }

  if (valid === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Verificando código...</Text>
      </View>
    );
  }

  if (step === 'consent') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.consent}>
          <Text style={styles.consentTitle}>Antes de responder</Text>
          <Text style={styles.consentText}>
            • Solo para mayores de 18 años.{'\n'}
            • Tus respuestas son privadas y confidenciales.{'\n'}
            • Quien te invitó verá la compatibilidad de vuestros intereses mutuos.{'\n'}
            • Puedes marcar límites duros en cualquier actividad.
          </Text>

          <View style={styles.divider} />

          {/* Restored draft banner */}
          {nickname ? (
            <View style={styles.restoredBanner}>
              <Text style={styles.restoredBannerText}>
                ✅ Recuperamos tu nombre de una sesión anterior: <Text style={{ fontWeight: '800' }}>{nickname}</Text>. Puedes cambiarlo si quieres.
              </Text>
            </View>
          ) : null}

          <Text style={styles.sectionSubTitle}>Tu Perfil (Invitado)</Text>


          <Text style={styles.label}>Tu nick o nombre *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Sam"
            placeholderTextColor={colors.textMuted}
            value={nickname}
            onChangeText={setNickname}
          />

          <Text style={styles.label}>Pronombres (opcional)</Text>
          <PronounsPicker value={pronouns} onChange={setPronouns} />

          <Text style={[styles.label, styles.fieldGap]}>Nivel de experiencia (opcional)</Text>
          <ExperiencePicker value={experienceLevel} onChange={setExperienceLevel} />

          <Text style={[styles.label, styles.fieldGap]}>Sobre ti / Límites generales (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ej: Curiosidad por probar cosas nuevas con calma..."
            placeholderTextColor={colors.textMuted}
            value={userNotes}
            onChangeText={setUserNotes}
            multiline
            numberOfLines={3}
          />

          <Button 
            title="Siguiente: Filtrar Categorías" 
            onPress={() => {
              if (!nickname.trim()) {
                Alert.alert('Nick requerido', 'Por favor ingresa tu nick para continuar.');
                return;
              }
              setStep('categories');
            }} 
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'categories') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.consent}>
          <Text style={styles.consentTitle}>Filtro de Categorías</Text>
          <Text style={styles.consentText}>
            Desmarca las categorías que no te interesen para omitir esas preguntas automáticamente.
          </Text>

          <View style={styles.categoryGrid}>
            {CATEGORY_ORDER.map((cat) => {
              const active = enabledCategories.includes(cat);
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.8}
                  style={[styles.categoryCard, active && styles.categoryCardActive]}
                  onPress={() => toggleCategory(cat)}
                >
                  <Text style={[styles.categoryCardText, active && styles.categoryCardTextActive]}>
                    {CATEGORY_LABELS[cat]}
                  </Text>
                  <Text style={styles.categoryCardSub}>
                    {active ? '✓ Activa' : '✕ Omitida'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />

          <Button
            title={`Comenzar (${selectedQuestionsCount} preguntas)`}
            onPress={() => setStep('questions')}
          />
          <Button
            title="Volver"
            variant="ghost"
            onPress={() => setStep('consent')}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <GuestQuestionnaireActiveFlow
      enabledCategories={enabledCategories}
      onFinish={handleFinish}
      loading={loading}
      onBack={() => setStep('categories')}
    />
  );
}

function GuestQuestionnaireActiveFlow({
  enabledCategories,
  onFinish,
  loading,
  onBack,
}: {
  enabledCategories: ActivityCategory[];
  onFinish: (responses: any[]) => void;
  loading: boolean;
  onBack: () => void;
}) {
  const q = useQuestionnaire(undefined, enabledCategories);
  const [fastMode, setFastMode] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'swipe' | 'list'>('swipe');

  if (viewMode === 'swipe') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <SwipeDeckView
          activities={q.activities}
          responses={q.responses}
          onResponseChange={(actId, resp) => {
            q.setRating(resp.rating);
            if (resp.role) q.setRole(resp.role);
          }}
          onFinish={() => onFinish(q.finalResponses)}
          onSwitchToForm={() => setViewMode('list')}
        />
      </SafeAreaView>
    );
  }

  const handleRatingSelect = (rating: Rating) => {
    q.setRating(rating);
    if (fastMode) {
      if (rating === 'hard_limit' || rating === 'not_interested' || !showDetails) {
        if (rating !== 'hard_limit' && rating !== 'not_interested') {
          q.setRole('flexible');
          q.setIntensity(3);
        }
        setTimeout(() => {
          if (!q.isLast) {
            q.goNext();
          }
        }, 120);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Top Control Bar */}
          <View style={styles.controlHeader}>
            <TouchableOpacity onPress={onBack} style={styles.backLink}>
              <Text style={styles.backLinkText}>← Salir</Text>
            </TouchableOpacity>
            
            <View style={styles.fastModeContainer}>
              <Text style={styles.fastModeLabel}>Modo Rápido ⚡</Text>
              <Switch
                value={fastMode}
                onValueChange={setFastMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
          </View>

          <ProgressBar progress={q.progress} />
          <ProgressLabel current={q.currentIndex + 1} total={q.total} />

          <Text style={styles.category}>{CATEGORY_LABELS[q.currentActivity.category]}</Text>
          <Text style={styles.activityName}>{q.currentActivity.name}</Text>
          <Text style={styles.description}>{q.currentActivity.description}</Text>

          <Text style={styles.sectionLabel}>¿Qué te parece?</Text>
          <RatingPicker value={q.currentResponse.rating} onChange={handleRatingSelect} />

          {/* Details toggle for positive rating responses in fast mode */}
          {q.currentResponse.rating !== 'hard_limit' &&
          q.currentResponse.rating !== 'not_interested' ? (
            <View style={styles.detailsSection}>
              {!showDetails && fastMode ? (
                <TouchableOpacity 
                  style={styles.detailsToggle} 
                  onPress={() => setShowDetails(true)}
                >
                  <Text style={styles.detailsToggleText}>⚙️ Personalizar Rol e Intensidad</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <Text style={[styles.sectionLabel, styles.sectionGap]}>Rol preferido</Text>
                  <RolePicker value={q.currentResponse.role} onChange={q.setRole} />

                  <Text style={[styles.sectionLabel, styles.sectionGap]}>Intensidad</Text>
                  <IntensityPicker
                    value={q.currentResponse.intensity}
                    onChange={q.setIntensity}
                  />

                  {fastMode && (
                    <TouchableOpacity 
                      style={styles.detailsToggleClose} 
                      onPress={() => setShowDetails(false)}
                    >
                      <Text style={styles.detailsToggleCloseText}>Ocultar personalización</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          ) : null}

          <View style={styles.nav}>
            {!q.isFirst ? (
              <Button title="Anterior" onPress={q.goPrev} variant="secondary" style={styles.navBtn} />
            ) : (
              <View style={styles.navBtn} />
            )}
            {q.isLast ? (
              <Button
                title={loading ? 'Enviando...' : 'Enviar Respuestas'}
                onPress={() => onFinish(q.getAllResponses())}
                disabled={loading}
                style={styles.navBtn}
              />
            ) : (
              <Button title="Siguiente" onPress={q.goNext} style={styles.navBtn} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  consent: { padding: spacing.lg, gap: spacing.md },
  consentTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  consentText: {
    color: colors.textMuted,
    lineHeight: 24,
    fontSize: fontSize.md,
  },
  label: { color: colors.textMuted, fontSize: fontSize.sm },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  category: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activityName: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  fieldGap: {
    marginTop: spacing.md,
  },
  sectionGap: { marginTop: spacing.lg },
  nav: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  navBtn: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  error: { color: colors.danger, textAlign: 'center' },
  muted: { color: colors.textMuted },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  sectionSubTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  categoryCardActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(244, 114, 182, 0.1)',
  },
  categoryCardText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryCardTextActive: {
    color: colors.text,
  },
  categoryCardSub: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backLink: {
    paddingVertical: spacing.xs,
  },
  backLinkText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  fastModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fastModeLabel: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  detailsSection: {
    marginTop: spacing.md,
  },
  detailsToggle: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  detailsToggleText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  detailsToggleClose: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  detailsToggleCloseText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textDecorationLine: 'underline',
  },
  restoredBanner: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    marginBottom: spacing.sm,
  },
  restoredBannerText: {
    color: colors.success,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
});
