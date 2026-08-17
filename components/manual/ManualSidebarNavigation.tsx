import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { MANUAL_AREAS, MANUAL_MODULES } from '@/data/manualData';

export interface ManualSidebarNavigationProps {
  selectedAreaId: string;
  showBookmarksOnly: boolean;
  bookmarkedCount: number;
  onSelectArea: (areaId: string) => void;
  onToggleShowBookmarks: () => void;
  isMobile?: boolean;
}

export function ManualSidebarNavigation({
  selectedAreaId,
  showBookmarksOnly,
  bookmarkedCount,
  onSelectArea,
  onToggleShowBookmarks,
  isMobile = false,
}: ManualSidebarNavigationProps) {
  if (isMobile) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.mobileCategoryBar}
      >
        <TouchableOpacity
          style={[
            styles.mobileChip,
            selectedAreaId === 'all' && !showBookmarksOnly && styles.mobileChipActive,
          ]}
          onPress={() => onSelectArea('all')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.mobileChipText,
              selectedAreaId === 'all' && !showBookmarksOnly && styles.mobileChipTextActive,
            ]}
          >
            📚 Todas ({MANUAL_MODULES.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.mobileChip,
            showBookmarksOnly && styles.mobileChipActive,
          ]}
          onPress={onToggleShowBookmarks}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.mobileChipText,
              showBookmarksOnly && styles.mobileChipTextActive,
            ]}
          >
            ⭐ Marcadores ({bookmarkedCount})
          </Text>
        </TouchableOpacity>

        {MANUAL_AREAS.map((area) => {
          const isActive = selectedAreaId === area.id && !showBookmarksOnly;
          return (
            <TouchableOpacity
              key={area.id}
              style={[
                styles.mobileChip,
                isActive && styles.mobileChipActive,
              ]}
              onPress={() => onSelectArea(area.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.mobileChipText,
                  isActive && styles.mobileChipTextActive,
                ]}
              >
                {area.icon} {area.title.split(':')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <>
      <Text style={styles.sectionHeaderLabel}>Categorías Principales</Text>
      <ScrollView
        style={styles.sidebarCategoryScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Category "Marcadores" */}
        <TouchableOpacity
          style={[
            styles.sidebarCategoryItem,
            showBookmarksOnly && styles.sidebarCategoryItemActive,
          ]}
          onPress={onToggleShowBookmarks}
          activeOpacity={0.7}
        >
          <Text style={styles.categoryEmoji}>⭐</Text>
          <Text
            style={[
              styles.categoryName,
              showBookmarksOnly && styles.categoryNameActive,
            ]}
          >
            Mis Marcadores ({bookmarkedCount})
          </Text>
        </TouchableOpacity>

        {/* Category "Todas" */}
        <TouchableOpacity
          style={[
            styles.sidebarCategoryItem,
            !showBookmarksOnly && selectedAreaId === 'all' && styles.sidebarCategoryItemActive,
          ]}
          onPress={() => onSelectArea('all')}
          activeOpacity={0.7}
        >
          <Text style={styles.categoryEmoji}>📚</Text>
          <Text
            style={[
              styles.categoryName,
              !showBookmarksOnly && selectedAreaId === 'all' && styles.categoryNameActive,
            ]}
          >
            Todas las Áreas
          </Text>
          <View
            style={[
              styles.countBadge,
              !showBookmarksOnly && selectedAreaId === 'all' && styles.countBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.countBadgeText,
                !showBookmarksOnly && selectedAreaId === 'all' && styles.countBadgeTextActive,
              ]}
            >
              {MANUAL_MODULES.length}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Categories from MANUAL_AREAS */}
        {MANUAL_AREAS.map((area) => {
          const isActive = !showBookmarksOnly && selectedAreaId === area.id;
          const count = area.moduleIds.length;
          return (
            <TouchableOpacity
              key={area.id}
              style={[
                styles.sidebarCategoryItem,
                isActive && styles.sidebarCategoryItemActive,
              ]}
              onPress={() => onSelectArea(area.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryEmoji}>{area.icon}</Text>
              <Text
                style={[
                  styles.categoryName,
                  isActive && styles.categoryNameActive,
                ]}
                numberOfLines={2}
              >
                {area.title}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  isActive && styles.countBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    isActive && styles.countBadgeTextActive,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeaderLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sidebarCategoryScroll: {
    maxHeight: 450,
  },
  sidebarCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    gap: spacing.sm,
    marginBottom: 4,
  },
  sidebarCategoryItemActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryName: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    flex: 1,
  },
  categoryNameActive: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  countBadge: {
    backgroundColor: colors.surface,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  countBadgeActive: {
    backgroundColor: colors.primary,
  },
  countBadgeText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  countBadgeTextActive: {
    color: colors.text,
  },
  mobileCategoryBar: {
    marginBottom: spacing.md,
  },
  mobileChip: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  mobileChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mobileChipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  mobileChipTextActive: {
    color: colors.text,
  },
});
