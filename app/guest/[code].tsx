import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { RatingPicker } from '@/components/RatingPicker';
import { RolePicker } from '@/components/RolePicker';
import { IntensityPicker } from '@/components/IntensityPicker';
import { ProgressBar, ProgressLabel } from '@/components/ProgressBar';
import { useQuestionnaire } from '@/hooks/useQuestionnaire';
import { colors, fontSize, spacing } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/types';
import { getSessionByInviteCode, submitGuestResponses } from '@/lib/sessions';

export default function GuestQuestionnaireScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [step, setStep] = useState<'consent' | 'questions'>('consent');
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);

  const q = useQuestionnaire();

  useEffect(() => {
    if (!code) return;
    getSessionByInviteCode(code).then((session) => {
      if (!session) {
        setValid(false);
      } else if (session.status === 'complete') {
        setValid(false);
        Alert.alert('Sesión cerrada', 'Esta invitación ya fue completada.');
      } else {
        setValid(true);
      }
    });
  }, [code]);

  const finish = async () => {
    if (!code) return;
    setLoading(true);
    try {
      await submitGuestResponses(code, nickname.trim() || 'Invitado', q.getAllResponses());
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
            • Tus respuestas son privadas.{'\n'}
            • Quien te invitó verá el cruce de compatibilidad cuando termines.{'\n'}
            • No verás sus respuestas ni el reporte (salvo que decidan compartirlo).{'\n'}
            • Puedes marcar límites duros en cualquier actividad.
          </Text>
          <Text style={styles.label}>Tu nick (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Sam"
            placeholderTextColor={colors.textMuted}
            value={nickname}
            onChangeText={setNickname}
          />
          <Button title="Entendido, empezar" onPress={() => setStep('questions')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <ProgressBar progress={q.progress} />
          <ProgressLabel current={q.currentIndex + 1} total={q.total} />

          <Text style={styles.category}>{CATEGORY_LABELS[q.currentActivity.category]}</Text>
          <Text style={styles.activityName}>{q.currentActivity.name}</Text>
          <Text style={styles.description}>{q.currentActivity.description}</Text>

          <Text style={styles.sectionLabel}>¿Qué te parece?</Text>
          <RatingPicker value={q.currentResponse.rating} onChange={q.setRating} />

          {q.currentResponse.rating !== 'hard_limit' &&
          q.currentResponse.rating !== 'not_interested' ? (
            <>
              <Text style={[styles.sectionLabel, styles.sectionGap]}>Rol preferido</Text>
              <RolePicker value={q.currentResponse.role} onChange={q.setRole} />
              <Text style={[styles.sectionLabel, styles.sectionGap]}>Intensidad</Text>
              <IntensityPicker
                value={q.currentResponse.intensity}
                onChange={q.setIntensity}
              />
            </>
          ) : null}

          <View style={styles.nav}>
            {!q.isFirst ? (
              <Button title="Anterior" onPress={q.goPrev} variant="secondary" style={styles.navBtn} />
            ) : (
              <View style={styles.navBtn} />
            )}
            {q.isLast ? (
              <Button
                title={loading ? 'Enviando...' : 'Enviar respuestas'}
                onPress={finish}
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
});
