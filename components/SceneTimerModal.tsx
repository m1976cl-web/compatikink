import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Vibration,
  Platform,
  Alert,
} from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  activityName?: string;
  safewordGreen?: string;
  safewordYellow?: string;
  safewordRed?: string;
  onSceneEnded?: () => void;
}

export function SceneTimerModal({
  visible,
  onClose,
  activityName = 'Escena en Curso',
  safewordGreen = 'Verde',
  safewordYellow = 'Amarillo',
  safewordRed = 'Rojo',
  onSceneEnded,
}: Props) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [checkInIntervalMinutes, setCheckInIntervalMinutes] = useState(5);
  const [lastCheckInStatus, setLastCheckInStatus] = useState<'green' | 'yellow' | 'red'>('green');
  const [checkInPromptVisible, setCheckInPromptVisible] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible && isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => {
          const next = prev + 1;
          // Check-in trigger check
          if (next > 0 && next % (checkInIntervalMinutes * 60) === 0) {
            triggerCheckInPrompt();
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible, isRunning, checkInIntervalMinutes]);

  const triggerCheckInPrompt = () => {
    setCheckInPromptVisible(true);
    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 400, 200, 400]);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsElapsed(0);
    setLastCheckInStatus('green');
    setCheckInPromptVisible(false);
  };

  const handleCheckInResponse = (status: 'green' | 'yellow' | 'red') => {
    setLastCheckInStatus(status);
    setCheckInPromptVisible(false);

    if (status === 'red') {
      setIsRunning(false);
      if (Platform.OS !== 'web') {
        Vibration.vibrate([0, 1000, 300, 1000]);
      }
      Alert.alert(
        '🚨 SAFEWORD ROJO ACTIVADO',
        'Detener la escena de inmediato. Priorizar seguridad y desatar/liberar a la persona.',
        [
          {
            text: 'Ir a Diario Post-Escena 📝',
            onPress: () => {
              onClose();
              onSceneEnded?.();
            },
          },
        ]
      );
    } else if (status === 'yellow') {
      Alert.alert('⚠️ Estado AMARILLO', 'Pausa momentánea o reducción de intensidad negociada.');
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeX} onPress={onClose}>
            <Text style={styles.closeXText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.headerEmoji}>⏱️</Text>
          <Text style={styles.title}>Temporizador de Seguridad</Text>
          <Text style={styles.activitySubtitle}>{activityName}</Text>

          {/* Status Indicator Badge */}
          <View
            style={[
              styles.statusBadge,
              lastCheckInStatus === 'green' && styles.statusGreen,
              lastCheckInStatus === 'yellow' && styles.statusYellow,
              lastCheckInStatus === 'red' && styles.statusRed,
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {lastCheckInStatus === 'green' && '🟢 ESTADO VERDE — Normal'}
              {lastCheckInStatus === 'yellow' && '🟡 ESTADO AMARILLO — Precaución'}
              {lastCheckInStatus === 'red' && '🔴 SAFEWORD ROJO — Escena Detenida'}
            </Text>
          </View>

          {/* Time Display */}
          <View style={styles.timerDisplay}>
            <Text style={styles.timerText}>{formatTime(secondsElapsed)}</Text>
            <Text style={styles.timerLabel}>
              {isRunning ? '⏱️ Escena en progreso...' : secondsElapsed > 0 ? '⏸️ Pausado' : 'Listo para iniciar'}
            </Text>
          </View>

          {/* Check-in Interval Selector */}
          <View style={styles.intervalRow}>
            <Text style={styles.intervalLabel}>Check-in automático cada:</Text>
            <View style={styles.intervalChips}>
              {[3, 5, 10, 15].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.chip, checkInIntervalMinutes === m && styles.chipActive]}
                  onPress={() => setCheckInIntervalMinutes(m)}
                >
                  <Text style={[styles.chipText, checkInIntervalMinutes === m && styles.chipTextActive]}>
                    {m}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Check-in Prompt Banner */}
          {checkInPromptVisible ? (
            <View style={styles.checkInPromptBox}>
              <Text style={styles.promptTitle}>🔔 ¿Check-in de Seguridad!</Text>
              <Text style={styles.promptSub}>¿Cómo se siente la persona atada/evaluada?</Text>
              <View style={styles.promptButtons}>
                <TouchableOpacity
                  style={[styles.promptBtn, { backgroundColor: '#22c55e' }]}
                  onPress={() => handleCheckInResponse('green')}
                >
                  <Text style={styles.promptBtnText}>🟢 {safewordGreen}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.promptBtn, { backgroundColor: '#eab308' }]}
                  onPress={() => handleCheckInResponse('yellow')}
                >
                  <Text style={styles.promptBtnText}>🟡 {safewordYellow}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.promptBtn, { backgroundColor: '#ef4444' }]}
                  onPress={() => handleCheckInResponse('red')}
                >
                  <Text style={styles.promptBtnText}>🔴 {safewordRed}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* Hands-Free Voice Assistant Bar */}
          <TouchableOpacity
            style={[styles.voiceBar, voiceListening && styles.voiceBarActive]}
            onPress={() => {
              const nextState = !voiceListening;
              setVoiceListening(nextState);
              if (nextState) {
                Alert.alert(
                  '🎤 Asistente de Voz Discreto (Mãos Livres / Hands-Free)',
                  'El micrófono está escuchando comandos de voz durante la escena. Di "Verde", "Amarillo" o "ROJO" para cambiar el estado.'
                );
              }
            }}
          >
            <Text style={styles.voiceBarText}>
              {voiceListening ? '🎤 Asistente de Voz Escuchando (Di "Verde", "Amarillo" o "ROJO")' : '🎙️ Activar Asistente de Voz Discreto (Hands-Free)'}
            </Text>
          </TouchableOpacity>

          {/* Control Buttons */}
          <View style={styles.controlsRow}>
            {!isRunning ? (
              <TouchableOpacity style={[styles.btn, styles.btnStart]} onPress={handleStart}>
                <Text style={styles.btnText}>▶️ {secondsElapsed > 0 ? 'Reanudar' : 'Iniciar Escena'}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.btn, styles.btnPause]} onPress={handlePause}>
                <Text style={styles.btnText}>⏸️ Pausar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.btn, styles.btnReset]} onPress={handleReset}>
              <Text style={styles.btnText}>🔄 Reiniciar</Text>
            </TouchableOpacity>
          </View>

          {/* Immediate Emergency Safeword Red Button */}
          <TouchableOpacity
            style={styles.redButtonPanic}
            onPress={() => handleCheckInResponse('red')}
          >
            <Text style={styles.redButtonPanicText}>🚨 BOTÓN DE PÁNICO (SAFEWORD ROJO)</Text>
          </TouchableOpacity>

          {/* End Scene & Go To Debrief Button */}
          {secondsElapsed > 0 ? (
            <TouchableOpacity
              style={styles.endSceneBtn}
              onPress={() => {
                setIsRunning(false);
                onClose();
                onSceneEnded?.();
              }}
            >
              <Text style={styles.endSceneBtnText}>🏁 Finalizar Escena y Registrar Debrief 📝</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.35)',
    gap: spacing.md,
  },
  closeX: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeXText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
  },
  headerEmoji: { fontSize: 40 },
  title: {
    color: colors.neonPurple,
    fontSize: fontSize.lg,
    fontWeight: '900',
    textAlign: 'center',
  },
  activitySubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusGreen: {
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderColor: colors.success,
  },
  statusYellow: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderColor: colors.warning,
  },
  statusRed: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderColor: colors.danger,
  },
  statusBadgeText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  timerDisplay: {
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  timerText: {
    color: colors.text,
    fontSize: 54,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  timerLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm,
    borderRadius: 14,
  },
  intervalLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  intervalChips: {
    flexDirection: 'row',
    gap: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#fff',
  },
  checkInPromptBox: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 16,
    padding: spacing.md,
    width: '100%',
    alignItems: 'center',
    gap: spacing.xs,
  },
  promptTitle: {
    color: colors.neonPurple,
    fontSize: fontSize.md,
    fontWeight: '900',
  },
  promptSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  promptButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
    width: '100%',
  },
  promptBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  promptBtnText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnStart: {
    backgroundColor: colors.primary,
  },
  btnPause: {
    backgroundColor: colors.warning,
  },
  btnReset: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  redButtonPanic: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 2,
    borderColor: '#ef4444',
    paddingVertical: spacing.md,
    borderRadius: 14,
    alignItems: 'center',
  },
  redButtonPanicText: {
    color: '#ef4444',
    fontSize: fontSize.xs,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  voiceBar: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  voiceBarActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: colors.info,
  },
  voiceBarText: {
    color: colors.info,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textAlign: 'center',
  },
  endSceneBtn: {
    width: '100%',
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: colors.success,
    paddingVertical: spacing.sm,
    borderRadius: 14,
    alignItems: 'center',
  },
  endSceneBtnText: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
});
