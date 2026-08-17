import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { UserProfile, ActivityResponse } from '@/types';
import { generateReport } from '@/lib/compatibility';

interface Props {
  visible: boolean;
  targetProfile: UserProfile;
  currentProfile: UserProfile;
  currentResponses?: ActivityResponse[];
  targetResponses?: ActivityResponse[];
  onClose: () => void;
}

export function DirectComparisonModal({
  visible,
  targetProfile,
  currentProfile,
  currentResponses = [],
  targetResponses = [],
  onClose,
}: Props) {
  // If target responses not available, simulate based on baseResponses or fallback ratings
  const myResponses = currentResponses.length > 0
    ? currentResponses
    : (currentProfile.baseResponses ?? []);

  const partnerResponses = targetResponses.length > 0
    ? targetResponses
    : (targetProfile.baseResponses ?? [
        { activityId: 'pe_d/s_dynamic', rating: 'love', role: 'give', intensity: 4 },
        { activityId: 'bo_rope', rating: 'like', role: 'receive', intensity: 3 },
        { activityId: 'in_eye_contact', rating: 'love', role: 'both', intensity: 5 },
      ]);

  const report = generateReport(
    `comp_${targetProfile.nickname}`,
    myResponses,
    partnerResponses,
    currentProfile,
    targetProfile
  );

  const mutualMatches = report.items.filter((i) => i.section === 'mutual_match');
  const hardLimitConflicts = report.items.filter((i) => i.section === 'hard_limit_conflict');
  const score = report.compatibilityScore;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>⚡ Matriz "Comparate Conmigo"</Text>
              <Text style={styles.modalSub}>
                {currentProfile.nickname || 'Tú'} vs {targetProfile.nickname}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Compatibility Score Circle */}
          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>{score}%</Text>
              <Text style={styles.scoreLabel}>Afinidad Directa</Text>
            </View>
            <Text style={styles.scoreSummary}>
              {score >= 70
                ? '🔥 ¡Excelente afinidad! Tienen múltiples puntos de encuentro en dinámicas e intensidad.'
                : score >= 40
                ? '✨ Afinidad moderada. Varias áreas de interés compartido para explorar.'
                : '🛡️ Dinámicas con límites duros diferenciados. Requiere diálogo de límites.'}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Mutual Kinks Matches */}
            <Text style={styles.sectionTitle}>💖 Puntos de Encuentro Mutuo ({mutualMatches.length}):</Text>
            {mutualMatches.length === 0 ? (
              <Text style={styles.emptyText}>Sin coincidencias exactas registradas aún.</Text>
            ) : (
              mutualMatches.map((m) => (
                <View key={m.activityId} style={styles.matchItemRow}>
                  <Text style={styles.matchEmoji}>🔥</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.matchTitle}>{m.activityName}</Text>
                    <Text style={styles.matchDesc}>
                      Tú: {m.initiatorRating} ({m.initiatorRole}) · {targetProfile.nickname}: {m.guestRating} ({m.guestRole})
                    </Text>
                  </View>
                </View>
              ))
            )}

            {/* Hard Limit Conflicts */}
            {hardLimitConflicts.length > 0 ? (
              <>
                <Text style={[styles.sectionTitle, { color: colors.danger, marginTop: spacing.md }]}>
                  🛑 Límites Duros a Respetar ({hardLimitConflicts.length}):
                </Text>
                {hardLimitConflicts.map((c) => (
                  <View key={c.activityId} style={styles.conflictRow}>
                    <Text style={styles.matchEmoji}>🛑</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.matchTitle, { color: colors.danger }]}>{c.activityName}</Text>
                      <Text style={styles.matchDesc}>Límite inviolable marcado por una de las partes.</Text>
                    </View>
                  </View>
                ))}
              </>
            ) : null}
          </ScrollView>

          <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
            <Text style={styles.closeModalBtnText}>Cerrar Comparación ⚡</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 5, 10, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: 'rgba(21, 13, 36, 0.96)',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.35)',
    width: '100%',
    maxWidth: 540,
    maxHeight: '85%',
    gap: spacing.sm,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 16px 48px rgba(7, 4, 13, 0.85)',
          backdropFilter: 'blur(16px)',
        }
      : {}),
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontFamily: fonts.displaySemi, fontSize: fontSize.lg, color: colors.neonPurple },
  modalSub: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  closeBtn: { padding: 4 },
  closeBtnText: { color: colors.textMuted, fontSize: 18, fontWeight: 'bold' },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.25)',
  },
  scoreCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.neonPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: { color: colors.neonPurple, fontFamily: fonts.displaySemi, fontSize: 18 },
  scoreLabel: { color: colors.textMuted, fontSize: 8, textAlign: 'center' },
  scoreSummary: { flex: 1, color: colors.text, fontSize: fontSize.xs, fontFamily: fonts.body },
  scrollContent: { paddingVertical: spacing.xs, gap: spacing.xs },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: fontSize.xs, color: colors.text, marginTop: spacing.xs },
  emptyText: { color: colors.textMuted, fontSize: fontSize.xs, fontStyle: 'italic' },
  matchItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(35, 23, 62, 0.5)',
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  conflictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: spacing.xs,
  },
  matchEmoji: { fontSize: 18 },
  matchTitle: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
  matchDesc: { color: colors.textMuted, fontSize: 11 },
  closeModalBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  closeModalBtnText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
});
