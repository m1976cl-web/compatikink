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
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { Activity, ActivityResponse, ExperienceLevel, Rating, RolePreference, UserProfile, FetishBadge } from '@/types';
import { QUICK_PROFILE_ACTIVITIES } from '@/data/quickProfile';
import { saveProfile, getCurrentProfile, setCurrentProfile, getProfile } from '@/lib/storage';
import { PronounsPicker } from '@/components/PronounsPicker';
import { ExperiencePicker } from '@/components/ExperiencePicker';
import { AppHeader } from '@/components/AppHeader';

const RATING_OPTIONS: { label: string; value: Rating; color: string }[] = [
  { label: 'Límite duro', value: 'hard_limit', color: colors.danger },
  { label: 'No me interesa', value: 'not_interested', color: colors.textMuted },
  { label: 'Curiosidad', value: 'curious', color: colors.warning },
  { label: 'Me gusta', value: 'like', color: colors.info },
  { label: 'Me encanta', value: 'love', color: colors.primary },
];

const ROLE_OPTIONS: { label: string; value: RolePreference }[] = [
  { label: 'Dar / Dom', value: 'give' },
  { label: 'Recibir / Sub', value: 'receive' },
  { label: 'Ambos', value: 'both' },
  { label: 'Flexible', value: 'flexible' },
];

