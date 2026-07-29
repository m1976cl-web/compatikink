import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

export interface ScheduledScene {
  id: string;
  partnerName: string;
  activityName: string;
  dateString: string;
  timeString: string;
  aftercareReminder24h: boolean;
  notes?: string;
}

const SCENES_STORAGE_KEY = 'scheduled_scenes_calendar';

export default function CalendarScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [scheduledScenes, setScheduledScenes] = useState<ScheduledScene[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [partnerName, setPartnerName] = useState('');
  const [activityName, setActivityName] = useState('Shibari & Sensaciones');
  const [dateString, setDateString] = useState('2026-08-01');
  const [timeString, setTimeString] = useState('21:00');
  const [aftercareReminder, setAftercareReminder] = useState(true);

  const loadScenes = async () => {
    const raw = await AsyncStorage.getItem(SCENES_STORAGE_KEY);
    if (raw) {
      setScheduledScenes(JSON.parse(raw));
    }
  };

  useEffect(() => {
    loadScenes();
  }, []);

  const handleAddScene = async () => {
    if (!partnerName.trim()) {
      Alert.alert('Pareja Requerida', 'Por favor especifica con quién agendarás la escena.');
      return;
    }

    const newScene: ScheduledScene = {
      id: `${Date.now()}`,
      partnerName: partnerName.trim(),
      activityName: activityName.trim(),
      dateString,
      timeString,
      aftercareReminder24h: aftercareReminder,
    };

    const updated = [...scheduledScenes, newScene];
    setScheduledScenes(updated);
    await AsyncStorage.setItem(SCENES_STORAGE_KEY, JSON.stringify(updated));
    setShowAddModal(false);
    setPartnerName('');
  };

  const handleRemoveScene = async (id: string) => {
    const updated = scheduledScenes.filter((s) => s.id !== id);
    setScheduledScenes(updated);
    await AsyncStorage.setItem(SCENES_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📅 Calendario de Escenas & Aftercare</Text>
          <Text style={styles.subtitle}>
            Programa tus próximas sesiones y programa alertas automáticas de seguimiento a las 24 hrs
          </Text>
        </View>

        {/* Schedule Scene Trigger */}
        <TouchableOpacity style={styles.addTriggerBtn} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addTriggerText}>➕ Agendar Nueva Escena con Pareja</Text>
        </TouchableOpacity>

        {/* Modal / Form */}
        {showAddModal && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Agendar Cita / Escena</Text>

            <Text style={styles.fieldLabel}>Pareja:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Sam, Alex..."
              placeholderTextColor={colors.textMuted}
              value={partnerName}
              onChangeText={setPartnerName}
            />

            <Text style={styles.fieldLabel}>Actividad o Enfoque:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Shibari & Cera, Juego de Rol..."
              placeholderTextColor={colors.textMuted}
              value={activityName}
              onChangeText={setActivityName}
            />

            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Fecha (AAAA-MM-DD):</Text>
                <TextInput
                  style={styles.input}
                  value={dateString}
                  onChangeText={setDateString}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Hora:</Text>
                <TextInput
                  style={styles.input}
                  value={timeString}
                  onChangeText={setTimeString}
                />
              </View>
            </View>

            {/* Aftercare Check-in 24h Toggle */}
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setAftercareReminder(!aftercareReminder)}
            >
              <Text style={styles.toggleText}>
                {aftercareReminder ? '☑ Recordatorio de Check-in de Aftercare a las 24 hrs' : '☐ Sin recordatorio'}
              </Text>
            </TouchableOpacity>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddScene}>
                <Text style={styles.saveBtnText}>Agendar en Calendario 📅</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Scheduled List */}
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {scheduledScenes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 44 }}>📅</Text>
              <Text style={styles.emptyText}>No tienes escenas agendadas aún.</Text>
            </View>
          ) : (
            scheduledScenes.map((item) => (
              <View key={item.id} style={styles.sceneCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scenePartner}>Con: {item.partnerName}</Text>
                  <Text style={styles.sceneAct}>{item.activityName}</Text>
                  <Text style={styles.sceneTime}>
                    📆 {item.dateString} a las {item.timeString} hrs
                  </Text>
                  {item.aftercareReminder24h ? (
                    <View style={styles.aftercareBadge}>
                      <Text style={styles.aftercareBadgeText}>🔔 Alerta Aftercare 24h Activa</Text>
                    </View>
                  ) : null}
                </View>

                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemoveScene(item.id)}>
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 720, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.xs },

  addTriggerBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  addTriggerText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '800' },

  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  formTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  fieldLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: fontSize.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },

  toggleRow: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleText: { color: colors.success, fontSize: fontSize.xs, fontWeight: '700' },

  formActions: { flexDirection: 'row', gap: spacing.xs, marginTop: 4 },
  saveBtn: { flex: 1, backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: spacing.md },
  cancelBtnText: { color: colors.textMuted, fontSize: fontSize.xs },

  list: { gap: spacing.sm, paddingTop: spacing.xs },
  sceneCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scenePartner: { color: colors.neonPurple, fontSize: fontSize.md, fontWeight: '800' },
  sceneAct: { color: colors.text, fontSize: fontSize.sm, marginTop: 2 },
  sceneTime: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  aftercareBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  aftercareBadgeText: { color: colors.success, fontSize: 10, fontWeight: '700' },

  deleteBtn: { padding: 8 },
  deleteText: { color: colors.danger, fontSize: 16, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md },
});
