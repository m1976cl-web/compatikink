import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing } from '@/constants/theme';
import { FlowBar } from '@/components/FlowBar';
import { ActivityResponse, ExperienceLevel, Rating, RolePreference, UserProfile, FetishBadge } from '@/types';
import { QUICK_PROFILE_ACTIVITIES } from '@/data/quickProfile';
import {
  saveProfile,
  setCurrentProfile,
  getProfile,
  registerProfile,
  loginProfile,
} from '@/lib/storage';
import { setupVaultForNewProfile, VAULT_VERSION } from '@/lib/cryptoVault';
import { QuickProfileIntroStep } from '@/components/quick-profile/QuickProfileIntroStep';
import { QuickProfileQuestionsStep } from '@/components/quick-profile/QuickProfileQuestionsStep';
import { QuickProfilePinStep } from '@/components/quick-profile/QuickProfilePinStep';

function notify(title: string, message: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} tardó demasiado (${Math.round(ms / 1000)}s). Reintenta.`)),
          ms
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

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
  const [hardLimitsInput, setHardLimitsInput] = useState('');
  const [softLimitsInput, setSoftLimitsInput] = useState('');

  const currentActivity = QUICK_PROFILE_ACTIVITIES[currentIndex];
  const isLast = currentIndex === QUICK_PROFILE_ACTIVITIES.length - 1;

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
      notify('Nombre requerido', 'Ingresa un nick para continuar.');
      return;
    }
    const pinValue = pin.trim();
    if (pinValue.length < 4) {
      notify('PIN requerido', 'El PIN debe tener al menos 4 dígitos para cifrar tu perfil.');
      return;
    }

    setSaving(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 80));

      const finalResponses = Object.values(responses);
      const cleanNick = nickname.trim();
      const existing = await getProfile(cleanNick);

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
        hardLimits: hardLimitsInput
          ? hardLimitsInput
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : existing?.hardLimits,
        softLimits: softLimitsInput
          ? softLimitsInput
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : existing?.softLimits,
        fetishBadges: createdBadges,
        verificationBadges: ['Vault Identity'],
        baseResponses: finalResponses,
      };

      if (!existing) {
        await withTimeout(
          registerProfile({
            ...profilePayload,
            pin: pinValue,
            createdSessionIds: [],
            receivedSessionIds: [],
          } as UserProfile),
          90_000,
          'Crear bóveda'
        );
      } else if (!existing.pinSalt) {
        const meta = await withTimeout(
          setupVaultForNewProfile(cleanNick, pinValue),
          90_000,
          'Configurar bóveda'
        );
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
        const unlocked = await withTimeout(
          loginProfile(existing.nickname, pinValue),
          90_000,
          'Desbloquear bóveda'
        );
        if (!unlocked) {
          notify('PIN incorrecto', 'Ese nick ya tiene bóveda. Usa el PIN correcto o elige otro apodo.');
          return;
        }
        await saveProfile({
          ...unlocked,
          ...profilePayload,
          createdSessionIds: unlocked.createdSessionIds ?? [],
          receivedSessionIds: unlocked.receivedSessionIds ?? [],
        });
        await setCurrentProfile(cleanNick);
      }

      await AsyncStorage.multiSet([
        ['compatikink_onboarding_complete_v1', 'true'],
        ['compatikink_age_verified_v1', 'true'],
        ['onboarding_done', 'true'],
      ]);

      router.replace({ pathname: '/', params: { from: 'answers' } });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'No se pudo guardar el perfil.';
      notify('Error', message);
    } finally {
      setSaving(false);
    }
  };

  if (step === 'intro') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <QuickProfileIntroStep
            nickname={nickname}
            setNickname={setNickname}
            pronouns={pronouns}
            setPronouns={setPronouns}
            experienceLevel={experienceLevel}
            setExperienceLevel={setExperienceLevel}
            primaryRole={primaryRole}
            setPrimaryRole={setPrimaryRole}
            selectedProtocols={selectedProtocols}
            toggleProtocol={toggleProtocol}
            safewordGreen={safewordGreen}
            setSafewordGreen={setSafewordGreen}
            safewordYellow={safewordYellow}
            setSafewordYellow={setSafewordYellow}
            safewordRed={safewordRed}
            setSafewordRed={setSafewordRed}
            hardLimitsInput={hardLimitsInput}
            setHardLimitsInput={setHardLimitsInput}
            softLimitsInput={softLimitsInput}
            setSoftLimitsInput={setSoftLimitsInput}
            onNext={() => setStep('questions')}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'questions') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <QuickProfileQuestionsStep
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          responses={responses}
          setRating={setRating}
          setRole={setRole}
          onFinishQuestions={handleFinishQuestions}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <QuickProfilePinStep
          pin={pin}
          setPin={setPin}
          saving={saving}
          onSave={handleSave}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
});
