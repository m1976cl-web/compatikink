import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { FlowBar } from '@/components/FlowBar';
import { ActivityResponse, Rating, RolePreference } from '@/types';
import { QUICK_PROFILE_ACTIVITIES } from '@/data/quickProfile';

const RATING_OPTIONS: { label: string; value: Rating; color: string }[] = [
  { label: 'Límite duro', value: 'hard_limit', color: colors.danger },
  { label: 'No me interesa', value: 'not_interested', color: colors.textMuted },
  { label: 'Curiosidad', value: 'curious', color: colors.warning },
  { label: 'Me gusta', value: 'like', color: colors.info },
  { label: 'Me encanta', value: 'love', color: colors.primary },
];

const ROLE_OPTIONS: { label: string; value: RolePreference }[] = [
  { label: 'Dar / Dom', value: 'give' },
  { label: 'Recibir / Sub', value: 'receive' },
  { label: 'Ambos', value: 'both' },
  { label: 'Flexible', value: 'flexible' },
];

export interface QuickProfileQuestionsStepProps {
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  responses: Record<string, ActivityResponse>;
  setRating: (rating: Rating) => void;
  setRole: (role: RolePreference) => void;
  onFinishQuestions: () => void;
}

export function QuickProfileQuestionsStep({
  currentIndex,
  setCurrentIndex,
  responses,
  setRating,
  setRole,
  onFinishQuestions,
}: QuickProfileQuestionsStepProps) {
  const currentActivity = QUICK_PROFILE_ACTIVITIES[currentIndex];
  const currentResponse = responses[currentActivity?.id];
  const isLast = currentIndex === QUICK_PROFILE_ACTIVITIES.length - 1;
  const progress = (currentIndex + 1) / QUICK_PROFILE_ACTIVITIES.length;

  return (
    <View style={styles.questionContainer}>
      <FlowBar step={1} />
      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{currentIndex + 1} / {QUICK_PROFILE_ACTIVITIES.length}</Text>
      </View>

      {/* Activity Card */}
      <View style={styles.activityCard}>
        <Text style={styles.activityCategory}>
          {currentActivity?.category?.replace('_', ' ').toUpperCase()}
        </Text>
        <Text style={styles.activityName}>{currentActivity?.name}</Text>
        <Text style={styles.activityDesc}>{currentActivity?.description}</Text>
      </View>

      {/* Rating Buttons */}
      <View style={styles.ratingGrid}>
        {RATING_OPTIONS.map((opt) => {
          const selected = currentResponse?.rating === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.ratingBtn, selected && { borderColor: opt.color, backgroundColor: `${opt.color}18` }]}
              onPress={() => setRating(opt.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.ratingLabel, selected && { color: opt.color }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Role (only for non-negative) */}
      {currentResponse?.rating !== 'hard_limit' && currentResponse?.rating !== 'not_interested' ? (
        <View style={styles.roleRow}>
          {ROLE_OPTIONS.map((r) => {
            const selected = currentResponse?.role === r.value;
            return (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleChip, selected && styles.roleChipActive]}
                onPress={() => setRole(r.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.roleChipText, selected && styles.roleChipTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}

      {/* Navigation */}
      <View style={styles.navRow}>
        {currentIndex > 0 ? (
          <TouchableOpacity
            style={styles.navBtnSecondary}
            onPress={() => setCurrentIndex((i) => i - 1)}
            activeOpacity={0.8}
          >
            <Text style={styles.navBtnSecondaryText}>← Anterior</Text>
          </TouchableOpacity>
        ) : <View style={{ flex: 1 }} />}

        {isLast ? (
          <TouchableOpacity style={styles.primaryBtnSmall} onPress={onFinishQuestions} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Siguiente →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navBtnSecondary}
            onPress={() => setCurrentIndex((i) => Math.min(i + 1, QUICK_PROFILE_ACTIVITIES.length - 1))}
            activeOpacity={0.8}
          >
            <Text style={styles.navBtnSecondaryText}>Saltar →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  questionContainer: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.xs,
  },
  activityCategory: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    letterSpacing: 1,
  },
  activityName: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
  activityDesc: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  ratingGrid: {
    gap: spacing.xs,
  },
  ratingBtn: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  ratingLabel: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  roleChip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
  },
  roleChipActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.primary,
  },
  roleChipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  roleChipTextActive: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  navBtnSecondary: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  navBtnSecondaryText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
  },
  primaryBtnSmall: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  primaryBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
});
