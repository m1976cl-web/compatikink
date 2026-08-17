import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { ActivityMood, MOOD_LABELS } from '@/types';

export interface ReportMoodFilterProps {
  selectedMood: 'all' | ActivityMood;
  onSelectMood: (mood: 'all' | ActivityMood) => void;
}

export function ReportMoodFilter({ selectedMood, onSelectMood }: ReportMoodFilterProps) {
  return (
    <View style={styles.moodFilterContainer}>
      <Text style={styles.moodFilterTitle}>🎛️ Filtrar por Ambiente / Mood:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodFilterChips}>
        <TouchableOpacity
          style={[styles.moodChip, selectedMood === 'all' && styles.moodChipActive]}
          onPress={() => onSelectMood('all')}
          activeOpacity={0.8}
        >
          <Text style={[styles.moodChipText, selectedMood === 'all' && styles.moodChipTextActive]}>
            🌟 Todos los Ambientes
          </Text>
        </TouchableOpacity>

        {(Object.keys(MOOD_LABELS) as ActivityMood[]).map((mKey) => {
          const info = MOOD_LABELS[mKey];
          const isActive = selectedMood === mKey;
          return (
            <TouchableOpacity
              key={mKey}
              style={[styles.moodChip, isActive && styles.moodChipActive]}
              onPress={() => onSelectMood(isActive ? 'all' : mKey)}
              activeOpacity={0.8}
            >
              <Text style={[styles.moodChipText, isActive && styles.moodChipTextActive]}>
                {info.emoji} {info.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  moodFilterContainer: {
    marginBottom: spacing.lg,
  },
  moodFilterTitle: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  moodFilterChips: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: 4,
  },
  moodChip: {
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moodChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
  },
  moodChipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  moodChipTextActive: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
});
