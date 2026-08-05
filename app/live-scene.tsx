import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
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

            {/* GIANT TRAFFIC LIGHT BUTTONS */}
            <View style={styles.trafficLightGrid}>
              <TouchableOpacity
                style={[
                  styles.lightBtn,
                  styles.lightGreen,
                  session.trafficLight === 'green' && styles.lightBtnSelected,
                ]}
                onPress={() => handleSetLight('green')}
              >
                <Text style={styles.lightBtnEmoji}>🟢</Text>
                <Text style={styles.lightBtnText}>VERDE (Todo fluido)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.lightBtn,
                  styles.lightYellow,
                  session.trafficLight === 'yellow' && styles.lightBtnSelected,
                ]}
                onPress={() => handleSetLight('yellow')}
              >
                <Text style={styles.lightBtnEmoji}>🟡</Text>
                <Text style={styles.lightBtnText}>AMARILLO (Pausar/Bajar ritmo)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.lightBtn,
                  styles.lightRed,
                  session.trafficLight === 'red' && styles.lightBtnSelected,
                ]}
                onPress={handleTriggerEmergency}
              >
                <Text style={styles.lightBtnEmoji}>🔴</Text>
                <Text style={styles.lightBtnText}>ROJO / EMERGENCY (PARAR YA)</Text>
              </TouchableOpacity>
            </View>

            {/* Emergency Safeword Trigger Box */}
            {session.status === 'safeword_triggered' && (
              <View style={styles.emergencyBox}>
                <Text style={styles.emergencyTitle}>🚨 PALABRA DE SEGURIDAD ACTIVADA</Text>
                <Text style={styles.emergencyDesc}>
                  1. Detener toda acción física inmediatamente.
                  2. Usa las tijeras de rescate EMT para cortar cuerdas si no abren rápido.
                  3. Ofrece manta, agua y contención emocional inmediata.
                </Text>
                <TouchableOpacity style={styles.aftercareTriggerBtn} onPress={handleStartAftercare}>
                  <Text style={styles.aftercareTriggerBtnText}>Pasar a Protocolo de Aftercare 🪷 ➔</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* End Scene & Start Aftercare */}
            {session.status === 'active' && (
              <TouchableOpacity style={styles.endSceneBtn} onPress={handleStartAftercare}>
                <Text style={styles.endSceneBtnText}>🏁 Concluir Escena & Pasar a Aftercare 🪷</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* STATE 3: AFTERCARE PROTOCOL MODE */}
        {session.status === 'aftercare' && (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.aftercareCard}>
              <Text style={styles.aftercareTitle}>🪷 Protocolo de Aftercare Nocturno (15 min)</Text>
              <Text style={styles.aftercareDesc}>
                Aterrizaje suave post-endorfinas. Mantén contacto cuerpo a cuerpo, hidratación y temperatura agradable.
              </Text>

              <View style={styles.aftercareTimerBox}>
                <Text style={styles.aftercareTimerText}>{formatSecs(session.aftercareTimerSeconds)}</Text>
                <Text style={styles.aftercareTimerLabel}>Tiempo de Recuperación Afectiva</Text>
              </View>

              <Text style={styles.checkHeader}>Lista de Cotejo para el Cuidado:</Text>
              <View style={styles.aftercareCheckList}>
                <Text style={styles.aftercareCheckItem}>✓ Envolver en manta cálida (prevenir bajada de temperatura)</Text>
                <Text style={styles.aftercareCheckItem}>✓ Ofrecer vaso de agua o infusión tibia con azúcar/chocolate</Text>
                <Text style={styles.aftercareCheckItem}>✓ Dar masajes suaves en articulaciones atadas</Text>
                <Text style={styles.aftercareCheckItem}>✓ Conversar: ¿Cómo te sientes? / ¿Qué te encantó de hoy?</Text>
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleReset}>
                <Text style={styles.primaryBtnText}>Finalizar Sesión & Guardar en Bóveda ✅</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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

  trafficLightGrid: { flex: 1, gap: spacing.sm, marginVertical: spacing.xs },
  lightBtn: { flex: 1, borderRadius: radii.xl, justifyContent: 'center', alignItems: 'center', gap: 4, borderWidth: 2 },
  lightGreen: { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderColor: colors.success },
  lightYellow: { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderColor: '#fbbf24' },
  lightRed: { backgroundColor: 'rgba(239, 68, 68, 0.25)', borderColor: colors.danger },
  lightBtnSelected: { borderWidth: 4 },
  lightBtnEmoji: { fontSize: 32 },
  lightBtnText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '900' },

  emergencyBox: { backgroundColor: 'rgba(239, 68, 68, 0.3)', borderRadius: radii.xl, padding: spacing.md, borderWidth: 2, borderColor: colors.danger, gap: 4 },
  emergencyTitle: { color: colors.danger, fontSize: fontSize.md, fontWeight: '900' },
  emergencyDesc: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },
  aftercareTriggerBtn: { backgroundColor: colors.danger, borderRadius: radii.md, paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  aftercareTriggerBtnText: { color: '#ffffff', fontSize: fontSize.xs, fontWeight: '900' },

  endSceneBtn: { backgroundColor: colors.surfaceLight, borderRadius: radii.lg, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  endSceneBtnText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },

  scroll: { gap: spacing.md },
  aftercareCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: colors.primary },
  aftercareTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  aftercareDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
  aftercareTimerBox: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radii.lg, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.primary },
  aftercareTimerText: { fontSize: 36, fontWeight: '900', color: colors.text },
  aftercareTimerLabel: { color: colors.primary, fontSize: 10, fontWeight: '800' },
  checkHeader: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800', marginTop: 4 },
  aftercareCheckList: { gap: 4 },
  aftercareCheckItem: { color: colors.textMuted, fontSize: 11 },

  primaryBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { fontFamily: fonts.bodySemi, color: colors.onPrimary, fontSize: fontSize.sm, fontWeight: '800' },

  checkinModalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: spacing.md },
  checkinModalContent: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, borderWidth: 2, borderColor: '#fbbf24', gap: spacing.xs },
  checkinTitle: { color: '#fbbf24', fontSize: fontSize.md, fontWeight: '900', textAlign: 'center' },
  checkinSub: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },
});
