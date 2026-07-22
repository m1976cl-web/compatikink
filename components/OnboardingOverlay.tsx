import React, { useState, useRef, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'onboarding_done';

const STEPS = [
  {
    emoji: '🔥',
    title: 'Bienvenido/a a Compatikink',
    desc: 'Descubre qué tan compatibles son tus preferencias eróticas con alguien especial, de forma completamente privada y consensuada.',
    color: colors.neonPurple,
  },
  {
    emoji: '⚡',
    title: 'Crea tu Perfil en 2 minutos',
    desc: 'El Perfil Rápido te hace solo 10 preguntas clave. Puedes ampliar cuando quieras. Nadie más verá tus respuestas individuales.',
    color: colors.neonPink,
  },
  {
    emoji: '📨',
    title: 'Invita a quien tú elijas',
    desc: 'Genera un código de invitación único y compártelo por WhatsApp, Telegram o donde prefieras. La otra persona responde en privado.',
    color: colors.info,
  },
  {
    emoji: '📊',
    title: 'Ve el Reporte de Compatibilidad',
    desc: 'Cuando ambos terminen, recibirás un análisis visual completo: Compás Kink, Arquetipos, Matches Mutuos y más. Sin revelar las respuestas individuales.',
    color: colors.neonGreen,
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
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Step dots */}
          <View style={styles.dotsRow}>
            {STEPS.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => animateStep(i)}>
                <View
                  style={[
                    styles.dot,
                    i === step && { backgroundColor: current.color, width: 20 },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <Text style={styles.emoji}>{current.emoji}</Text>
          <Text style={[styles.title, { color: current.color }]}>{current.title}</Text>
          <Text style={styles.desc}>{current.desc}</Text>

          {/* Actions */}
          <TouchableOpacity style={[styles.nextBtn, { backgroundColor: current.color }]} onPress={handleNext}>
            <Text style={styles.nextBtnText}>{isLast ? '¡Empezar! 🚀' : 'Siguiente →'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDone} style={styles.skipBtn}>
            <Text style={styles.skipBtnText}>Saltar introducción</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Static method to reset onboarding (for testing)
OnboardingOverlay.reset = () => AsyncStorage.removeItem(ONBOARDING_KEY);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.25)',
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
    transition: 'all 0.3s',
  },
  emoji: {
    fontSize: 60,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 30,
  },
  desc: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  nextBtn: {
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  skipBtn: {
    paddingVertical: spacing.xs,
  },
  skipBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textDecorationLine: 'underline',
  },
});
