import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { DsHabit } from '@/types';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';

interface Props {
  habits: DsHabit[];
  onCompleteHabit: (habitId: string) => void;
  onAddHabit: () => void;
  onDeleteHabit: (habitId: string) => void;
}

export function DsHabitTracker({ habits, onCompleteHabit, onAddHabit, onDeleteHabit }: Props) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Hábitos & Rachas D/s</Text>
          <Text style={styles.subtitle}>Cumplimiento diario con multiplicadores de recompensa</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={onAddHabit}>
          <Text style={styles.addBtnText}>+ Nuevo Hábito</Text>
        </TouchableOpacity>
      </View>

      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔥</Text>
          <Text style={styles.emptyTitle}>Sin Hábitos Registrados</Text>
          <Text style={styles.emptySubtitle}>
            Crea tu primer hábito diario (ej. hidratación, postura, diario de sumisión, lectura).
          </Text>
        </View>
      ) : (
        habits.map((habit) => {
          const completedToday = habit.lastCompletedAt === today;
          const streakMultiplier =
            habit.streakMultiplierEnabled && habit.currentStreak >= 14
              ? '2.0x'
              : habit.streakMultiplierEnabled && habit.currentStreak >= 7
              ? '1.5x'
              : null;

          return (
            <View key={habit.id} style={styles.habitCard}>
              <View style={styles.habitTop}>
                <View style={styles.habitInfo}>
                  <Text style={styles.habitTitle}>{habit.title}</Text>
                  {habit.description ? <Text style={styles.habitDesc}>{habit.description}</Text> : null}
                </View>

                <View style={styles.streakBox}>
                  <Text style={styles.streakEmoji}>🔥</Text>
                  <Text style={styles.streakCount}>{habit.currentStreak}</Text>
                  <Text style={styles.streakLabel}>días</Text>
                </View>
              </View>

              {/* Progress & Multiplier */}
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${Math.min(100, (habit.currentStreak / (habit.targetStreak || 7)) * 100)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {habit.currentStreak} / {habit.targetStreak || 7} días (Récord: {habit.longestStreak})
                </Text>
                {streakMultiplier && (
                  <View style={styles.multiplierBadge}>
                    <Text style={styles.multiplierText}>⚡ {streakMultiplier}</Text>
                  </View>
                )}
              </View>

              {/* Action Bar */}
              <View style={styles.habitFooter}>
                <View style={styles.ptsInfo}>
                  <Text style={styles.ptsText}>+{habit.pointsPerCompletion} pts/día</Text>
                </View>

                <View style={styles.footerActions}>
                  <TouchableOpacity
                    style={[styles.claimBtn, completedToday && styles.claimBtnDisabled]}
                    disabled={completedToday}
                    onPress={() => onCompleteHabit(habit.id)}
                  >
                    <Text style={[styles.claimBtnText, completedToday && styles.claimBtnTextDisabled]}>
                      {completedToday ? '✓ Completado Hoy' : '🔥 Registrar Hoy'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.deleteBtn} onPress={() => onDeleteHabit(habit.id)}>
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    color: '#F3E8FF',
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: '#CCCCCC',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#D4AF37',
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: '#0d0814',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    color: '#F3E8FF',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: fontSize.xs,
    color: '#888888',
    textAlign: 'center',
    maxWidth: 280,
  },
  habitCard: {
    backgroundColor: '#0d0814',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        } as object)
      : {}),
  },
  habitTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  habitInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  habitTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    color: '#F3E8FF',
  },
  habitDesc: {
    fontSize: fontSize.xs,
    color: '#AAAAAA',
    marginTop: 2,
  },
  streakBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 114, 182, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 114, 182, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakCount: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: '#F472B6',
  },
  streakLabel: {
    fontSize: 10,
    color: '#F472B6',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: '#888888',
  },
  multiplierBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  multiplierText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4ADE80',
  },
  habitFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  ptsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ptsText: {
    fontSize: fontSize.xs,
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  claimBtn: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  claimBtnDisabled: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: '#4ADE80',
  },
  claimBtnText: {
    color: '#07050a',
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  claimBtnTextDisabled: {
    color: '#4ADE80',
  },
  deleteBtn: {
    padding: 6,
  },
  deleteBtnText: {
    fontSize: 12,
  },
});
