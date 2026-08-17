import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { colors, fonts, fontSize, radii, spacing, glowShadowPrimary } from '@/constants/theme';

export interface ReportAnalysisLoaderProps {
  initiatorName?: string;
  guestName?: string;
  onAnimationComplete?: () => void;
  minDurationMs?: number;
}

const ANALYSIS_STEPS = [
  { label: 'Descifrando respuestas seguras con clave ZK...', emoji: '🔒', progress: 25 },
  { label: 'Verificando límites duros y banderas rojas...', emoji: '🛑', progress: 50 },
  { label: 'Calculando afinidad por categoría y roles...', emoji: '🔥', progress: 75 },
  { label: 'Generando mapa de compatibilidad y guión de conversación...', emoji: '✨', progress: 100 },
];

export function ReportAnalysisLoader({
  initiatorName = 'Iniciador',
  guestName = 'Pareja',
  onAnimationComplete,
  minDurationMs = 2400,
}: ReportAnalysisLoaderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Rotate animation
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotate.start();

    // Step cycle
    const stepDuration = minDurationMs / ANALYSIS_STEPS.length;
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        if (next < ANALYSIS_STEPS.length) {
          Animated.timing(progressAnim, {
            toValue: ANALYSIS_STEPS[next].progress,
            duration: 400,
            useNativeDriver: false,
          }).start();
          return next;
        } else {
          clearInterval(interval);
          if (onAnimationComplete) {
            setTimeout(onAnimationComplete, 400);
          }
          return prev;
        }
      });
    }, stepDuration);

    return () => {
      pulse.stop();
      rotate.stop();
      clearInterval(interval);
    };
  }, [minDurationMs, onAnimationComplete]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const step = ANALYSIS_STEPS[currentStepIndex] || ANALYSIS_STEPS[0];

  const progressInterpolated = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Animated Glowing Orb / Ring */}
      <View style={styles.orbWrapper}>
        <Animated.View
          style={[
            styles.glowRing,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.centerOrb,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text style={styles.centerEmoji}>{step.emoji}</Text>
        </Animated.View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Analizando Compatibilidad</Text>
      <Text style={styles.namesSubtitle}>
        {initiatorName} <Text style={styles.accentText}>✕</Text> {guestName}
      </Text>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressInterpolated }]} />
      </View>

      {/* Status Text */}
      <View style={styles.statusBox}>
        <Text style={styles.statusText}>{step.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    minHeight: 360,
  },
  orbWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  glowRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: colors.primary,
    borderTopColor: colors.accent,
    borderRightColor: 'transparent',
  },
  centerOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...glowShadowPrimary,
  },
  centerEmoji: {
    fontSize: 32,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
  namesSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  accentText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  progressTrack: {
    width: '85%',
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  statusBox: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 320,
  },
  statusText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});
