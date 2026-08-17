import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { Activity, Rating, RolePreference } from '@/types';

const ROLE_OPTIONS: { label: string; value: RolePreference }[] = [
  { label: 'Dar / Dom', value: 'give' },
  { label: 'Recibir / Sub', value: 'receive' },
  { label: 'Ambos', value: 'both' },
  { label: 'Flexible', value: 'flexible' },
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
    onResponse(rating, selectedRole, selectedIntensity);
  };

  return (
    <View style={styles.card}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressText, { color: badgeColor }]}>
          {personName} · Pregunta {currentIndex + 1} de {totalCount}
        </Text>
      </View>

      <Text style={[styles.actName, { color: badgeColor }]}>{activity.name}</Text>
      <Text style={styles.actDesc}>{activity.description}</Text>

      {/* Role Picker (Dar / Recibir / Ambos / Flexible) */}
      <View style={styles.pickerSection}>
        <Text style={styles.pickerLabel}>Tu preferencia de rol:</Text>
        <View style={styles.roleGrid}>
          {ROLE_OPTIONS.map((r) => {
            const isSel = selectedRole === r.value;
            return (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleChip, isSel && styles.roleChipActive]}
                onPress={() => setSelectedRole(r.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.roleChipText, isSel && styles.roleChipTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Rating Buttons */}
      <View style={styles.ratingButtons}>
        <TouchableOpacity
          style={[styles.rBtn, { borderColor: '#4ade80' }]}
          onPress={() => handleSelectRating('love')}
          activeOpacity={0.8}
        >
          <Text style={styles.rBtnText}>🔥 Me Encanta</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rBtn, { borderColor: colors.primary }]}
          onPress={() => handleSelectRating('like')}
          activeOpacity={0.8}
        >
          <Text style={styles.rBtnText}>💜 Me Interesa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rBtn, { borderColor: '#38bdf8' }]}
          onPress={() => handleSelectRating('curious')}
          activeOpacity={0.8}
        >
          <Text style={styles.rBtnText}>🤔 Curioso/a</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rBtn, { borderColor: colors.border }]}
          onPress={() => handleSelectRating('not_interested')}
          activeOpacity={0.8}
        >
          <Text style={styles.rBtnText}>⚪ No me llama</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rBtn, { borderColor: colors.danger }]}
          onPress={() => handleSelectRating('hard_limit')}
          activeOpacity={0.8}
        >
          <Text style={styles.rBtnText}>🛑 Límite Duro</Text>
        </TouchableOpacity>
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
  progressHeader: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressText: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  actName: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
  actDesc: {
    color: colors.text,
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
  },
  roleChipActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.primary,
  },
  roleChipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: 11,
  },
  roleChipTextActive: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  ratingButtons: {
    gap: spacing.xs,
    width: '100%',
  },
  rBtn: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 12,
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
