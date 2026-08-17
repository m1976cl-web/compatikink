import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { listMyLocalSessions } from '@/lib/storage';
import { generateReport } from '@/lib/compatibility';
import { Session, ReportItem, RATING_LABELS, ROLE_LABELS } from '@/types';
import { generateAINegotiationAgenda, AINegotiationPoint } from '@/lib/aiNegotiationHelper';
import { AINegotiationAgendaModal } from '@/components/negotiation/AINegotiationAgendaModal';
import { triggerLightHaptic } from '@/lib/haptics';

interface PauseDsState {
  durationDays: number;
  pausedRules: string[];
  retainedRules: string[];
  reopenDate: string;
  isPaused: boolean;
}

interface CncNegotiationState {
  authorizedScenarios: string[];
  revocationSafeword: string;
  tactileSignal: string;
  aftercareMandatory: boolean;
  isConfirmed: boolean;
}

const STORAGE_KEY_PAUSE = 'ds_pause_protocol_v1';
const STORAGE_KEY_CNC = 'cnc_negotiation_menu_v1';

export default function NegotiationScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const params = useLocalSearchParams<{ token?: string }>();
  const [activeSubTab, setActiveSubTab] = useState<'negotiation' | 'pause' | 'cnc'>('negotiation');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [negotiationNotes, setNegotiationNotes] = useState<Record<string, string>>({});
  const [negotiationStatuses, setNegotiationStatuses] = useState<Record<string, 'agreed' | 'adjust' | 'rejected'>>({});
  const [signed, setSigned] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPoints, setAiPoints] = useState<AINegotiationPoint[]>([]);
  const [generatingAi, setGeneratingAi] = useState(false);

  // Pausing D/s State
  const [pauseState, setPauseState] = useState<PauseDsState>({
    durationDays: 14,
    pausedRules: ['Protocolos de vestimenta', 'Tareas de servicio diario'],
    retainedRules: ['Check-in de salud emocional diario', 'Uso de Safewords de emergencia'],
    reopenDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    isPaused: false,
  });

  // CNC Negotiation State
  const [cncState, setCncState] = useState<CncNegotiationState>({
    authorizedScenarios: ['Prácticas de inmovilización sorpresiva acordadas', 'Juego de roles de captura ligera'],
    revocationSafeword: 'Rojo / RED',
    tactileSignal: '3 toques rápidos en el hombro',
    aftercareMandatory: true,
    isConfirmed: false,
  });

  useEffect(() => {
    (async () => {
      const all = await listMyLocalSessions();
      const completeSessions = all.filter((s) => s.status === 'complete');
      setSessions(completeSessions);

      if (params.token) {
        const found = completeSessions.find((s) => s.initiatorToken === params.token);
        if (found) setSelectedSession(found);
      } else if (completeSessions.length > 0) {
        setSelectedSession(completeSessions[0]);
      }

      // Load saved Pause and CNC states
      const savedPause = await readJsonStorage<PauseDsState | null>(STORAGE_KEY_PAUSE, null);
      if (savedPause) setPauseState(savedPause);

      const savedCnc = await readJsonStorage<CncNegotiationState | null>(STORAGE_KEY_CNC, null);
      if (savedCnc) setCncState(savedCnc);
    })();
  }, [params.token]);

  const togglePauseDs = async () => {
    const next = { ...pauseState, isPaused: !pauseState.isPaused };
    setPauseState(next);
    await writeJsonStorage(STORAGE_KEY_PAUSE, next);
  };

  const toggleConfirmCnc = async () => {
    const next = { ...cncState, isConfirmed: !cncState.isConfirmed };
    setCncState(next);
    await writeJsonStorage(STORAGE_KEY_CNC, next);
  };

  const report = useMemo(() => {
    if (!selectedSession || !selectedSession.guestResponses) return null;
    return generateReport(
      selectedSession.id,
      selectedSession.initiatorResponses,
      selectedSession.guestResponses,
      selectedSession.initiatorProfile,
      selectedSession.guestProfile
    );
  }, [selectedSession]);

  const mutualItems = useMemo(() => {
    if (!report) return [];
    return report.items.filter((i) => i.section === 'mutual_match' || i.section === 'explore_together');
  }, [report]);

  const handleToggleStatus = (activityId: string, status: 'agreed' | 'adjust' | 'rejected') => {
    setNegotiationStatuses((prev) => ({ ...prev, [activityId]: status }));
  };

  const handleSignAgreement = () => {
    setSigned(true);
    Alert.alert(
      '✍️ Acuerdo Digital Firmado',
      'Se han registrado los acuerdos y límites de la sesión de negociación en vivo.',
      [{ text: 'Ver Reporte de Sesión', onPress: () => router.push({ pathname: '/report', params: { token: selectedSession?.initiatorToken } }) }]
    );
  };

  const handleGenerateAiAgenda = async () => {
    if (!selectedSession) return;
    triggerLightHaptic();
    setGeneratingAi(true);
    try {
      const points = await generateAINegotiationAgenda(selectedSession, report);
      setAiPoints(points);
      setShowAiModal(true);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleApplyAiNotes = (notesText: string) => {
    if (mutualItems.length > 0) {
      const firstId = mutualItems[0].activityId;
      setNegotiationNotes((prev) => ({
        ...prev,
        [firstId]: (prev[firstId] ? prev[firstId] + '\n\n' : '') + notesText,
      }));
    }
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Sala de Negociación en Vivo</Text>
          <Text style={styles.subtitle}>
            Revisión sincrónica de actividades mutuas, definición de reglas y firma consensuada
          </Text>
        </View>

        {/* Sub-Tab Navigation Bar */}
        <View style={styles.subTabsRow}>
          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'negotiation' && styles.subTabActive]}
            onPress={() => setActiveSubTab('negotiation')}
          >
            <Text style={[styles.subTabText, activeSubTab === 'negotiation' && styles.subTabTextActive]}>
              🤝 Negociación
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'pause' && styles.subTabActive]}
            onPress={() => setActiveSubTab('pause')}
          >
            <Text style={[styles.subTabText, activeSubTab === 'pause' && styles.subTabTextActive]}>
              ⏸️ Pausa D/s
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'cnc' && styles.subTabActive]}
            onPress={() => setActiveSubTab('cnc')}
          >
            <Text style={[styles.subTabText, activeSubTab === 'cnc' && styles.subTabTextActive]}>
              ⚠️ Menú CNC
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeSubTab === 'pause' ? (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>⏸️ Protocolo de Pausa Consensuada D/s</Text>
              <Text style={styles.infoSub}>
                Congelación temporal de reglas y dinámicas de poder para descanso emocional o laboral, manteniendo la seguridad.
              </Text>

              <View style={[styles.pauseStatusBox, pauseState.isPaused && styles.pauseStatusBoxActive]}>
                <Text style={styles.pauseStatusTitle}>
                  Estado Actual: <Text style={{ color: pauseState.isPaused ? colors.warning : colors.success, fontWeight: '900' }}>
                    {pauseState.isPaused ? '⏸️ DINÁMICA PAUSADA' : '▶️ DINÁMICA ACTIVA'}
                  </Text>
                </Text>
                <Text style={styles.pauseStatusSub}>Re-apertura programada: {pauseState.reopenDate}</Text>
              </View>

              <View style={styles.clauseBox}>
                <Text style={styles.clauseTitle}>🛑 Reglas Temporalmente Pausadas:</Text>
                {pauseState.pausedRules.map((rule, idx) => (
                  <Text key={idx} style={styles.clauseItem}>• {rule}</Text>
                ))}
              </View>

              <View style={styles.clauseBox}>
                <Text style={styles.clauseTitle}>🟢 Reglas Inviolables que Se Mantienen:</Text>
                {pauseState.retainedRules.map((rule, idx) => (
                  <Text key={idx} style={styles.clauseItem}>• {rule}</Text>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.pauseBtn, pauseState.isPaused && styles.pauseBtnActive]}
                onPress={togglePauseDs}
              >
                <Text style={styles.pauseBtnText}>
                  {pauseState.isPaused ? '▶️ Re-activar Dinámica Consensuada' : '⏸️ Activar Pausa Consensuada (14 Días)'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : activeSubTab === 'cnc' ? (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>⚠️ Menú de Negociación CNC (Consensual Non-Consent)</Text>
              <Text style={styles.infoSub}>
                Protocolo estricto de consentimiento previo entusiasta con salvaguardas universales irrenunciables.
              </Text>

              <View style={[styles.pauseStatusBox, cncState.isConfirmed && styles.pauseStatusBoxActive]}>
                <Text style={styles.pauseStatusTitle}>
                  Estado del Menú: <Text style={{ color: cncState.isConfirmed ? colors.success : colors.warning, fontWeight: '900' }}>
                    {cncState.isConfirmed ? '✓ AUTORIZADO Y RATIFICADO' : '📝 EN NEGOCIACIÓN'}
                  </Text>
                </Text>
              </View>

              <View style={styles.clauseBox}>
                <Text style={styles.clauseTitle}>📋 Escenarios Expresamente Autorizados:</Text>
                {cncState.authorizedScenarios.map((sc, idx) => (
                  <Text key={idx} style={styles.clauseItem}>• {sc}</Text>
                ))}
              </View>

              <View style={styles.clauseBox}>
                <Text style={styles.clauseTitle}>🚨 Señales de Revocación Inmediata Instantánea:</Text>
                <Text style={styles.clauseItem}>🗣️ Safeword Verbal: <Text style={{ fontWeight: '800', color: colors.warning }}>{cncState.revocationSafeword}</Text></Text>
                <Text style={styles.clauseItem}>✋ Señal Táctil No-Verbal: <Text style={{ fontWeight: '800', color: colors.warning }}>{cncState.tactileSignal}</Text></Text>
              </View>

              <TouchableOpacity
                style={[styles.pauseBtn, cncState.isConfirmed && styles.pauseBtnActive]}
                onPress={toggleConfirmCnc}
              >
                <Text style={styles.pauseBtnText}>
                  {cncState.isConfirmed ? '✓ Revocar Ratificación de Menú CNC' : '✍️ Ratificar Menú CNC en Bóveda Cifrada'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : !selectedSession || !report ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No hay sesión completa seleccionada</Text>
            <Text style={styles.emptyText}>
              Completa un test de compatibilidad en pareja primero para habilitar la sala de negociación.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Header Card */}
            <View style={styles.infoCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.infoTitle}>
                  Negociando con: <Text style={{ color: colors.primary }}>{selectedSession.guestNickname || 'Pareja'}</Text>
                </Text>
                <TouchableOpacity
                  style={styles.aiAgendaBtn}
                  onPress={handleGenerateAiAgenda}
                  disabled={generatingAi}
                  activeOpacity={0.8}
                >
                  <Text style={styles.aiAgendaBtnText}>
                    {generatingAi ? 'Generando...' : '🤖 Agenda IA ✨'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.infoSub}>
                Revisen juntos las {mutualItems.length} actividades de interés mutuo antes de realizar la escena.
              </Text>
            </View>

            {/* Items List */}
            {mutualItems.map((item) => {
              const status = negotiationStatuses[item.activityId] ?? 'agreed';
              const note = negotiationNotes[item.activityId] ?? '';

              return (
                <View key={item.activityId} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.activityName}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>
                        {status === 'agreed' && '💚 Acordado'}
                        {status === 'adjust' && '💛 Ajustar'}
                        {status === 'rejected' && '🛑 Omitir'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.itemMeta}>
                    Preferencias — Tú: {RATING_LABELS[item.initiatorRating]} ({ROLE_LABELS[item.initiatorRole]}) · Ellos: {RATING_LABELS[item.guestRating]} ({ROLE_LABELS[item.guestRole]})
                  </Text>

                  {/* Status Toggle Bar */}
                  <View style={styles.statusToggleBar}>
                    <TouchableOpacity
                      style={[styles.toggleBtn, status === 'agreed' && styles.toggleAgreed]}
                      onPress={() => handleToggleStatus(item.activityId, 'agreed')}
                    >
                      <Text style={styles.toggleBtnText}>💚 Aprobar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.toggleBtn, status === 'adjust' && styles.toggleAdjust]}
                      onPress={() => handleToggleStatus(item.activityId, 'adjust')}
                    >
                      <Text style={styles.toggleBtnText}>💛 Ajustar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.toggleBtn, status === 'rejected' && styles.toggleRejected]}
                      onPress={() => handleToggleStatus(item.activityId, 'rejected')}
                    >
                      <Text style={styles.toggleBtnText}>🛑 Omitir</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Negotiation Note Input */}
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Nota de acuerdo (ej: Usar solo cuerdas blandas, safeword Amarillo a los 15m)..."
                    placeholderTextColor={colors.textMuted}
                    value={note}
                    onChangeText={(text) =>
                      setNegotiationNotes((prev) => ({ ...prev, [item.activityId]: text }))
                    }
                  />
                </View>
              );
            })}

            {/* Sign Agreement Button */}
            <TouchableOpacity
              style={[styles.signBtn, signed && styles.signedBtn]}
              onPress={handleSignAgreement}
            >
              <Text style={styles.signBtnText}>
                {signed ? '✓ Acuerdo Firmado por Ambos' : '✍️ Firmar Acuerdo Consensual Digital'}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 60 }} />
          </ScrollView>
        )}

        {/* AI Negotiation Agenda Modal */}
        <AINegotiationAgendaModal
          visible={showAiModal}
          onClose={() => setShowAiModal(false)}
          points={aiPoints}
          onApplyToNotes={handleApplyAiNotes}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  aiAgendaBtn: {
    backgroundColor: 'rgba(192, 132, 252, 0.18)',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.md,
  },
  aiAgendaBtnText: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: fonts.bodyBold,
  },

  sessionPickerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  pickerLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  pickerChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pickerChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  pickerChipTextActive: { color: '#fff' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 4,
  },
  infoTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  infoSub: { color: colors.textMuted, fontSize: fontSize.xs },

  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { color: colors.primary, fontSize: fontSize.md, fontWeight: '800', flex: 1 },
  statusBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBadgeText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '700' },
  itemMeta: { color: colors.textMuted, fontSize: fontSize.xs },

  statusToggleBar: { flexDirection: 'row', gap: spacing.xs },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  toggleAgreed: { backgroundColor: 'rgba(74, 222, 128, 0.2)', borderColor: colors.success },
  toggleAdjust: { backgroundColor: 'rgba(251, 191, 36, 0.2)', borderColor: colors.warning },
  toggleRejected: { backgroundColor: 'rgba(248, 113, 113, 0.2)', borderColor: colors.danger },
  toggleBtnText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '700' },

  noteInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: fontSize.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },

  signBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  signedBtn: { backgroundColor: colors.success },
  signBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: '900' },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800' },
  emptyText: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', maxWidth: 360 },

  subTabsRow: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.sm },
  subTab: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.md, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  subTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  subTabText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  subTabTextActive: { color: '#fff', fontWeight: '900' },

  card: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle },
  cardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900' },
  cardSub: { color: colors.textMuted, fontSize: fontSize.xs },

  pauseStatusBox: { backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: radii.lg, gap: 4, borderWidth: 1, borderColor: colors.border },
  pauseStatusBoxActive: { borderColor: colors.warning, backgroundColor: 'rgba(251, 191, 36, 0.08)' },
  pauseStatusTitle: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  pauseStatusSub: { color: colors.textMuted, fontSize: 10 },

  clauseBox: { backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: radii.lg, gap: 4, borderWidth: 1, borderColor: colors.border },
  clauseTitle: { color: colors.warning, fontSize: fontSize.xs, fontWeight: '800' },
  clauseItem: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },

  pauseBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center' },
  pauseBtnActive: { backgroundColor: colors.success },
  pauseBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '900' },
});
