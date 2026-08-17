import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { Rating } from '@/types';
import { getRatingLabel } from '@/lib/localeLabels';
import { useTranslation } from '@/lib/i18n';
import { triggerLightHaptic } from '@/lib/haptics';

const RATINGS: { rating: Rating; emoji: string }[] = [
  { rating: 'love', emoji: '🔥' },
  { rating: 'like', emoji: '😊' },
  { rating: 'curious', emoji: '🤔' },
  { rating: 'not_interested', emoji: '⚪' },
  { rating: 'hard_limit', emoji: '🛑' },
];

interface Props {
  value: Rating;
  onChange: (rating: Rating) => void;
}

const RATING_COLORS: Record<Rating, { border: string; bg: string; text: string }> = {
  love: { border: '#c084fc', bg: 'rgba(192, 132, 252, 0.2)', text: '#c084fc' },
  like: { border: '#60a5fa', bg: 'rgba(96, 165, 250, 0.2)', text: '#60a5fa' },
  curious: { border: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)', text: '#fbbf24' },
  not_interested: { border: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8' },
  hard_limit: { border: '#f87171', bg: 'rgba(248, 113, 113, 0.2)', text: '#f87171' },
};

function RatingOption({
  item,
  isSelected,
  onPress,
}: {
  item: { rating: Rating; emoji: string };
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const ratingStyle = RATING_COLORS[item.rating];

  const handlePress = () => {
    triggerLightHaptic();
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.option,
          isSelected && {
            borderColor: ratingStyle.border,
            backgroundColor: ratingStyle.bg,
            borderWidth: 1.5,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <View style={styles.optionContent}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <Text
            style={[
              styles.label,
              isSelected && { color: ratingStyle.text, fontFamily: fonts.bodyBold },
            ]}
          >
            {getRatingLabel(item.rating)}
          </Text>
        </View>

        {isSelected ? (
          <View style={[styles.checkCircle, { backgroundColor: ratingStyle.border }]}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function RatingPicker({ value, onChange }: Props) {
  useTranslation();

  return (
    <View style={styles.container}>
      {RATINGS.map((item) => (
        <RatingOption
          key={item.rating}
          item={item}
          isSelected={value === item.rating}
          onPress={() => onChange(item.rating)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs + 2,
    width: '100%',
  },
  option: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: fontSize.md,
  },
  label: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: '900',
  },
});
