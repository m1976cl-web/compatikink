import React, { useState, useRef, useEffect } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'onboarding_done';

const STEPS = [
  {
    mark: 'I',
    title: 'Bienvenido/a a Compatikink',
    desc: 'Descubre qué tan compatibles son tus preferencias eróticas con alguien especial, de forma completamente privada y consensuada.',
  },
  {
    mark: 'II',
    title: 'Crea tu perfil en dos minutos',
    desc: 'El Perfil Rápido te hace solo 10 preguntas clave. Puedes ampliar cuando quieras. Nadie más verá tus respuestas individuales.',
  },
  {
    mark: 'III',
    title: 'Invita a quien tú elijas',
    desc: 'Genera un código de invitación único y compártelo por WhatsApp, Telegram o donde prefieras. La otra persona responde en privado.',
  },
  {
    mark: 'IV',
    title: 'Reporte de compatibilidad',
    desc: 'Cuando ambos terminen, recibirás un análisis visual completo: Compás Kink, Arquetipos, Matches Mutuos y más — sin revelar respuestas individuales.',
  },
];

interface Props {
  onDone: () => void;
}

export function OnboardingOverlay({ onDone }: Props) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((done) => {
      if (!done) {
        setVisible(true);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
      }
    });
  }, []);

  const animateStep = (nextStep: number) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -20, duration: 180, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      animateStep(step + 1);
    } else {
      handleDone();
    }
  };

  const handleDone = async () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
      setVisible(false);
      AsyncStorage.setItem(ONBOARDING_KEY, 'true').then(onDone);
    });
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.panel, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.brand}>Compatikink</Text>
          <Text style={styles.noxMark}>Nox</Text>

          <View style={styles.dotsRow}>
            {STEPS.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => animateStep(i)} accessibilityLabel={`Paso ${i + 1}`}>
                <View style={[styles.dot, i === step && styles.dotActive]} />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.mark}>{current.mark}</Text>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.desc}>{current.desc}</Text>

          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} accessibilityRole="button">
            <Text style={styles.nextBtnText}>{isLast ? 'Empezar' : 'Siguiente'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDone} style={styles.skipBtn}>
            <Text style={styles.skipBtnText}>Saltar introducción</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

OnboardingOverlay.reset = () => AsyncStorage.removeItem(ONBOARDING_KEY);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 10, 9, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  noxMark: {
    fontFamily: fonts.displayItalic,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 22,
  },
  mark: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.primary,
    letterSpacing: 4,
    marginBottom: spacing.sm,
    opacity: 0.85,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 30,
  },
  desc: {
    ...typography.bodyMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    fontSize: fontSize.sm,
  },
  nextBtn: {
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.primary,
  },
  nextBtnText: {
    fontFamily: fonts.bodySemi,
    color: colors.onPrimary,
    fontSize: fontSize.md,
    letterSpacing: 0.4,
  },
  skipBtn: {
    paddingVertical: spacing.xs,
  },
  skipBtnText: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textDecorationLine: 'underline',
  },
});
