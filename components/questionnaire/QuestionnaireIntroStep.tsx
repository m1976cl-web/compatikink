import React, { useEffect, useRef } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { PronounsPicker } from '@/components/PronounsPicker';
import { ExperiencePicker } from '@/components/ExperiencePicker';
import { AppHeader } from '@/components/AppHeader';
import { FlowBar } from '@/components/FlowBar';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { ExperienceLevel } from '@/types';

export interface QuestionnaireIntroStepProps {
  nickname: string;
  setNickname: (val: string) => void;
  pronouns: string;
  setPronouns: (val: string) => void;
  experienceLevel?: ExperienceLevel;
  setExperienceLevel: (val?: ExperienceLevel) => void;
  userNotes: string;
  setUserNotes: (val: string) => void;
  guestNickname: string;
  setGuestNickname: (val: string) => void;
  guestNotes: string;
  setGuestNotes: (val: string) => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  onSelectExpressMode: () => void;
  onSelectFullMode: () => void;
}

export function QuestionnaireIntroStep({
  nickname,
  setNickname,
  pronouns,
  setPronouns,
  experienceLevel,
  setExperienceLevel,
  userNotes,
  setUserNotes,
  guestNickname,
  setGuestNickname,
  guestNotes,
  setGuestNotes,
  demoMode,
  setDemoMode,
  onSelectExpressMode,
  onSelectFullMode,
}: QuestionnaireIntroStepProps) {
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(fadeAnim1, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim2, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim3, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim1, fadeAnim2, fadeAnim3]);

  const validateNicknameAndProceed = (onProceed: () => void) => {
    if (!nickname.trim()) {
      setNickname('Anónimo');
    }
    onProceed();
  };

  const handleDemoModeToggle = () => {
    setDemoMode(true);
    validateNicknameAndProceed(onSelectExpressMode);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.intro}>
        <FlowBar step={1} />
        <AppHeader
          brand
          title="Antes de empezar"
          subtitle="Responderás de forma privada. Tus respuestas solo se cruzarán cuando ambos terminen."
        />

        <View style={styles.divider} />
        <Animated.View style={{ opacity: fadeAnim1 }}>
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
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View style={{ opacity: fadeAnim2 }}>
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
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim3 }}>
          <Text style={styles.sectionSubTitle}>3. Elige la Modalidad del Test</Text>

          <TouchableOpacity
            style={styles.demoModeButton}
            onPress={handleDemoModeToggle}
            activeOpacity={0.7}
          >
            <Text style={styles.demoModeText}>🎮 Modo Demo (datos aleatorios)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.expressModeCard}
            onPress={() => validateNicknameAndProceed(onSelectExpressMode)}
            activeOpacity={0.85}
          >
            <View style={styles.expressHeader}>
              <Text style={styles.expressBadge}>⚡ RÁPIDO (2 MIN)</Text>
              <Text style={styles.expressTitle}>Cuestionario Express</Text>
            </View>
            <Text style={styles.expressDesc}>
              10 actividades fundamentales seleccionadas para una evaluación rápida de compatibilidad básica sin demoras.
            </Text>
          </TouchableOpacity>

          <Button
            title="📋 Cuestionario Completo (124+ Actividades)"
            variant="secondary"
            onPress={() => validateNicknameAndProceed(onSelectFullMode)}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  intro: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  sectionSubTitle: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  introTextSmall: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  label: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  fieldGap: {
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  expressModeCard: {
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  expressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  expressBadge: {
    backgroundColor: colors.primary,
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  expressTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
  },
  expressDesc: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  demoModeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  demoModeText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
  },
});
