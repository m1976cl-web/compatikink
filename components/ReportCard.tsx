import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import {
  CATEGORY_LABELS,
  RATING_LABELS,
  ReportItem,
  ROLE_LABELS,
  SECTION_LABELS,
  MOOD_LABELS,
} from '@/types';
import { ratingEmoji } from '@/lib/compatibility';
import { getActivityById } from '@/data/activities';

interface Props {
  item: ReportItem;
  showInitiatorOnly?: boolean;
  onPlanScene?: (item: ReportItem) => void;
  hasAgreement?: boolean;
}

export function ReportCard({ item, showInitiatorOnly = true, onPlanScene, hasAgreement }: Props) {
  if (item.section === 'initiator_only' && !showInitiatorOnly) {
    return null;
  }

  const isPlannable = item.section === 'mutual_match' || item.section === 'explore_together';
  const isHotMatch = item.section === 'mutual_match';
  const activity = getActivityById(item.activityId);

  return (
    <View style={[styles.card, isHotMatch && styles.cardMatch]}>
      <View style={styles.header}>
        <Text style={styles.activity}>{item.activityName}</Text>
        <View style={[styles.badge, isHotMatch && styles.badgeMatch]}>
          <Text style={[styles.badgeText, isHotMatch && styles.badgeTextMatch]}>
            {isHotMatch ? '🔥 ' : ''}{SECTION_LABELS[item.section]}
          </Text>
        </View>
      </View>
      <View style={styles.categoryRow}>
        <Text style={styles.category}>{CATEGORY_LABELS[item.category]}</Text>
        {activity?.moods && activity.moods.length > 0 ? (
          <View style={styles.moodsRow}>
            {activity.moods.map((m) => {
              const info = MOOD_LABELS[m];
              if (!info) return null;
              return (
                <View key={m} style={styles.moodBadge}>
                  <Text style={styles.moodBadgeText}>
                    {info.emoji} {info.label}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
      <View style={styles.row}>
        <Text style={styles.rating}>
          Tú: {ratingEmoji(item.initiatorRating)} {RATING_LABELS[item.initiatorRating]}
        </Text>
        <Text style={styles.rating}>
          Ellos: {ratingEmoji(item.guestRating)} {RATING_LABELS[item.guestRating]}
        </Text>
      </View>
      <Text style={styles.meta}>
        Roles — Tú: {ROLE_LABELS[item.initiatorRole]} · Ellos: {ROLE_LABELS[item.guestRole]}
      </Text>
      <Text style={styles.meta}>
        Intensidad — Tú: {item.initiatorIntensity} · Ellos: {item.guestIntensity}
      </Text>

      {item.conversationPrompt ? (
        <Text style={styles.prompt}>💬 {item.conversationPrompt}</Text>
      ) : null}

      {isPlannable && onPlanScene ? (
        <View style={styles.planFooter}>
          {hasAgreement ? (
            <View style={styles.agreedBadge}>
              <Text style={styles.agreedBadgeText}>✓ Escena Acordada</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.planBtn} onPress={() => onPlanScene(item)}>
            <Text style={styles.planBtnText}>
              {hasAgreement ? '📜 Ver / Editar Acuerdo' : '🤝 Planificar Escena'}
            </Text>
          </TouchableOpacity>
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
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: 'auto',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  planBtnText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
});
