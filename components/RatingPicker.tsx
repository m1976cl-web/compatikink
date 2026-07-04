import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import { Rating, RATING_LABELS } from '@/types';

const RATINGS: Rating[] = ['hard_limit', 'not_interested', 'curious', 'like', 'love'];

interface Props {
  value: Rating;
  onChange: (rating: Rating) => void;
}

export function RatingPicker({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {RATINGS.map((rating) => (
        <TouchableOpacity
          key={rating}
          style={[styles.option, value === rating && styles.optionSelected]}
          onPress={() => onChange(rating)}
        >
          <Text style={[styles.label, value === rating && styles.labelSelected]}>
            {RATING_LABELS[rating]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  option: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  labelSelected: {
    color: colors.text,
    fontWeight: '600',
  },
});
