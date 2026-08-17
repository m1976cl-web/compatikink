import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { SceneTemplate } from '@/lib/sceneTemplateManager';
import { triggerEmergencySafeword, startAftercareSequence } from '@/lib/liveSceneManager';

export interface SceneTemplatePlayerModalProps {
  visible: boolean;
  template: SceneTemplate | null;
  onClose: () => void;
}

export function SceneTemplatePlayerModal({
  visible,
  template,
  onClose,
}: SceneTemplatePlayerModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [safewordTriggered, setSafewordTriggered] = useState(false);

  useEffect(() => {
    if (template && template.steps[currentStepIndex]) {
      setSecondsRemaining((template.steps[currentStepIndex].durationMins || 1) * 60);
      setIsPaused(false);
    }
  }, [template, currentStepIndex]);

  useEffect(() => {
    if (!visible || isPaused || secondsRemaining <= 0 || safewordTriggered) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [visible, isPaused, secondsRemaining, safewordTriggered]);

  if (!template) return null;

  const currentStep = template.steps[currentStepIndex];
  const isLastStep = currentStepIndex === template.steps.length - 1;

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const handleNextStep = () => {
    if (!isLastStep) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      startAftercareSequence();
      Alert.alert('¡Escena Completada! 🎉', 'Iniciando protocolo de Aftercare en 3 fases.');
      onClose();
    }
  };

  const handleSafeword = () => {
    triggerEmergencySafeword();
    setSafewordTriggered(true);
    setIsPaused(true);
    Alert.alert('🛑 PALABRA DE SEGURIDAD ACTIVADA', 'La escena se ha detenido inmediatamente. Revisa a tu pareja y respira profundo.');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.playerCard}>
          {/* Header */}
          <View style={styles.playerHeader}>
            <Text style={styles.templateTitle}>{template.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.stepProgressText}>
            PASO {currentStepIndex + 1} DE {template.steps.length}
          </Text>

          {/* Timer Display */}
          <View style={[styles.timerBox, safewordTriggered && styles.timerBoxDanger]}>
            <Text style={styles.timerNum}>{timeStr}</Text>
            <Text style={styles.timerSub}>
              {safewordTriggered ? '🛑 DETENIDO POR PALABRA DE SEGURIDAD' : isPaused ? '⏸️ EN PAUSA' : '⚡ TIEMPO RESTANTE'}
            </Text>
          </View>

          {/* Current Step Description */}
          <View style={styles.stepDescCard}>
            <Text style={styles.stepTitleText}>{currentStep?.title}</Text>
            <Text style={styles.stepDescText}>{currentStep?.description}</Text>
            {currentStep?.safetyCheckin ? (
              <View style={styles.checkinBadgeRow}>
                <Text style={styles.checkinBadgeText}>🛡️ Realizar Check-In de seguridad ahora (Verificar pulso/sensación)</Text>
              </View>
            ) : null}
          </View>

          {/* Player Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.pauseBtn}
              onPress={() => setIsPaused(!isPaused)}
              activeOpacity={0.8}
            >
              <Text style={styles.pauseBtnText}>{isPaused ? '▶️ Reanudar' : '⏸️ Pausar'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextBtn}
              onPress={handleNextStep}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>{isLastStep ? '✓ Finalizar Escena' : 'Siguiente Paso ➔'}</Text>
            </TouchableOpacity>
          </View>

          {/* SAFEWORD RED BUTTON */}
          <TouchableOpacity style={styles.safewordRedBtn} onPress={handleSafeword} activeOpacity={0.9}>
            <Text style={styles.safewordRedBtnText}>🛑 PALABRA DE SEGURIDAD (ROJO)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  playerCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.md,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateTitle: {
    color: colors.primary,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  stepProgressText: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
    textAlign: 'center',
  },
  timerBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  timerBoxDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: colors.danger,
  },
  timerNum: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: 48,
    letterSpacing: 2,
  },
  timerSub: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 4,
  },
  stepDescCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepTitleText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  stepDescText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  checkinBadgeRow: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: radii.md,
    padding: spacing.xs,
    marginTop: 4,
  },
  checkinBadgeText: {
    color: colors.success,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  pauseBtn: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pauseBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  nextBtn: {
    flex: 1.5,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: 12,
    alignItems: 'center',
  },
  nextBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  safewordRedBtn: {
    backgroundColor: colors.danger,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  safewordRedBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
    letterSpacing: 1,
  },
});
