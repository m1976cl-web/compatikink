import React, { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { Activity, Rating, RolePreference } from '@/types';
import { QuestionnaireProgressBar } from '@/components/QuestionnaireProgressBar';
import { triggerLightHaptic } from '@/lib/haptics';

const ROLE_OPTIONS: { label: string; value: RolePreference; emoji: string }[] = [
  { label: 'Dar / Dom', value: 'give', emoji: '🤲' },
  { label: 'Recibir / Sub', value: 'receive', emoji: '🫴' },
  { label: 'Ambos', value: 'both', emoji: '🔄' },
  { label: 'Flexible', value: 'flexible', emoji: '⚡' },
];

const RATING_BUTTONS: { rating: Rating; label: string; emoji: string; border: string; bg: string }[] = [
  { rating: 'love', label: 'Me Encanta', emoji: '🔥', border: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' },
  { rating: 'like', label: 'Me Interesa', emoji: '💜', border: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)' },
  { rating: 'curious', label: 'Curioso/a', emoji: '🤔', border: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  { rating: 'not_interested', label: 'No me llama', emoji: '⚪', border: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' },
  { rating: 'hard_limit', label: 'Límite Duro', emoji: '🛑', border: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
];

export interface PassAndPlayQuestionsStepProps {
  personName: string;
  currentIndex: number;
  totalCount: number;
  activity: Activity;
  badgeColor?: string;
  onResponse: (rating: Rating, role: RolePreference, intensity: 1 | 2 | 3 | 4 | 5) => void;
}

export function PassAndPlayQuestionsStep({
  personName,
  currentIndex,
  totalCount,
  activity,
  badgeColor = colors.primary,
  onResponse,
}: PassAndPlayQuestionsStepProps) {
  const [selectedRole, setSelectedRole] = useState<RolePreference>('flexible');
  const [selectedIntensity, setSelectedIntensity] = useState<1 | 2 | 3 | 4 | 5>(3);

  const handleSelectRating = (rating: Rating) => {
    triggerLightHaptic();
    onResponse(rating, selectedRole, selectedIntensity);
  };

  return (
    <View style={styles.card}>
      {/* Player Turn Indicator */}
      <View style={[styles.playerBanner, { borderColor: badgeColor }]}>
        <Text style={[styles.playerBannerText, { color: badgeColor }]}>
          👤 TURNO DE: <Text style={styles.playerBannerName}>{personName.toUpperCase()}</Text>
        </Text>
      </View>

      {/* Enhanced Animated Progress Bar */}
      <QuestionnaireProgressBar
        current={currentIndex + 1}
        total={totalCount}
        category={activity.category}
        accentColor={badgeColor}
        showTimeEstimate
      />

      <Text style={[styles.actName, { color: badgeColor }]}>{activity.name}</Text>
      <Text style={styles.actDesc}>{activity.description}</Text>

      {/* Role Picker (Dar / Recibir / Ambos / Flexible) */}
      <View style={styles.pickerSection}>
        <Text style={styles.pickerLabel}>Preferencia de rol para esta práctica:</Text>
        <View style={styles.roleGrid}>
          {ROLE_OPTIONS.map((r) => {
            const isSel = selectedRole === r.value;
            return (
              <TouchableOpacity
                key={r.value}
                style={[
                  styles.roleChip,
                  isSel && { borderColor: badgeColor, backgroundColor: 'rgba(192, 132, 252, 0.2)' },
                ]}
                onPress={() => setSelectedRole(r.value)}
                activeOpacity={0.8}
              >
                <Text style={styles.roleEmoji}>{r.emoji}</Text>
                <Text style={[styles.roleChipText, isSel && { color: badgeColor, fontFamily: fonts.bodyBold }]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Rating Buttons with microinteraction colors */}
      <View style={styles.ratingButtons}>
        {RATING_BUTTONS.map((btn) => (
          <TouchableOpacity
            key={btn.rating}
            style={[styles.rBtn, { borderColor: btn.border }]}
            onPress={() => handleSelectRating(btn.rating)}
            activeOpacity={0.85}
          >
            <Text style={styles.rBtnText}>
              {btn.emoji} {btn.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginVertical: spacing.md,
    gap: spacing.md,
  },
  playerBanner: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'center',
    backgroundColor: colors.surfaceLight,
  },
  playerBannerText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  playerBannerName: {
    fontFamily: fonts.bodyBold,
  },
  actName: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
  actDesc: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  pickerSection: {
    gap: 6,
  },
  pickerLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  roleGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  roleChip: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    gap: 2,
  },
  roleEmoji: {
    fontSize: 12,
  },
  roleChipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    textAlign: 'center',
  },
  ratingButtons: {
    gap: spacing.xs,
    width: '100%',
  },
  rBtn: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  rBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
});
