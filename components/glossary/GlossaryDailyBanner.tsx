import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fontSize, spacing, fonts, radii, glowShadowPrimary } from '@/constants/theme';
import { GlossaryTerm } from '@/data/glossaryData';
import { CATEGORY_COLORS } from './GlossaryTermCard';

interface Props {
  dailyTerm: GlossaryTerm;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onOpenQuiz: () => void;
}

export function GlossaryDailyBanner({
  dailyTerm,
  isBookmarked,
  onToggleBookmark,
  onOpenQuiz,
}: Props) {
  const catTheme = CATEGORY_COLORS[dailyTerm.category] || CATEGORY_COLORS['Prácticas & BDSM'];

  return (
    <View style={styles.dailyCard}>
      <View style={styles.dailyHeader}>
        <View style={styles.dailyBadge}>
          <Text style={styles.dailyBadgeText}>🌟 TÉRMINO DEL DÍA</Text>
        </View>

        <TouchableOpacity
          onPress={onToggleBookmark}
          style={styles.dailyBookmarkBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.bookmarkIcon}>{isBookmarked ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dailyTitleRow}>
        <Text style={styles.dailyTermName}>{dailyTerm.term}</Text>
        <View style={[styles.dailyCatBadge, { backgroundColor: catTheme.bg, borderColor: catTheme.color }]}>
          <Text style={[styles.dailyCatBadgeText, { color: catTheme.color }]}>
            {catTheme.emoji} {dailyTerm.category}
          </Text>
        </View>
      </View>

      <Text style={styles.dailyDefText}>{dailyTerm.definition}</Text>

      {dailyTerm.safetyTip ? (
        <View style={styles.dailySafetyBox}>
          <Text style={styles.dailySafetyTitle}>💡 Nota de Seguridad & Consentimiento:</Text>
          <Text style={styles.dailySafetyText}>{dailyTerm.safetyTip}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.quizCtaBtn}
        onPress={onOpenQuiz}
        activeOpacity={0.85}
      >
        <Text style={styles.quizCtaBtnText}>🧠 Probar mis conocimientos (Mini-Quiz) →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  dailyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginVertical: spacing.xs,
    gap: spacing.xs,
    ...glowShadowPrimary,
  },
  dailyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyBadge: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dailyBadgeText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  dailyBookmarkBtn: {
    padding: 4,
  },
  bookmarkIcon: {
    fontSize: 16,
    color: colors.primary,
  },
  dailyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  dailyTermName: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
  },
  dailyCatBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  dailyCatBadgeText: {
    fontSize: 9,
    fontFamily: fonts.bodyBold,
  },
  dailyDefText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  dailySafetyBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radii.md,
    padding: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    gap: 2,
  },
  dailySafetyTitle: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: fonts.bodyBold,
  },
  dailySafetyText: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: fonts.body,
    lineHeight: 15,
  },
  quizCtaBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: 2,
  },
  quizCtaBtnText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
});
