import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { TrafficLight, LiveSceneSession } from '@/lib/liveSceneManager';

interface Props {
  session: LiveSceneSession;
  onSetLight: (light: TrafficLight) => void;
  onTriggerEmergency: () => void;
  onStartAftercare: () => void;
}

export function TrafficLightGrid({
  session,
  onSetLight,
  onTriggerEmergency,
  onStartAftercare,
}: Props) {
  return (
    <View style={{ flex: 1, gap: spacing.sm }}>
      {/* GIANT TRAFFIC LIGHT BUTTONS */}
      <View style={styles.trafficLightGrid}>
        <TouchableOpacity
          style={[
            styles.lightBtn,
            styles.lightGreen,
            session.trafficLight === 'green' && styles.lightBtnSelected,
          ]}
          onPress={() => onSetLight('green')}
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
          onPress={() => onSetLight('yellow')}
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
          onPress={onTriggerEmergency}
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
            1. Detener toda acción física inmediatamente.{'\n'}
            2. Usa las tijeras de rescate EMT para cortar cuerdas si no abren rápido.{'\n'}
            3. Ofrece manta, agua y contención emocional inmediata.
          </Text>
          <TouchableOpacity style={styles.aftercareTriggerBtn} onPress={onStartAftercare}>
            <Text style={styles.aftercareTriggerBtnText}>Pasar a Protocolo de Aftercare 🪷 ➔</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* End Scene & Start Aftercare */}
      {session.status === 'active' && (
        <TouchableOpacity style={styles.endSceneBtn} onPress={onStartAftercare}>
          <Text style={styles.endSceneBtnText}>🏁 Concluir Escena & Pasar a Aftercare 🪷</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
