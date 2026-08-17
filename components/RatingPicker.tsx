import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import { Rating } from '@/types';
import { getRatingLabel } from '@/lib/localeLabels';
import { useTranslation } from '@/lib/i18n';

const RATINGS: Rating[] = ['love', 'like', 'curious', 'not_interested', 'hard_limit'];

interface Props {
  value: Rating;
  onChange: (rating: Rating) => void;
}

const RATING_COLORS: Record<Rating, string> = {
  love: '#c084fc',
  like: '#60a5fa',
  curious: '#fbbf24',
  not_interested: '#94a3b8',
  hard_limit: '#f87171',
};

export function RatingPicker({ value, onChange }: Props) {
  useTranslation();
  return (
    <View style={styles.container}>
      {RATINGS.map((rating) => {
        const isSelected = value === rating;
        const color = RATING_COLORS[rating];
        return (
          <TouchableOpacity
            key={rating}
            style={[
              styles.option,
              isSelected && { borderColor: color, backgroundColor: `${color}15` },
            ]}
            onPress={() => onChange(rating)}
          >
            <Text
              style={[
                styles.label,
                isSelected && { color, fontWeight: '700' },
              ]}
            >
              {getRatingLabel(rating)}
            </Text>
          </TouchableOpacity>
        );
      })}
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
  label: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});
