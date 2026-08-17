import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fontSize, spacing, fonts, radii, glowShadowPrimary } from '@/constants/theme';
import { CommunityGroup, COMMUNITY_CATEGORY_LABELS } from '@/data/communitiesData';

interface Props {
  group: CommunityGroup;
  isJoined: boolean;
  onToggleJoin: () => void;
  onEnter: () => void;
}

export function CommunityDirectoryCard({
  group,
  isJoined,
  onToggleJoin,
  onEnter,
}: Props) {
  const catInfo = COMMUNITY_CATEGORY_LABELS[group.category];

  return (
    <View style={styles.groupCard}>
      {/* Top Row: Emoji, Name, Member Count & Join Button */}
      <View style={styles.groupHeaderRow}>
        <Text style={styles.groupEmoji}>{group.emoji}</Text>
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <View style={[styles.groupCatPill, { backgroundColor: `${catInfo.color}18`, borderColor: catInfo.color }]}>
              <Text style={[styles.groupCatPillText, { color: catInfo.color }]}>
                {catInfo.emoji} {catInfo.label}
              </Text>
            </View>
            <Text style={styles.groupStatsText}>👥 {group.memberCount} miembros</Text>
          </View>
          <Text style={styles.groupName}>{group.name}</Text>
        </View>

        <TouchableOpacity
          style={[styles.joinBtn, isJoined && styles.joinBtnActive]}
          onPress={onToggleJoin}
          activeOpacity={0.8}
        >
          <Text style={[styles.joinBtnText, isJoined && styles.joinBtnTextActive]}>
            {isJoined ? 'Siguiendo ✓' : 'Seguir +'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <Text style={styles.groupDesc}>{group.description}</Text>

      {/* Tags */}
      <View style={styles.tagsRow}>
        {group.tags.map((tag, idx) => (
          <View key={idx} style={styles.tagChip}>
            <Text style={styles.tagChipText}>#{tag}</Text>
          </View>
        ))}
      </View>

      {/* Enter Forum Action */}
      <TouchableOpacity
        style={styles.enterForumBtn}
        onPress={onEnter}
        activeOpacity={0.85}
      >
        <Text style={styles.enterForumBtnText}>
          Explorar Foros y Debates ({group.topics.length} temas) 💬 →
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    ...glowShadowPrimary,
  },
  groupHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  groupEmoji: { fontSize: 32 },
  groupCatPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  groupCatPillText: { fontSize: 9, fontFamily: fonts.bodyBold },
  groupStatsText: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.body },
  groupName: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.md },
  groupDesc: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSize.xs, lineHeight: 18 },

  joinBtn: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.md },
  joinBtnActive: { backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  joinBtnText: { color: '#000', fontSize: 11, fontFamily: fonts.bodyBold },
  joinBtnTextActive: { color: colors.textMuted },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tagChip: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagChipText: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.mono },

  enterForumBtn: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 10,
    borderRadius: radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 2,
  },
  enterForumBtnText: { color: colors.primary, fontSize: fontSize.xs, fontFamily: fonts.bodyBold },
});
