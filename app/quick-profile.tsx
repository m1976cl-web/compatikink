import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, spacing } from '@/constants/theme';
import { Activity, ActivityResponse, ExperienceLevel, Rating, RolePreference } from '@/types';
import { QUICK_PROFILE_ACTIVITIES } from '@/data/quickProfile';
import { createSession } from '@/lib/sessions';
import { saveProfile, getCurrentProfile } from '@/lib/storage';
import { PronounsPicker } from '@/components/PronounsPicker';
import { ExperiencePicker } from '@/components/ExperiencePicker';

const RATING_OPTIONS: { label: string; value: Rating; emoji: string; color: string }[] = [
  { label: 'Límite duro', value: 'hard_limit', emoji: '🚫', color: '#f87171' },
  { label: 'No me interesa', value: 'not_interested', emoji: '😐', color: '#94a3b8' },
  { label: 'Curiosidad', value: 'curious', emoji: '🤔', color: '#fbbf24' },
  { label: 'Me gusta', value: 'like', emoji: '😊', color: '#60a5fa' },
  { label: 'Me encanta', value: 'love', emoji: '🔥', color: '#c084fc' },
];

const ROLE_OPTIONS: { label: string; value: RolePreference }[] = [
  { label: 'Dar / Dom', value: 'give' },
  { label: 'Recibir / Sub', value: 'receive' },
  { label: 'Ambos', value: 'both' },
  { label: 'Flexible', value: 'flexible' },
];

const defaultResponse = (id: string): ActivityResponse => ({
  activityId: id,
  rating: 'not_interested',
  role: 'flexible',
  intensity: 3,
});

