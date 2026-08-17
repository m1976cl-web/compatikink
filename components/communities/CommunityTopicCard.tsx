import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fontSize, spacing, fonts, radii } from '@/constants/theme';
import { CommunityTopic } from '@/data/communitiesData';

interface Props {
  topic: CommunityTopic;
  isLiked: boolean;
  onSelect: () => void;
  onToggleLike: () => void;
  onReport: () => void;
}

export function CommunityTopicCard({
  topic,
  isLiked,
  onSelect,
  onToggleLike,
  onReport,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.topicCard, topic.isPinned && styles.topicCardPinned]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      {/* Pinned Tag */}
      {topic.isPinned && (
        <View style={styles.pinnedPill}>
          <Text style={styles.pinnedPillText}>📌 TEMA DESTACADO / GUÍA OFICIAL</Text>
        </View>
      )}

      {/* Title & Author Row */}
      <View style={styles.topicHeader}>
        <Text style={styles.topicCardTitle}>{topic.title}</Text>
        <View style={styles.topicAuthorRow}>
          <Text style={{ fontSize: 13 }}>{topic.authorEmoji || '👤'}</Text>
          <Text style={styles.topicAuthorText}>{topic.author}</Text>
          {topic.authorRole && (
            <View style={styles.authorRoleBadge}>
              <Text style={styles.authorRoleBadgeText}>{topic.authorRole}</Text>
            </View>
          )}
          <Text style={styles.topicTimeText}>· {topic.timeAgo}</Text>
        </View>
      </View>

      {/* Content Preview */}
      <Text style={styles.topicContentPreview} numberOfLines={3}>
        {topic.content}
      </Text>

      {/* Tags */}
      <View style={styles.tagsRow}>
        {topic.tags.map((t, idx) => (
          <View key={idx} style={styles.tagChip}>
            <Text style={styles.tagChipText}>#{t}</Text>
          </View>
        ))}
      </View>

      {/* Footer: Replies & Likes */}
      <View style={styles.topicCardFooter}>
        <View style={styles.repliesPill}>
          <Text style={styles.repliesPillText}>💬 {topic.repliesCount || 0} aportes</Text>
        </View>

        <TouchableOpacity
          style={[styles.likePill, isLiked && styles.likePillActive]}
          onPress={(e) => {
            e.stopPropagation?.();
            onToggleLike();
          }}
        >
          <Text style={[styles.likePillText, isLiked && { color: '#f43f5e' }]}>
            {isLiked ? '❤️' : '🤍'} {topic.likes + (isLiked ? 1 : 0)}
          </Text>
        </TouchableOpacity>

        {/* Trust & Safety Action */}
        <TouchableOpacity
          style={styles.topicSafetyBtn}
          onPress={(e) => {
            e.stopPropagation?.();
            onReport();
          }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={{ fontSize: 12 }}>🚩</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  topicCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  topicCardPinned: {
    borderColor: 'rgba(192, 132, 252, 0.5)',
    backgroundColor: 'rgba(192, 132, 252, 0.05)',
  },
  pinnedPill: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  pinnedPillText: { color: colors.primary, fontSize: 9, fontFamily: fonts.bodyBold },
  topicHeader: { gap: 4 },
  topicCardTitle: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.sm },
  topicAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  topicAuthorText: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 11 },
  authorRoleBadge: { backgroundColor: colors.surfaceLight, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  authorRoleBadgeText: { color: colors.textMuted, fontSize: 9, fontFamily: fonts.bodySemi },
  topicTimeText: { color: colors.textMuted, fontSize: 10 },
  topicContentPreview: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSize.xs, lineHeight: 18 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tagChip: { backgroundColor: colors.surfaceLight, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  tagChipText: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.mono },
  topicCardFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  repliesPill: { backgroundColor: colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.sm },
  repliesPillText: { color: colors.text, fontSize: 10, fontFamily: fonts.bodyBold },
  likePill: { backgroundColor: colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.sm },
  likePillActive: { backgroundColor: 'rgba(244, 63, 94, 0.15)', borderWidth: 1, borderColor: '#f43f5e' },
  likePillText: { fontSize: 10, fontFamily: fonts.bodySemi, color: colors.textMuted },
  topicSafetyBtn: { padding: 4, marginLeft: 'auto' },
});
