import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import { ExperienceLevel, EXPERIENCE_LABELS } from '@/types';

const LEVELS: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];

interface Props {
  value?: ExperienceLevel;
  onChange: (level: ExperienceLevel) => void;
}

export function ExperiencePicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {LEVELS.map((level) => (
        <TouchableOpacity
          key={level}
          style={[styles.chip, value === level && styles.chipSelected]}
          onPress={() => onChange(level)}
          activeOpacity={0.8}
        >
          <Text style={[styles.text, value === level && styles.textSelected]}>
            {EXPERIENCE_LABELS[level]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  text: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  textSelected: {
    color: colors.text,
    fontWeight: '600',
  },
});
