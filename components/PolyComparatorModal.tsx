import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import { Session, UserProfile } from '@/types';
import { generateReport } from '@/lib/compatibility';

interface Props {
  visible: boolean;
  onClose: () => void;
  sessions: Session[];
  currentProfile: UserProfile;
}

export function PolyComparatorModal({ visible, onClose, sessions, currentProfile }: Props) {
  const completedSessions = sessions.filter((s) => s.status === 'complete' && s.guestResponses);

  const comparisons = completedSessions.map((s) => {
    const isInitiator = s.initiatorNickname === currentProfile.nickname;
    const partnerName = isInitiator
      ? s.guestNickname || s.guestProfile?.nickname || 'Invitado'
      : s.initiatorNickname || s.initiatorProfile?.nickname || 'Iniciador';

    const report = generateReport(
      s.id,
      s.initiatorResponses,
      s.guestResponses!,
      s.initiatorProfile,
      s.guestProfile
    );

    return {
      sessionId: s.id,
      partnerName,
      score: report.compatibilityScore,
      mutualMatches: report.mutualMatchCount,
      explore: report.exploreCount,
      conflicts: report.conflictCount,
      archetype: isInitiator ? report.guestArchetype : report.initiatorArchetype,
    };
  });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.subTitle}>Matriz Poli / Multi-Vínculo</Text>
              <Text style={styles.title}>Comparativa de Parejas 👥</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            {comparisons.length === 0 ? (
              <Text style={styles.emptyText}>
                No tienes sesiones completadas para comparar. Invita a más parejas para ver el análisis multi-vínculo.
              </Text>
            ) : (
              comparisons.map((c) => (
                <View key={c.sessionId} style={styles.partnerCard}>
                  <View style={styles.partnerHeader}>
                    <Text style={styles.partnerName}>vs. {c.partnerName}</Text>
                    <Text style={styles.partnerScore}>{c.score}%</Text>
                  </View>

                  <Text style={styles.archetypeLabel}>Arquetipo Kink: {c.archetype}</Text>

                  {/* Score Bar */}
                  <View style={styles.scoreBarBg}>
                    <View style={[styles.scoreBarFill, { width: `${c.score}%` }]} />
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                      <Text style={styles.statVal}>{c.mutualMatches}</Text>
                      <Text style={styles.statLbl}>Matches</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statVal}>{c.explore}</Text>
                      <Text style={styles.statLbl}>Explorar</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statVal}>{c.conflicts}</Text>
                      <Text style={styles.statLbl}>Atención</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  container: {
    backgroundColor: colors.background,
    borderRadius: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subTitle: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginVertical: spacing.lg,
  },
  partnerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  partnerScore: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  archetypeLabel: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreBarBg: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginTop: 4,
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  statLbl: {
    color: colors.textMuted,
    fontSize: 9,
    textTransform: 'uppercase',
  },
});
