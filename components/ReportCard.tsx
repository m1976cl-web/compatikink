import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import {
  CATEGORY_LABELS,
  RATING_LABELS,
  ReportItem,
  ROLE_LABELS,
  SECTION_LABELS,
} from '@/types';
import { ratingEmoji } from '@/lib/compatibility';

interface Props {
  item: ReportItem;
  showInitiatorOnly?: boolean;
}

export function ReportCard({ item, showInitiatorOnly = true }: Props) {
  if (item.section === 'initiator_only' && !showInitiatorOnly) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.activity}>{item.activityName}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{SECTION_LABELS[item.section]}</Text>
        </View>
      </View>
      <Text style={styles.category}>{CATEGORY_LABELS[item.category]}</Text>
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
  badgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  category: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 4,
    marginBottom: spacing.sm,
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
});
