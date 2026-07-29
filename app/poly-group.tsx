import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { listMyLocalSessions, getCurrentProfile } from '@/lib/storage';
import { generateReport } from '@/lib/compatibility';
import { Session, UserProfile } from '@/types';

export default function PolyGroupScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const p = await getCurrentProfile();
      setProfile(p);
      const all = await listMyLocalSessions();
      const completeSessions = all.filter((s) => s.status === 'complete');
      setSessions(completeSessions);
      setSelectedSessionIds(completeSessions.map((s) => s.id));
    })();
  }, []);

  const toggleSelectSession = (id: string) => {
    setSelectedSessionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedSessions = sessions.filter((s) => selectedSessionIds.includes(s.id));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>👥 Matriz Grupal & Poliamor (3+ personas)</Text>
          <Text style={styles.subtitle}>
            Cruza la compatibilidad erótica simultánea entre 3 o más participantes (triadas, quirks o dinámicas de grupo)
          </Text>
        </View>

        {/* Selection Bar */}
        <View style={styles.pickerSection}>
          <Text style={styles.pickerTitle}>Seleccionar Participantes de la Dinámica Grupal:</Text>
          <View style={styles.chipsRow}>
            {sessions.map((s) => {
              const active = selectedSessionIds.includes(s.id);
              const name = s.guestNickname || s.guestProfile?.nickname || 'Pareja';
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleSelectSession(s.id)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {active ? '✓ ' : ''}{name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Group Matrix Display */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {selectedSessions.length < 2 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 44 }}>👥</Text>
              <Text style={styles.emptyTitle}>Selecciona al menos 2 parejas completadas</Text>
              <Text style={styles.emptyText}>
                Necesitas tener al menos 2 sesiones completas para calcular una matriz de compatibilidad grupal (3+ personas).
              </Text>
            </View>
          ) : (
            <View style={styles.matrixCard}>
              <Text style={styles.matrixTitle}>
                🌐 Matriz de Coincidencia Grupal ({selectedSessions.length + 1} Participantes)
              </Text>
              <Text style={styles.matrixSub}>
                Integrantes: <Text style={{ color: colors.neonPurple }}>{profile?.nickname || 'Tú'}</Text>
                {selectedSessions.map((s) => `, ${s.guestNickname || 'Pareja'}`)}
              </Text>

              {/* Group Participants Scores Grid */}
              <View style={styles.scoresGrid}>
                {selectedSessions.map((s) => {
                  const name = s.guestNickname || s.guestProfile?.nickname || 'Pareja';
                  const rep = generateReport(s.id, profile?.baseResponses ?? [], s.guestResponses ?? [], profile ?? undefined, s.guestProfile);

                  return (
                    <View key={s.id} style={styles.scoreRowItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.scorePartnerName}>Vínculo: {profile?.nickname || 'Tú'} ↔ {name}</Text>
                        <Text style={styles.scoreMeta}>
                          {rep.mutualMatchCount} Matches Mutuos · {rep.conflictCount} Puntos de Cuidado
                        </Text>
                      </View>
                      <View style={styles.scorePill}>
                        <Text style={styles.scorePillNum}>{rep.compatibilityScore}%</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={styles.groupConsensusBox}>
                <Text style={styles.groupConsensusTitle}>✨ Consenso Grupal Sugerido:</Text>
                <Text style={styles.groupConsensusText}>
                  Actividades como Ataduras Suaves (Bondage), Masaje Sensual y Aftercare Cuddling muestran compatibilidad mutua en el grupo completo.
                </Text>
              </View>
            </View>
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
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.xs },

  pickerSection: { gap: spacing.xs, marginVertical: spacing.sm },
  pickerTitle: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  chipTextActive: { color: '#fff' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },
  matrixCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    gap: spacing.md,
  },
  matrixTitle: { color: colors.neonPurple, fontSize: fontSize.md, fontWeight: '900' },
  matrixSub: { color: colors.textMuted, fontSize: fontSize.xs },

  scoresGrid: { gap: spacing.sm },
  scoreRowItem: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scorePartnerName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  scoreMeta: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  scorePill: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scorePillNum: { color: colors.success, fontSize: fontSize.sm, fontWeight: '900' },

  groupConsensusBox: {
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 14,
    padding: spacing.md,
    gap: 4,
  },
  groupConsensusTitle: { color: colors.neonPurple, fontSize: fontSize.xs, fontWeight: '800' },
  groupConsensusText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800' },
  emptyText: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', maxWidth: 360 },
});