export default function QuickProfileScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | undefined>(undefined);
  const [pin, setPin] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, ActivityResponse>>(
    () => Object.fromEntries(QUICK_PROFILE_ACTIVITIES.map((a) => [a.id, defaultResponse(a.id)]))
  );
  const [step, setStep] = useState<'intro' | 'questions' | 'pin'>('intro');
  const [saving, setSaving] = useState(false);

  const currentActivity = QUICK_PROFILE_ACTIVITIES[currentIndex];
  const currentResponse = responses[currentActivity?.id];
  const isLast = currentIndex === QUICK_PROFILE_ACTIVITIES.length - 1;
  const progress = (currentIndex + 1) / QUICK_PROFILE_ACTIVITIES.length;

  const setRating = (rating: Rating) => {
    setResponses((prev) => ({ ...prev, [currentActivity.id]: { ...prev[currentActivity.id], rating } }));
    // Auto-advance after short delay
    setTimeout(() => {
      if (!isLast) {
        setCurrentIndex((i) => i + 1);
      }
    }, 200);
  };

  const setRole = (role: RolePreference) => {
    setResponses((prev) => ({ ...prev, [currentActivity.id]: { ...prev[currentActivity.id], role } }));
  };

  const handleFinishQuestions = () => {
    setStep('pin');
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('Nombre requerido', 'Ingresa un nick para continuar.');
      return;
    }
    if (pin && pin.length < 4) {
      Alert.alert('PIN inválido', 'El PIN debe tener al menos 4 dígitos.');
      return;
    }

    setSaving(true);
    try {
      const finalResponses = Object.values(responses);

      // Save profile locally
      const profile = {
        nickname: nickname.trim(),
        pronouns: pronouns || undefined,
        experienceLevel,
        pin: pin || undefined,
        baseResponses: finalResponses,
        createdSessionIds: [],
        receivedSessionIds: [],
        isQuickProfile: true, // flag indicating it can be expanded
      };
      await saveProfile(profile as any);

      // Mark onboarding as seen
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.setItem('onboarding_done', 'true');
      await AsyncStorage.setItem('current_profile_nickname', nickname.trim());

      Alert.alert(
        '¡Perfil Creado! 🎉',
        `¡Bienvenido/a, ${nickname.trim()}! Tu perfil rápido está listo. Puedes ampliar tus respuestas cuando quieras desde el Dashboard.`,
        [{ text: 'Continuar', onPress: () => router.replace('/') }]
      );
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (step === 'intro') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.heroSection}>
            <Text style={styles.heroEmoji}>⚡</Text>
            <Text style={styles.heroTitle}>Perfil Rápido</Text>
            <Text style={styles.heroDesc}>
              Solo 10 preguntas clave. En menos de 2 minutos tendrás tu perfil listo para invitar a alguien.
            </Text>
            <View style={styles.pillRow}>
              <View style={styles.pill}><Text style={styles.pillText}>⏱ ~2 minutos</Text></View>
              <View style={styles.pill}><Text style={styles.pillText}>🔐 100% privado</Text></View>
              <View style={styles.pill}><Text style={styles.pillText}>✨ Ampliable luego</Text></View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Tu nick o nombre *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Alex"
              placeholderTextColor={colors.textMuted}
              value={nickname}
              onChangeText={setNickname}
              autoFocus
            />

            <Text style={styles.fieldLabel}>Pronombres (opcional)</Text>
            <PronounsPicker value={pronouns} onChange={setPronouns} />

            <Text style={styles.fieldLabel}>Nivel de experiencia en kink</Text>
            <ExperiencePicker value={experienceLevel} onChange={setExperienceLevel} />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, !nickname.trim() && styles.primaryBtnDisabled]}
            disabled={!nickname.trim()}
            onPress={() => setStep('questions')}
          >
            <Text style={styles.primaryBtnText}>Empezar las 10 preguntas ⚡</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/questionnaire')} style={styles.skipLink}>
            <Text style={styles.skipLinkText}>Prefiero el cuestionario completo (70+ preguntas)</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'questions') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.questionContainer}>
          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{currentIndex + 1} / {QUICK_PROFILE_ACTIVITIES.length}</Text>
          </View>

          {/* Activity Card */}
          <View style={styles.activityCard}>
            <Text style={styles.activityCategory}>
              {currentActivity?.category?.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={styles.activityName}>{currentActivity?.name}</Text>
            <Text style={styles.activityDesc}>{currentActivity?.description}</Text>
          </View>

          {/* Rating Buttons */}
          <View style={styles.ratingGrid}>
            {RATING_OPTIONS.map((opt) => {
              const selected = currentResponse?.rating === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.ratingBtn, selected && { borderColor: opt.color, backgroundColor: `${opt.color}18` }]}
                  onPress={() => setRating(opt.value)}
                >
                  <Text style={styles.ratingEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.ratingLabel, selected && { color: opt.color, fontWeight: '700' }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Role (only for non-negative) */}
          {currentResponse?.rating !== 'hard_limit' && currentResponse?.rating !== 'not_interested' ? (
            <View style={styles.roleRow}>
              {ROLE_OPTIONS.map((r) => {
                const selected = currentResponse?.role === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.roleChip, selected && styles.roleChipActive]}
                    onPress={() => setRole(r.value)}
                  >
                    <Text style={[styles.roleChipText, selected && styles.roleChipTextActive]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {/* Navigation */}
          <View style={styles.navRow}>
            {currentIndex > 0 ? (
              <TouchableOpacity
                style={styles.navBtnSecondary}
                onPress={() => setCurrentIndex((i) => i - 1)}
              >
                <Text style={styles.navBtnSecondaryText}>← Anterior</Text>
              </TouchableOpacity>
            ) : <View style={{ flex: 1 }} />}

            {isLast ? (
              <TouchableOpacity style={styles.primaryBtnSmall} onPress={handleFinishQuestions}>
                <Text style={styles.primaryBtnText}>Siguiente →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.navBtnSecondary}
                onPress={() => setCurrentIndex((i) => Math.min(i + 1, QUICK_PROFILE_ACTIVITIES.length - 1))}
              >
                <Text style={styles.navBtnSecondaryText}>Saltar →</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Step: PIN
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🔐</Text>
          <Text style={styles.heroTitle}>Protege tu Perfil</Text>
          <Text style={styles.heroDesc}>
            Añade un PIN de 4 dígitos para guardar tu perfil de forma segura y poder recuperarlo después.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>PIN de seguridad (4–8 dígitos)</Text>
          <TextInput
            style={[styles.input, styles.pinInput]}
            placeholder="1234"
            placeholderTextColor={colors.textMuted}
            value={pin}
            onChangeText={setPin}
            keyboardType="numeric"
            secureTextEntry
            maxLength={8}
            autoFocus
          />
          <Text style={styles.pinHint}>Si no quieres PIN, déjalo vacío. Solo podrás usar este dispositivo.</Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, saving && styles.primaryBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.primaryBtnText}>
            {saving ? 'Guardando...' : '¡Crear mi Perfil y Entrar! 🚀'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  heroEmoji: { fontSize: 52, marginBottom: spacing.sm },
  heroTitle: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  heroDesc: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pill: {
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  pillText: {
    color: colors.neonPurple,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: fontSize.md,
  },
  pinInput: {
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '700',
  },
  pinHint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnSmall: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  primaryBtnDisabled: { opacity: 0.45 },
  primaryBtnText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: fontSize.md,
  },
  skipLink: { alignItems: 'center', marginTop: spacing.xs },
  skipLinkText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textDecorationLine: 'underline',
  },
  // Question flow
  questionContainer: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
    justifyContent: 'center',
  },
  progressSection: {
    gap: spacing.xs,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'right',
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.25)',
    gap: spacing.xs,
  },
  activityCategory: {
    color: colors.neonPurple,
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  activityName: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  activityDesc: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  ratingBtn: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    minWidth: '18%',
    flex: 1,
  },
  ratingEmoji: { fontSize: 20, marginBottom: 2 },
  ratingLabel: {
    color: colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  roleChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  roleChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
  },
  roleChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '600' },
  roleChipTextActive: { color: colors.text, fontWeight: '700' },
  navRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  navBtnSecondary: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  navBtnSecondaryText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
});
