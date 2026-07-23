import { useState, useMemo, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
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
import { CATEGORY_LABELS, ExperienceLevel, UserProfile, ActivityCategory, Rating, Activity } from '@/types';
import { createSession } from '@/lib/sessions';
import { CATEGORY_ORDER, ACTIVITIES, getAllActivities } from '@/data/activities';
import { CustomActivityModal } from '@/components/CustomActivityModal';
import { SwipeDeckView } from '@/components/SwipeDeckView';
import { getCurrentProfile, saveProfile, getCustomActivities } from '@/lib/storage';

export default function QuestionnaireScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nickname, setNickname] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | undefined>(undefined);
  const [userNotes, setUserNotes] = useState('');

  const [guestNickname, setGuestNickname] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [step, setStep] = useState<'intro' | 'categories' | 'questions'>('intro');
  const [enabledCategories, setEnabledCategories] = useState<ActivityCategory[]>([...CATEGORY_ORDER]);
  const [customActivities, setCustomActivities] = useState<Activity[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await getCurrentProfile();
      if (p) {
        setProfile(p);
        setNickname(p.nickname);
        setPronouns(p.pronouns || '');
        setExperienceLevel(p.experienceLevel);
        setUserNotes(p.notes || '');
      }
      const customs = await getCustomActivities();
      setCustomActivities(customs);
    })();
  }, []);

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
    return getAllActivities(customActivities).filter((a) => enabledCategories.includes(a.category)).length;
  }, [enabledCategories, customActivities]);

  const handleFinish = async (finalResponses: any[]) => {
    const name = nickname.trim() || 'Anónimo';
    setLoading(true);
    try {
      const initiatorProfile: UserProfile = {
        ...profile,
        nickname: name,
        pin: profile?.pin || undefined,
        pronouns: pronouns || undefined,
        experienceLevel,
        notes: userNotes.trim() || undefined,
        baseResponses: finalResponses,
      };

      await saveProfile(initiatorProfile);

      const privateGuestNotes = guestNickname.trim() || guestNotes.trim()
        ? { nickname: guestNickname.trim() || 'Invitado', notes: guestNotes.trim() }
        : undefined;

      const session = await createSession(name, finalResponses, privateGuestNotes, initiatorProfile);
      router.replace({ pathname: '/invite', params: { token: session.initiatorToken } });
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar. Revisa tu conexión o configuración.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'intro') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.intro}>
          <Text style={styles.introTitle}>Antes de empezar</Text>
          <Text style={styles.introText}>
            Responderás preguntas sobre tus preferencias eróticas de forma 100% privada. 
            Tus respuestas solo se cruzarán con tu invitado cuando ambos terminen.
          </Text>

          <View style={styles.divider} />
          <Text style={styles.sectionSubTitle}>1. Tu Perfil (Iniciador)</Text>

          <Text style={styles.label}>Tu nick o nombre *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Alex"
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
            placeholder="Ej: Prefiero avanzar gradualmente. Límites en zonas sensibles..."
            placeholderTextColor={colors.textMuted}
            value={userNotes}
            onChangeText={setUserNotes}
            multiline
            numberOfLines={3}
          />

          <View style={styles.divider} />

          <Text style={styles.sectionSubTitle}>2. Ficha Privada de la Otra Persona</Text>
          <Text style={styles.introTextSmall}>
            Define un apodo y añade notas privadas (límites conocidos, contexto...). Solo tú verás esta información en tu reporte.
          </Text>

          <Text style={styles.label}>Su nick o nombre (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Sam"
            placeholderTextColor={colors.textMuted}
            value={guestNickname}
            onChangeText={setGuestNickname}
          />

          <Text style={styles.label}>Notas privadas sobre la otra persona (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ej: Nos conocimos en Tinder. Interés en cuerdas..."
            placeholderTextColor={colors.textMuted}
            value={guestNotes}
            onChangeText={setGuestNotes}
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
        <ScrollView contentContainerStyle={styles.intro}>
          <Text style={styles.introTitle}>Filtro de Categorías</Text>
          <Text style={styles.introText}>
            Desmarca las categorías que no te interesen. Las actividades correspondientes se guardarán automáticamente como "No me interesa" para hacer el test más corto.
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
            title="➕ Añadir actividad propia"
            variant="secondary"
            onPress={() => setShowCustomModal(true)}
          />

          <Button
            title={`🃏 Comenzar en Modo Tarjetas Swipe (${selectedQuestionsCount} preguntas)`}
            onPress={() => setStep('questions')}
          />
          <Button
            title="Volver"
            variant="ghost"
            onPress={() => setStep('intro')}
          />

          <CustomActivityModal
            visible={showCustomModal}
            onClose={() => setShowCustomModal(false)}
            onActivityCreated={(newAct) => setCustomActivities((prev) => [...prev, newAct])}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <QuestionnaireActiveFlow
      nickname={nickname}
      enabledCategories={enabledCategories}
      customActivities={customActivities}
      onFinish={handleFinish}
      loading={loading}
      onBack={() => setStep('categories')}
    />
  );
}

// Subcomponent to isolate the useQuestionnaire hook lifecycle
function QuestionnaireActiveFlow({
  nickname,
  enabledCategories,
  customActivities,
  onFinish,
  loading,
  onBack,
}: {
  nickname: string;
  enabledCategories: ActivityCategory[];
  customActivities: Activity[];
  onFinish: (responses: any[]) => void;
  loading: boolean;
  onBack: () => void;
}) {
  const q = useQuestionnaire(undefined, enabledCategories, customActivities);
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
    // If fastMode is active and it's either negative or we don't want to expand details, auto-advance
    if (fastMode) {
      if (rating === 'hard_limit' || rating === 'not_interested' || !showDetails) {
        // Auto default positive interests
        if (rating !== 'hard_limit' && rating !== 'not_interested') {
          q.setRole('flexible');
          q.setIntensity(3);
        }
        
        // Brief timeout for visual feedback before auto-advancing
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

            <TouchableOpacity onPress={() => setViewMode('swipe')} style={styles.modeSwitchBtn}>
              <Text style={styles.modeSwitchText}>🃏 Modo Tarjetas</Text>
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
                title={loading ? 'Guardando...' : 'Finalizar e Invitar'}
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
  intro: { padding: spacing.lg, gap: spacing.md },
  introTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  introText: {
    color: colors.textMuted,
    lineHeight: 22,
    fontSize: fontSize.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
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
    color: colors.primary,
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
  sectionGap: {
    marginTop: spacing.lg,
  },
  nav: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  navBtn: {
    flex: 1,
  },
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
  introTextSmall: {
    color: colors.textMuted,
    lineHeight: 18,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  textArea: {
    minHeight: 80,
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
    borderColor: colors.primary,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
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
  modeSwitchBtn: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.4)',
  },
  modeSwitchText: {
    color: colors.neonPurple,
    fontSize: fontSize.xs,
    fontWeight: '700',
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
});
