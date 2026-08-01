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
import { listMyLocalSessions } from '@/lib/storage';
import { getSessionByToken } from '@/lib/sessions';
import { generateReport } from '@/lib/compatibility';
import { Session, ReportItem, RATING_LABELS, ROLE_LABELS } from '@/types';

export default function NegotiationScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const params = useLocalSearchParams<{ token?: string }>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [negotiationNotes, setNegotiationNotes] = useState<Record<string, string>>({});
  const [negotiationStatuses, setNegotiationStatuses] = useState<Record<string, 'agreed' | 'adjust' | 'rejected'>>({});
  const [signed, setSigned] = useState(false);

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
    })();
  }, [params.token]);

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

        {/* Session Picker */}
        {sessions.length > 1 && (
          <View style={styles.sessionPickerBar}>
            <Text style={styles.pickerLabel}>Seleccionar Sesión:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {sessions.map((s) => {
                const name = s.guestNickname || s.guestProfile?.nickname || 'Pareja';
                const active = selectedSession?.id === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.pickerChip, active && styles.pickerChipActive]}
                    onPress={() => setSelectedSession(s)}
                  >
                    <Text style={[styles.pickerChipText, active && styles.pickerChipTextActive]}>
                      Sesión con {name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Content */}
        {!selectedSession || !report ? (
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
              <Text style={styles.infoTitle}>
                Negociando con: <Text style={{ color: colors.primary }}>{selectedSession.guestNickname || 'Pareja'}</Text>
              </Text>
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
});
