import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fontSize, spacing, fonts, radii } from '@/constants/theme';
import { GlossaryTerm, GlossaryCategory } from '@/data/glossaryData';

export const CATEGORY_COLORS: Record<GlossaryCategory, { color: string; bg: string; emoji: string }> = {
  'Consentimiento & Ética': { color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', emoji: '🤝' },
  'Seguridad & Anatomía': { color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', emoji: '🫀' },
  'Prácticas & BDSM': { color: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)', emoji: '🔥' },
  'Roles & Dinámicas': { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', emoji: '👑' },
  'No Monogamia & Vínculos': { color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', emoji: '🌿' },
};

interface Props {
  item: GlossaryTerm;
  isExpanded: boolean;
  isBookmarked: boolean;
  onToggleExpand: () => void;
  onToggleBookmark: () => void;
  onSelectRelatedTerm: (term: string) => void;
}

export function GlossaryTermCard({
  item,
  isExpanded,
  isBookmarked,
  onToggleExpand,
  onToggleBookmark,
  onSelectRelatedTerm,
}: Props) {
  const catTheme = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Prácticas & BDSM'];

  return (
    <TouchableOpacity
      style={[
        styles.termCard,
        isExpanded && { borderColor: catTheme.color, borderWidth: 1.5 },
      ]}
      onPress={onToggleExpand}
      activeOpacity={0.85}
    >
      {/* Top line of card */}
      <View style={styles.termTopRow}>
        <View style={styles.termTitleGroup}>
          <Text style={[styles.termName, isExpanded && { color: catTheme.color }]}>
            {item.term}
          </Text>
          <View style={[styles.inlineCatBadge, { backgroundColor: catTheme.bg, borderColor: catTheme.color }]}>
            <Text style={[styles.inlineCatBadgeText, { color: catTheme.color }]}>
              {catTheme.emoji} {item.category}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onToggleBookmark();
          }}
          style={styles.cardBookmarkBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.bookmarkIcon}>{isBookmarked ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      {/* Definition */}
      <Text style={styles.termDef}>{item.definition}</Text>

      {/* Expanded Extra Details */}
      {isExpanded ? (
        <View style={styles.expandedSection}>
          {item.safetyTip ? (
            <View style={styles.safetyTipCard}>
              <Text style={styles.safetyTipTitle}>⚠️ Consejo de Seguridad & Salud:</Text>
              <Text style={styles.safetyTipBody}>{item.safetyTip}</Text>
            </View>
          ) : null}

          {item.relatedTerms && item.relatedTerms.length > 0 ? (
            <View style={styles.relatedGroup}>
              <Text style={styles.relatedLabel}>Términos relacionados:</Text>
              <View style={styles.relatedChipsWrap}>
                {item.relatedTerms.map((relTerm) => (
                  <TouchableOpacity
                    key={relTerm}
                    style={styles.relatedChip}
                    onPress={(e) => {
                      e.stopPropagation();
                      onSelectRelatedTerm(relTerm);
                    }}
                  >
                    <Text style={styles.relatedChipText}>🔗 {relTerm}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.cardFooter}>
          <Text style={styles.tapToExpandText}>Toca para ver detalles y relaciones ↓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  termCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  termTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  termTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  termName: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
  },
  inlineCatBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  inlineCatBadgeText: {
    fontSize: 9,
    fontFamily: fonts.bodyBold,
  },
  cardBookmarkBtn: {
    padding: 4,
  },
  bookmarkIcon: {
    fontSize: 16,
    color: colors.primary,
  },
  termDef: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  expandedSection: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: spacing.xs,
  },
  safetyTipCard: {
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderLeftWidth: 3,
    borderLeftColor: '#f87171',
    gap: 2,
  },
  safetyTipTitle: {
    color: '#f87171',
    fontSize: 10,
    fontFamily: fonts.bodyBold,
  },
  safetyTipBody: {
    color: colors.text,
    fontSize: 10,
    fontFamily: fonts.body,
    lineHeight: 15,
  },
  relatedGroup: {
    gap: 4,
    marginTop: 2,
  },
  relatedLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: fonts.bodyBold,
  },
  relatedChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  relatedChip: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  relatedChipText: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: fonts.bodySemi,
  },
  cardFooter: {
    paddingTop: 2,
  },
  tapToExpandText: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily: fonts.body,
    opacity: 0.6,
  },
});
