import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import {
  LiveSceneSession,
  getLiveSceneSession,
  startLiveSceneSession,
  setTrafficLightStatus,
  triggerEmergencySafeword,
  startAftercareSequence,
  resetLiveSceneSession,
  TrafficLight,
} from '@/lib/liveSceneManager';
import { triggerHaptic } from '@/lib/haptics';

import { TrafficLightGrid } from '@/components/scene/TrafficLightGrid';
import { AftercareCard } from '@/components/scene/AftercareCard';

export default function LiveSceneScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [session, setSession] = useState<LiveSceneSession>(() => getLiveSceneSession());
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');

  // Check-in Modal
  const [showCheckinModal, setShowCheckinModal] = useState(false);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (session.status === 'active' || session.status === 'aftercare') {
      timerRef.current = setInterval(() => {
        setSession((prev) => {
          if (prev.status === 'active') {
            const nextSecs = prev.elapsedSeconds + 1;
            // Trigger checkin every 10 mins (600s)
            if (nextSecs > 0 && nextSecs % 600 === 0) {
              setShowCheckinModal(true);
            }
            return { ...prev, elapsedSeconds: nextSecs };
          } else if (prev.status === 'aftercare' && prev.aftercareTimerSeconds > 0) {
            return { ...prev, aftercareTimerSeconds: prev.aftercareTimerSeconds - 1 };
          }
          return prev;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [session.status]);

  // Hands-free Web Speech API Voice Safeword Listener Setup
  const toggleVoiceSafewordListener = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      Alert.alert('Reconocimiento de Voz', 'El navegador no soporta Web Speech API. Usa los botones gigantes.');
      return;
    }

    if (isVoiceListening) {
      setIsVoiceListening(false);
      setSpeechTranscript('');
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript.toLowerCase();
          setSpeechTranscript(transcript);

          if (transcript.includes('rojo') || transcript.includes('parar') || transcript.includes('stop') || transcript.includes('safeword')) {
            handleTriggerEmergency();
            recognition.stop();
            setIsVoiceListening(false);
          } else if (transcript.includes('amarillo') || transcript.includes('precaución')) {
            handleSetLight('yellow');
          } else if (transcript.includes('verde')) {
            handleSetLight('green');
            setShowCheckinModal(false);
          }
        };

        recognition.onend = () => {
          if (isVoiceListening) recognition.start();
        };

        recognition.start();
        setIsVoiceListening(true);
        Alert.alert('Escucha por Voz Activada 🎙️', 'Di "ROJO" o "PARAR" para disparar la alarma de emergencia.');
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const handleStartScene = () => {
    triggerHaptic.medium();
    const s = startLiveSceneSession();
    setSession(s);
  };

  const handleSetLight = (light: TrafficLight) => {
    triggerHaptic.selection();
    const s = setTrafficLightStatus(light);
    setSession({ ...s });
  };

  const handleTriggerEmergency = () => {
    triggerHaptic.error();
    const s = triggerEmergencySafeword();
    setSession({ ...s });
    Alert.alert('🚨 PALABRA DE SEGURIDAD ROJA 🚨', '¡DETENER ESCENA INMEDIATAMENTE! Usa las tijeras de rescate si es necesario.');
  };

  const handleStartAftercare = () => {
    const s = startAftercareSequence();
    setSession({ ...s });
  };

  const handleReset = () => {
    const s = resetLiveSceneSession();
    setSession({ ...s });
  };

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <ScreenContainer title="Modo Escena en Vivo" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Modo "Escena en Vivo" ⚡🔴</Text>
          <Text style={styles.subtitle}>
            Asistente a pantalla completa con semáforo gigante, detector de voz manos libres y Aftercare
          </Text>
        </View>

        {/* STATE 1: IDLE / NOT STARTED */}
        {session.status === 'idle' && (
          <View style={styles.idleCard}>
            <Text style={styles.idleTitle}>🎬 Iniciar Nueva Escena en Vivo</Text>
            <Text style={styles.idleDesc}>
              Activa el monitor inmersivo para la sesión. Tendrás acceso a semáforo visual a pantalla completa, alertas de check-in y detector de palabra de seguridad por voz.
            </Text>

            <TouchableOpacity style={styles.startBigBtn} onPress={handleStartScene}>
              <Text style={styles.startBigBtnText}>▶️ INICIAR ESCENA EN VIVO</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STATE 2: ACTIVE SCENE MODE */}
        {(session.status === 'active' || session.status === 'safeword_triggered') && (
          <View style={{ flex: 1, gap: spacing.sm }}>
            {/* Live Status Bar */}
            <View style={styles.statusLiveBar}>
              <Text style={styles.liveTimerText}>⏱️ Tiempo: {formatSecs(session.elapsedSeconds)}</Text>
              
              <TouchableOpacity
                style={[styles.voiceBtn, isVoiceListening && styles.voiceBtnActive]}
                onPress={toggleVoiceSafewordListener}
              >
                <Text style={styles.voiceBtnText}>
                  {isVoiceListening ? '🎙️ Voz Activada ("ROJO")' : '🎤 Activar Voz Manos Libres'}
                </Text>
              </TouchableOpacity>
            </View>

            {speechTranscript ? (
              <View style={styles.transcriptBox}>
                <Text style={styles.transcriptText}>Voz detectada: "{speechTranscript}"</Text>
              </View>
            ) : null}

            {/* Traffic Light Grid */}
            <TrafficLightGrid
              session={session}
              onSetLight={handleSetLight}
              onTriggerEmergency={handleTriggerEmergency}
              onStartAftercare={handleStartAftercare}
            />
          </View>
        )}

        {/* STATE 3: AFTERCARE PROTOCOL MODE */}
        {session.status === 'aftercare' && (
          <AftercareCard
            aftercareTimerSeconds={session.aftercareTimerSeconds}
            formatSecs={formatSecs}
            onResetSession={handleReset}
          />
        )}

        {/* Check-in Security Modal */}
        {showCheckinModal && (
          <View style={styles.checkinModalOverlay}>
            <View style={styles.checkinModalContent}>
              <Text style={styles.checkinTitle}>🔔 VERIFICACIÓN DE SEGURIDAD (10 MIN)</Text>
              <Text style={styles.checkinSub}>Han transcurrido 10 minutos de escena. Confirma el estado:</Text>
              <View style={{ gap: spacing.xs, marginTop: 8 }}>
                <TouchableOpacity
                  style={[styles.lightBtn, styles.lightGreen]}
                  onPress={() => {
                    handleSetLight('green');
                    setShowCheckinModal(false);
                  }}
                >
                  <Text style={styles.lightBtnText}>🟢 Todo Perfecto (Confirmar Verde)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.lightBtn, styles.lightRed]} onPress={handleTriggerEmergency}>
                  <Text style={styles.lightBtnText}>🔴 Parar Escena (Rojo)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  idleCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, alignItems: 'center', gap: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle },
  idleTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  idleDesc: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', lineHeight: 18 },
  startBigBtn: { backgroundColor: colors.primary, borderRadius: radii.lg, paddingHorizontal: 24, paddingVertical: 14 },
  startBigBtnText: { color: colors.onPrimary, fontSize: fontSize.sm, fontWeight: '900' },

  statusLiveBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle },
  liveTimerText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  voiceBtn: { backgroundColor: colors.surfaceLight, borderRadius: radii.sm, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  voiceBtnActive: { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: colors.danger },
  voiceBtnText: { color: colors.text, fontSize: 10, fontWeight: '800' },
  transcriptBox: { backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 6, padding: spacing.xs, alignItems: 'center' },
  transcriptText: { color: colors.primary, fontSize: 10, fontStyle: 'italic' },

  lightBtn: { flex: 1, borderRadius: radii.xl, justifyContent: 'center', alignItems: 'center', gap: 4, borderWidth: 2 },
  lightGreen: { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderColor: colors.success },
  lightRed: { backgroundColor: 'rgba(239, 68, 68, 0.25)', borderColor: colors.danger },
  lightBtnText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '900' },

  checkinModalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: spacing.md },
  checkinModalContent: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, borderWidth: 2, borderColor: '#fbbf24', gap: spacing.xs },
  checkinTitle: { color: '#fbbf24', fontSize: fontSize.md, fontWeight: '900', textAlign: 'center' },
  checkinSub: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },
});
