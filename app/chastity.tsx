import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';

import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

interface VerificationSchedule {
  id: string;
  intervalHours: number;
  label: string;
  nextCheckInIso: string;
  status: 'pending' | 'verified' | 'overdue';
  lastPhotoUri?: string;
  skinStatus?: 'excelente' | 'irritacion_leve' | 'requiere_descanso';
}

interface ChastityStarterProgress {
  day1Done: boolean;
  day2Done: boolean;
  day3Done: boolean;
  day4Done: boolean;
  notes: string;
}

const STORAGE_KEY_STARTER = 'chastity_4day_starter_v1';

export default function ChastityScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [activeTab, setActiveTab] = useState<'verification' | 'profiles' | 'starter'>('verification');
  const [filterRole, setFilterRole] = useState<'all' | 'keyholder' | 'wearer'>('all');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<number>(24);
  const [skinStatus, setSkinStatus] = useState<'excelente' | 'irritacion_leve' | 'requiere_descanso'>('excelente');
  const [mockPhoto, setMockPhoto] = useState<string | null>(null);

  const [starterProgress, setStarterProgress] = useState<ChastityStarterProgress>({
    day1Done: false,
    day2Done: false,
    day3Done: false,
    day4Done: false,
    notes: '',
  });

  // Load persistent schedules and 4-day starter progress from ZK Vault / AsyncStorage
  useEffect(() => {
    readJsonStorage<ChastityStarterProgress>(STORAGE_KEY_STARTER, {
      day1Done: false,
      day2Done: false,
      day3Done: false,
      day4Done: false,
      notes: '',
    }).then((saved: ChastityStarterProgress) => {
      if (saved) setStarterProgress(saved);
    });
  }, []);

  const toggleStarterDay = async (dayKey: keyof Omit<ChastityStarterProgress, 'notes'>) => {
    const updated = { ...starterProgress, [dayKey]: !starterProgress[dayKey] };
    setStarterProgress(updated);
    await writeJsonStorage(STORAGE_KEY_STARTER, updated);
  };

  const [schedules, setSchedules] = useState<VerificationSchedule[]>([
    {
      id: 'sch-1',
      intervalHours: 12,
      label: 'Cada 12 Horas (Verificación de Posición & Piel)',
      nextCheckInIso: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      status: 'pending',
    },
    {
      id: 'sch-2',
      intervalHours: 24,
      label: 'Cada 24 Horas (Foto Check-in Diario del Candado)',
      nextCheckInIso: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      status: 'verified',
      lastPhotoUri: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=60',
      skinStatus: 'excelente',
    },
  ]);

  const handleRequestPushVerification = () => {
    Alert.alert(
      '🔔 Solicitud Push Enviada al Wearer',
      'Se ha enviado una notificación Push de alta prioridad solicitando verificación fotográfica inmediata del candado y la salud cutánea.',
      [{ text: 'Entendido 👍' }]
    );
  };

  const handleSimulateTakePhoto = () => {
    // Simulated photo check-in upload
    const samplePhotos = [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=60',
    ];
    const random = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    setMockPhoto(random);
    Alert.alert('Foto Capturada 📸', 'Se ha adjuntado la imagen de verificación con marca de tiempo y coordenadas de seguridad.');
  };

  const handleSubmitVerification = () => {
    if (!mockPhoto) {
      Alert.alert('Foto Requerida', 'Por favor adjunta la fotografía de verificación antes de enviar.');
      return;
    }

    const newSch: VerificationSchedule = {
      id: `sch-${Date.now()}`,
      intervalHours: selectedInterval,
      label: `Cada ${selectedInterval} Horas (Check-in Fotográfico)`,
      nextCheckInIso: new Date(Date.now() + selectedInterval * 3600 * 1000).toISOString(),
      status: 'verified',
      lastPhotoUri: mockPhoto,
      skinStatus,
    };

    setSchedules((prev) => [newSch, ...prev]);
    setShowVerifyModal(false);
    setMockPhoto(null);
    Alert.alert('Verificación Aprobada ✅', 'El Keyholder ha sido notificado con la fotografía y la evaluación de salud cutánea.');
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Módulo de Castidad & Verificación</Text>
          <Text style={styles.subtitle}>
            Matchmaking de Keyholders y sistema de verificación fotográfica programada con notificaciones Push
          </Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'verification' && styles.tabActive]}
            onPress={() => setActiveTab('verification')}
          >
            <Text style={[styles.tabText, activeTab === 'verification' && styles.tabTextActive]}>
              📸 Verificaciones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'starter' && styles.tabActive]}
            onPress={() => setActiveTab('starter')}
          >
            <Text style={[styles.tabText, activeTab === 'starter' && styles.tabTextActive]}>
              🔒 Starter 4 Días
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'profiles' && styles.tabActive]}
            onPress={() => setActiveTab('profiles')}
          >
            <Text style={[styles.tabText, activeTab === 'profiles' && styles.tabTextActive]}>
              🗝️ Keyholders
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {activeTab === 'verification' ? (
            <>
              {/* Push Action Header */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🔔 Panel de Control de Keyholder</Text>
                <Text style={styles.cardDesc}>
                  Solicita una verificación fotográfica instantánea al Wearer vía Notificación Push o programa chequeos periódicos.
                </Text>

                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity style={styles.pushBtn} onPress={handleRequestPushVerification}>
                    <Text style={styles.pushBtnText}>⚡ Enviar Solicitud Push Instantánea</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.scheduleBtn} onPress={() => setShowVerifyModal(true)}>
                    <Text style={styles.scheduleBtnText}>📅 Programar Verificación</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Scheduled Verifications List */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>📋 Verificaciones Programadas & Evidencias</Text>

                {schedules.map((sch) => (
                  <View key={sch.id} style={styles.verifyItem}>
                    <View style={styles.verifyHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.verifyLabel}>{sch.label}</Text>
                        <Text style={styles.verifyTime}>
                          Próximo chequeo: {new Date(sch.nextCheckInIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.badgeStatus,
                          sch.status === 'verified' ? styles.badgeVerified : styles.badgePending,
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeStatusText,
                            sch.status === 'verified' ? { color: colors.success } : { color: colors.warning },
                          ]}
                        >
                          {sch.status === 'verified' ? '✓ Verificado' : '⏳ Pendiente'}
                        </Text>
                      </View>
                    </View>

                    {sch.lastPhotoUri && (
                      <View style={styles.photoContainer}>
                        <Image source={{ uri: sch.lastPhotoUri }} style={styles.photoPreview} />
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={styles.photoTitle}>📸 Evidencia Fotográfica Recibida</Text>
                          <Text style={styles.photoMeta}>
                            Salud Cutánea: <Text style={{ color: colors.success, fontWeight: '800' }}>{sch.skinStatus ?? 'Excelente'}</Text>
                          </Text>
                          <Text style={styles.photoTimestamp}>Timestamp cifrado AES-256 verificable</Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </>
          ) : activeTab === 'starter' ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔒 Plan de Iniciación en Castidad (4 Días)</Text>
              <Text style={styles.cardSub}>
                Guía progresiva para parejas o Keyholders/Wearers iniciando su primera experiencia de contención.
              </Text>

              <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
                {[
                  {
                    key: 'day1Done' as const,
                    day: 'Día 1: Negociación & Ajuste Ergonométrico',
                    desc: 'Negociación de límites, verificación de llaves físicas/digitales y ajuste del dispositivo sin presión excesiva.',
                    icon: '🗝️',
                  },
                  {
                    key: 'day2Done' as const,
                    day: 'Día 2: Control de Impulsos & Tareas de Sumisión',
                    desc: 'Introducción a tareas diarias de atención al Keyholder y protocolo de prohibición de clímax.',
                    icon: '⚡',
                  },
                  {
                    key: 'day3Done' as const,
                    day: 'Día 3: Check-in de Salud Cutánea & Limpieza',
                    desc: 'Inspección minuciosa de la piel, higiene rigurosa con agua tibia y verificación de circulación.',
                    icon: '🧴',
                  },
                  {
                    key: 'day4Done' as const,
                    day: 'Día 4: Evaluación, Celebración & Desbloqueo',
                    desc: 'Debriefing post-castidad: evaluación emocional, liberación negociada y Aftercare intensivo.',
                    icon: '🔓',
                  },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.starterItem, starterProgress[item.key] && styles.starterItemDone]}
                    onPress={() => toggleStarterDay(item.key)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.starterDayTitle, starterProgress[item.key] && styles.starterDayTitleDone]}>
                          {item.day}
                        </Text>
                        <Text style={styles.starterDayDesc}>{item.desc}</Text>
                      </View>
                      <Text style={{ fontSize: 20 }}>{starterProgress[item.key] ? '✅' : '⬜'}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            /* Profiles list tab */
            <View style={styles.card}>
              <Text style={styles.cardTitle}>👥 Red de Keyholders y Wearers en Castidad</Text>
              <Text style={styles.cardDesc}>
                Encuentra parejas con intereses compatibles en control de llave, disciplina e higiene.
              </Text>
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>

        {/* Verification Checkin Modal */}
        <Modal visible={showVerifyModal} transparent animationType="fade" onRequestClose={() => setShowVerifyModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowVerifyModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>📸 Programar Verificación Fotográfica</Text>
              <Text style={styles.modalSub}>Selecciona la frecuencia con la que el Wearer debe enviar la foto del candado:</Text>

              {/* Interval Picker */}
              <View style={styles.intervalsRow}>
                {[
                  { hours: 12, label: '12 Horas' },
                  { hours: 24, label: '24 Horas (Diario)' },
                  { hours: 72, label: '3 Días' },
                  { hours: 168, label: 'Semanal' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.hours}
                    style={[
                      styles.intervalChip,
                      selectedInterval === item.hours && styles.intervalChipActive,
                    ]}
                    onPress={() => setSelectedInterval(item.hours)}
                  >
                    <Text style={[styles.intervalChipText, selectedInterval === item.hours && styles.intervalChipTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Health Evaluation */}
              <Text style={styles.fieldLabel}>Estado de Salud Cutánea / Incomodidad:</Text>
              <View style={styles.intervalsRow}>
                {[
                  { id: 'excelente' as const, label: '🟢 Excelente' },
                  { id: 'irritacion_leve' as const, label: '🟡 Irritación Leve' },
                  { id: 'requiere_descanso' as const, label: '🔴 Requiere Pausa' },
                ].map((st) => (
                  <TouchableOpacity
                    key={st.id}
                    style={[styles.intervalChip, skinStatus === st.id && styles.intervalChipActive]}
                    onPress={() => setSkinStatus(st.id)}
                  >
                    <Text style={[styles.intervalChipText, skinStatus === st.id && styles.intervalChipTextActive]}>
                      {st.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Photo Upload Attachment Button */}
              <TouchableOpacity style={styles.attachPhotoBtn} onPress={handleSimulateTakePhoto}>
                <Text style={styles.attachPhotoText}>
                  {mockPhoto ? '📷 Fotografía Adjuntada (Cambiar)' : '📷 Tomar / Adjuntar Foto de Evidencia'}
                </Text>
              </TouchableOpacity>

              {mockPhoto && (
                <Image source={{ uri: mockPhoto }} style={styles.modalPhotoPreview} />
              )}

              <TouchableOpacity style={styles.saveVerificationBtn} onPress={handleSubmitVerification}>
                <Text style={styles.saveVerificationText}>Enviar Verificación al Keyholder 🚀</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  tabsRow: { flexDirection: 'row', gap: 4, marginVertical: spacing.sm },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  tabTextActive: { color: '#fff' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  card: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle },
  cardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900' },
  cardSub: { color: colors.textMuted, fontSize: fontSize.xs },
  cardDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  actionButtonsRow: { gap: spacing.xs },
  pushBtn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  pushBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '900' },
  scheduleBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  scheduleBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },

  verifyItem: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  verifyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verifyLabel: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  verifyTime: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  badgeStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeVerified: { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderWidth: 1, borderColor: colors.success },
  badgePending: { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderWidth: 1, borderColor: colors.warning },
  badgeStatusText: { fontSize: 10, fontWeight: '800' },

  photoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.accentSoft,
    borderRadius: radii.md,
    padding: spacing.xs,
    marginTop: 4,
  },
  photoPreview: { width: 54, height: 54, borderRadius: 8 },
  photoTitle: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },
  photoMeta: { color: colors.text, fontSize: 10 },
  photoTimestamp: { color: colors.textMuted, fontSize: 9 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(10, 6, 18, 0.85)', justifyContent: 'center', alignItems: 'center', padding: spacing.md },
  modalCard: { backgroundColor: colors.surface, borderRadius: 24, padding: spacing.xl, maxWidth: 440, width: '100%', borderWidth: 1.5, borderColor: colors.primary, gap: spacing.md },
  modalCloseBtn: { position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderRadius: radii.lg, backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  modalCloseText: { color: colors.textMuted, fontSize: 14 },
  modalTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900' },
  modalSub: { color: colors.textMuted, fontSize: fontSize.xs },

  intervalsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  intervalChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.md, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  intervalChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  intervalChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  intervalChipTextActive: { color: '#fff' },

  fieldLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },

  attachPhotoBtn: { backgroundColor: colors.surfaceLight, borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center' },
  attachPhotoText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },
  modalPhotoPreview: { width: '100%', height: 140, borderRadius: radii.md },

  saveVerificationBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center' },
  saveVerificationText: { color: '#fff', fontSize: fontSize.sm, fontWeight: '800' },

  starterItem: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  starterItemDone: {
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    borderColor: colors.success,
  },
  starterDayTitle: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  starterDayTitleDone: {
    color: colors.success,
  },
  starterDayDesc: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
});
