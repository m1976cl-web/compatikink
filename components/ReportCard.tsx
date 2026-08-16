import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import { ReportItem, MOOD_LABELS } from '@/types';
import { ratingEmoji } from '@/lib/compatibility';
import { getActivityById, getActivityTalkTip, getCategoryLabel } from '@/data/activities';
import {
  getConversationPrompt,
  getMoodLabel,
  getRatingLabel,
  getRoleLabel,
  getSectionLabel,
} from '@/lib/localeLabels';
import { useTranslation } from '@/lib/i18n';

interface Props {
  item: ReportItem;
  showInitiatorOnly?: boolean;
  onPlanScene?: (item: ReportItem) => void;
  hasAgreement?: boolean;
  onToggleWishlist?: (item: ReportItem) => void;
  isWishlisted?: boolean;
}

export function ReportCard({
  item,
  showInitiatorOnly = true,
  onPlanScene,
  hasAgreement,
  onToggleWishlist,
  isWishlisted,
}: Props) {
  if (item.section === 'initiator_only' && !showInitiatorOnly) {
    return null;
  }

  const { t } = useTranslation();
  const isPlannable = item.section === 'mutual_match' || item.section === 'explore_together';
  const isHotMatch = item.section === 'mutual_match';
  const activity = getActivityById(item.activityId);
  const talkTip = activity ? getActivityTalkTip(activity) : undefined;
  const prompt = getConversationPrompt(item.section, item.activityName) || item.conversationPrompt;

  return (
    <View style={[styles.card, isHotMatch && styles.cardMatch]}>
      <View style={styles.header}>
        <Text style={styles.activity}>{item.activityName}</Text>
        <View style={[styles.badge, isHotMatch && styles.badgeMatch]}>
          <Text style={[styles.badgeText, isHotMatch && styles.badgeTextMatch]}>
            {isHotMatch ? '🔥 ' : ''}{getSectionLabel(item.section)}
          </Text>
        </View>
      </View>
      <View style={styles.categoryRow}>
        <Text style={styles.category}>{getCategoryLabel(item.category)}</Text>
        {activity?.moods && activity.moods.length > 0 ? (
          <View style={styles.moodsRow}>
            {activity.moods.map((m) => {
              const info = MOOD_LABELS[m];
              if (!info) return null;
              return (
                <View key={m} style={styles.moodBadge}>
                  <Text style={styles.moodBadgeText}>
                    {info.emoji} {getMoodLabel(m)}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
      <View style={styles.row}>
        <Text style={styles.rating}>
          {t('common.you')}: {ratingEmoji(item.initiatorRating)} {getRatingLabel(item.initiatorRating)}
        </Text>
        <Text style={styles.rating}>
          {t('common.them')}: {ratingEmoji(item.guestRating)} {getRatingLabel(item.guestRating)}
        </Text>
      </View>
      <Text style={styles.meta}>
        {t('common.roles')} — {t('common.you')}: {getRoleLabel(item.initiatorRole)} · {t('common.them')}: {getRoleLabel(item.guestRole)}
      </Text>
      <Text style={styles.meta}>
        {t('common.intensity')} — {t('common.you')}: {item.initiatorIntensity} · {t('common.them')}: {item.guestIntensity}
      </Text>

      {prompt ? <Text style={styles.prompt}>💬 {prompt}</Text> : null}
      {talkTip ? <Text style={styles.prompt}>🧭 {talkTip}</Text> : null}

      {isPlannable || onToggleWishlist ? (
        <View style={styles.planFooter}>
          {hasAgreement ? (
            <View style={styles.agreedBadge}>
              <Text style={styles.agreedBadgeText}>✓ Escena Acordada</Text>
            </View>
          ) : null}

          {onToggleWishlist ? (
            <TouchableOpacity
              style={[styles.wishlistBtn, isWishlisted && styles.wishlistBtnActive]}
              onPress={() => onToggleWishlist(item)}
            >
              <Text style={[styles.wishlistBtnText, isWishlisted && styles.wishlistBtnTextActive]}>
                {isWishlisted ? '💌 En Wishlist' : '🤍 Deseo'}
              </Text>
            </TouchableOpacity>
          ) : null}

          {isPlannable && onPlanScene ? (
            <TouchableOpacity style={styles.planBtn} onPress={() => onPlanScene(item)}>
              <Text style={styles.planBtnText}>
                {hasAgreement ? '📜 Ver / Editar' : '🤝 Planificar'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardMatch: {
    borderColor: 'rgba(192, 132, 252, 0.5)',
    backgroundColor: 'rgba(192, 132, 252, 0.06)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  activity: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeMatch: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.4)',
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextMatch: {
    color: colors.neonPurple,
    fontWeight: '700',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  category: {
    color: colors.neonCyan,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  moodsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  moodBadge: {
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  moodBadgeText: {
    color: colors.neonPurple,
    fontSize: 10,
    fontWeight: '600',
  },
  row: {
    gap: 4,
    marginBottom: spacing.sm,
  },
  rating: {
    color: colors.text,
    fontSize: fontSize.sm,
  },
  meta: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  prompt: {
    color: colors.info,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  planFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  agreedBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.success,
  },
  agreedBadgeText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  planBtn: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  planBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  wishlistBtn: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  wishlistBtnActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(244, 114, 182, 0.15)',
  },
  wishlistBtnText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  wishlistBtnTextActive: {
    color: colors.accent,
  },
});
