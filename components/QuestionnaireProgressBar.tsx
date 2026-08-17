import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Platform } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { ActivityCategory } from '@/types';
import { getCategoryLabel } from '@/data/activities';

export interface QuestionnaireProgressBarProps {
  current: number;
  total: number;
  category?: ActivityCategory;
  showTimeEstimate?: boolean;
  accentColor?: string;
}

const CATEGORY_THEME: Record<string, { color: string; emoji: string; bg: string }> = {
  power_exchange: { color: '#c084fc', emoji: '👑', bg: 'rgba(192, 132, 252, 0.15)' },
  bondage: { color: '#f87171', emoji: '🪢', bg: 'rgba(248, 113, 113, 0.15)' },
  impact: { color: '#fb923c', emoji: '⚡', bg: 'rgba(251, 146, 60, 0.15)' },
  sensation: { color: '#38bdf8', emoji: '🧊', bg: 'rgba(56, 189, 248, 0.15)' },
  psychological: { color: '#a78bfa', emoji: '🧠', bg: 'rgba(167, 139, 250, 0.15)' },
  service: { color: '#34d399', emoji: '🍵', bg: 'rgba(52, 211, 153, 0.15)' },
  exhibition: { color: '#f472b6', emoji: '🎭', bg: 'rgba(244, 114, 182, 0.15)' },
  intimacy: { color: '#fbbf24', emoji: '🕯️', bg: 'rgba(251, 191, 36, 0.15)' },
  aftercare: { color: '#4ade80', emoji: '🪷', bg: 'rgba(74, 222, 128, 0.15)' },
  roleplay: { color: '#e879f9', emoji: '🔮', bg: 'rgba(232, 121, 249, 0.15)' },
  toys_gear: { color: '#f43f5e', emoji: '🧰', bg: 'rgba(244, 63, 94, 0.15)' },
  lifestyle: { color: '#2dd4bf', emoji: '🗝️', bg: 'rgba(45, 212, 191, 0.15)' },
};

export function QuestionnaireProgressBar({
  current,
  total,
  category,
  showTimeEstimate = true,
  accentColor = colors.primary,
}: QuestionnaireProgressBarProps) {
  const safeTotal = Math.max(1, total);
  const clampedCurrent = Math.min(Math.max(1, current), safeTotal);
  const progressRatio = clampedCurrent / safeTotal;

  const animatedWidth = useRef(new Animated.Value(progressRatio)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progressRatio,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [progressRatio]);

  const catTheme = category ? (CATEGORY_THEME[category] || { color: accentColor, emoji: '✨', bg: 'rgba(192, 132, 252, 0.15)' }) : null;
  const remainingCount = safeTotal - clampedCurrent;
  const estimatedMins = Math.max(1, Math.ceil(remainingCount * 0.2));

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Top Header info */}
      <View style={styles.headerRow}>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>
            Pregunta <Text style={styles.counterHighlight}>{clampedCurrent}</Text> de {safeTotal}
          </Text>
        </View>

        {catTheme && category ? (
          <View style={[styles.catBadge, { backgroundColor: catTheme.bg, borderColor: catTheme.color }]}>
            <Text style={[styles.catBadgeText, { color: catTheme.color }]}>
              {catTheme.emoji} {getCategoryLabel(category)}
            </Text>
          </View>
        ) : null}

        {showTimeEstimate && remainingCount > 0 ? (
          <Text style={styles.timeEstimateText}>~{estimatedMins} min</Text>
        ) : null}
      </View>

      {/* Progress Track */}
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthInterpolated,
              backgroundColor: catTheme?.color || accentColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: spacing.xs,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  counterHighlight: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
  },
  catBadge: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeEstimateText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 11,
  },
  track: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