const PRIMARY_ROLE_OPTIONS = ['Dom', 'Sub', 'Switch', 'Top', 'Bottom', 'Master', 'Slave', 'Rigger', 'Brat'];

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
  const [primaryRole, setPrimaryRole] = useState<string>('Switch');
  const [selectedProtocols, setSelectedProtocols] = useState<('SSC' | 'RACK' | 'PRICK')[]>(['SSC']);
  const [safewordGreen, setSafewordGreen] = useState('Verde');
  const [safewordYellow, setSafewordYellow] = useState('Amarillo');
  const [safewordRed, setSafewordRed] = useState('Rojo');
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

  const toggleProtocol = (proto: 'SSC' | 'RACK' | 'PRICK') => {
    setSelectedProtocols((prev) =>
      prev.includes(proto) ? prev.filter((p) => p !== proto) : [...prev, proto]
    );
  };

  const setRating = (rating: Rating) => {
    setResponses((prev) => ({ ...prev, [currentActivity.id]: { ...prev[currentActivity.id], rating } }));
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
      const cleanNick = nickname.trim();
      const existing = await getProfile(cleanNick);
      const pinValue = pin.trim();

      const createdBadges: FetishBadge[] = [
        { id: `role-${primaryRole}`, label: primaryRole, category: 'role', color: '#c084fc', icon: '🎭' },
        { id: 'safety-ssc', label: selectedProtocols.join('/'), category: 'safety', color: '#10b981', icon: '🛡️' },
      ];

      const profilePayload: Partial<UserProfile> = {
        nickname: cleanNick,
        pronouns: pronouns || existing?.pronouns || undefined,
        experienceLevel: experienceLevel || existing?.experienceLevel,
        role: primaryRole,
        safetyProtocols: selectedProtocols,
        safewords: { green: safewordGreen, yellow: safewordYellow, red: safewordRed },
        fetishBadges: createdBadges,
        verificationBadges: ['Vault Identity'],
        baseResponses: finalResponses,
      };

      if (!existing && pinValue.length >= 4) {
        const { registerProfile } = await import('@/lib/storage');
        await registerProfile({
          ...profilePayload,
          pin: pinValue,
          createdSessionIds: [],
          receivedSessionIds: [],
        } as any);
      } else if (existing && pinValue.length >= 4 && !existing.pinSalt) {
        const { setupVaultForNewProfile, VAULT_VERSION } = await import('@/lib/cryptoVault');
        const meta = await setupVaultForNewProfile(cleanNick, pinValue);
        await saveProfile({
          ...existing,
          ...profilePayload,
          pin: undefined,
          pinSalt: meta.saltB64,
          pinVerifier: meta.verifierB64,
          vaultVersion: VAULT_VERSION,
        });
        await setCurrentProfile(cleanNick);
      } else {
        await saveProfile({
          ...(existing || {}),
          ...profilePayload,
          createdSessionIds: existing?.createdSessionIds ?? [],
          receivedSessionIds: existing?.receivedSessionIds ?? [],
        } as any);
        await setCurrentProfile(cleanNick);
      }

      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.setItem('onboarding_done', 'true');

      Alert.alert(
        '¡Perfil Creado! 🎉',
        `¡Bienvenido/a, ${cleanNick}! Tu perfil con insignias y protocolos de seguridad está listo.`,
        [{ text: 'Continuar', onPress: () => router.replace('/') }]
      );
    } catch {
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
            <AppHeader
              brand
              title="Perfil Rápido con Insignias"
              subtitle="Configura tu nick, rol principal (Dom/Sub/Switch), protocolos SSC/RACK y 10 preguntas clave."
            />
            <View style={styles.pillRow}>
              <View style={styles.pill}><Text style={styles.pillText}>~2 minutos</Text></View>
              <View style={styles.pill}><Text style={styles.pillText}>Bóveda Cifrada</Text></View>
              <View style={styles.pill}><Text style={styles.pillText}>Insignias Fetish</Text></View>
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

            {/* Primary Role Selector */}
            <Text style={styles.fieldLabel}>Rol Principal BDSM / Kink</Text>
            <View style={styles.rolePickerGrid}>
              {PRIMARY_ROLE_OPTIONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.rolePickerChip, primaryRole === r && styles.rolePickerChipActive]}
                  onPress={() => setPrimaryRole(r)}
                >
                  <Text style={[styles.rolePickerChipText, primaryRole === r && styles.rolePickerChipTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Safety Protocols Selector */}
            <Text style={styles.fieldLabel}>Protocolos de Seguridad (SSC / RACK / PRICK)</Text>
            <View style={styles.protoRow}>
              {(['SSC', 'RACK', 'PRICK'] as const).map((proto) => {
                const isSel = selectedProtocols.includes(proto);
                return (
                  <TouchableOpacity
                    key={proto}
                    style={[styles.protoChip, isSel && styles.protoChipActive]}
                    onPress={() => toggleProtocol(proto)}
                  >
                    <Text style={[styles.protoChipText, isSel && styles.protoChipTextActive]}>
                      {proto}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Safewords Input */}
            <Text style={styles.fieldLabel}>Palabras de Seguridad (Semáforo)</Text>
            <View style={styles.safewordsInputGrid}>
              <View style={styles.swInputBox}>
                <Text style={{ color: colors.success, fontSize: 11, fontWeight: '700' }}>🟢 Verde</Text>
                <TextInput
                  style={styles.swInput}
                  value={safewordGreen}
                  onChangeText={setSafewordGreen}
                  placeholder="Verde / Sigue"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={styles.swInputBox}>
                <Text style={{ color: colors.warning, fontSize: 11, fontWeight: '700' }}>🟡 Amarillo</Text>
                <TextInput
                  style={styles.swInput}
                  value={safewordYellow}
                  onChangeText={setSafewordYellow}
                  placeholder="Amarillo / Calma"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={styles.swInputBox}>
                <Text style={{ color: colors.danger, fontSize: 11, fontWeight: '700' }}>🔴 Rojo</Text>
                <TextInput
                  style={styles.swInput}
                  value={safewordRed}
                  onChangeText={setSafewordRed}
                  placeholder="Rojo / Detener"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
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
                  <Text style={[styles.ratingLabel, selected && { color: opt.color }]}>
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
          <Text style={styles.heroTitle}>Protege tu Perfil en Bóveda</Text>
          <Text style={styles.heroDesc}>
            Añade un PIN de 4 dígitos para derivar tu clave de bóveda AES-GCM-256 local.
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
          <Text style={styles.pinHint}>Tu PIN se usa para derivar la clave criptográfica. No se almacena en plano.</Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, saving && styles.primaryBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.primaryBtnText}>
            {saving ? 'Guardando...' : '¡Crear mi Perfil Cifrado! 🚀'}
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
    backgroundColor: colors.accentSoft,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  pillText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontFamily: fonts.bodySemi,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.md,
  },
  fieldLabel: {
    ...typography.label,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.backgroundMid,
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
  },
  rolePickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  rolePickerChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rolePickerChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  rolePickerChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  rolePickerChipTextActive: { color: '#000', fontWeight: '900' },

  protoRow: { flexDirection: 'row', gap: 8 },
  protoChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  protoChipActive: { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: colors.neonEmerald },
  protoChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '800' },
  protoChipTextActive: { color: colors.neonEmerald },

  safewordsInputGrid: { flexDirection: 'row', gap: 6 },
  swInputBox: { flex: 1, gap: 2 },
  swInput: {
    backgroundColor: colors.backgroundMid,
    borderRadius: radii.md,
    padding: 6,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: fontSize.xs,
  },

  pinInput: {
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    fontFamily: fonts.bodyBold,
  },
  pinHint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: fonts.body,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    borderRadius: radii.md,
    alignItems: 'center',
    marginBottom: spacing.md,
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
  questionContainer: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
    justifyContent: 'center',
  },
  progressSection: { gap: spacing.xs },
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
