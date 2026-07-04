import { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { RatingPicker } from '@/components/RatingPicker';
import { RolePicker } from '@/components/RolePicker';
import { IntensityPicker } from '@/components/IntensityPicker';
import { ProgressBar, ProgressLabel } from '@/components/ProgressBar';
import { useQuestionnaire } from '@/hooks/useQuestionnaire';
import { colors, fontSize, spacing } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/types';
import { createSession } from '@/lib/sessions';

export default function QuestionnaireScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [guestNickname, setGuestNickname] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [step, setStep] = useState<'intro' | 'questions'>('intro');
  const [loading, setLoading] = useState(false);

  const q = useQuestionnaire();

  const finish = async () => {
    const name = nickname.trim() || 'Anónimo';
    setLoading(true);
    try {
      const gProfile = guestNickname.trim() || guestNotes.trim()
        ? { nickname: guestNickname.trim() || 'Invitado', notes: guestNotes.trim() }
        : undefined;

      const session = await createSession(name, q.getAllResponses(), gProfile);
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
            Responderás ~70 actividades. Tus respuestas son privadas hasta que decidas compartir
            resultados. Puedes marcar límites duros sin miedo — se respetarán en el reporte.
          </Text>
          <Text style={styles.label}>Tu nick (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Alex"
            placeholderTextColor={colors.textMuted}
            value={nickname}
            onChangeText={setNickname}
          />

          <View style={styles.divider} />

          <Text style={styles.sectionSubTitle}>Sobre la otra persona (Ficha)</Text>
          <Text style={styles.introTextSmall}>
            Define un apodo y añade notas privadas (límites conocidos, dónde os conocisteis...). Solo tú verás esta información en tu reporte.
          </Text>

          <Text style={styles.label}>Su nick o nombre (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Sam"
            placeholderTextColor={colors.textMuted}
            value={guestNickname}
            onChangeText={setGuestNickname}
          />

          <Text style={styles.label}>Notas privadas y detalles (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ej: Nos conocimos en Tinder. Interés en cuerdas. Límites físicos en la espalda..."
            placeholderTextColor={colors.textMuted}
            value={guestNotes}
            onChangeText={setGuestNotes}
            multiline
            numberOfLines={4}
          />

          <Button title="Comenzar cuestionario" onPress={() => setStep('questions')} />
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
                title={loading ? 'Guardando...' : 'Finalizar y crear invitación'}
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
});
