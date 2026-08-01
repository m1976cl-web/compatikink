import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fonts, fontSize, spacing, radii } from '@/constants/theme';

export interface CategoryTab {
  key: string;
  label: string;
  icon: string;
  accent: string;
}

interface CategoryTabsProps {
  tabs: CategoryTab[];
  activeKey: string;
  onTabChange: (key: string) => void;
}

export function CategoryTabs({ tabs, activeKey, onTabChange }: CategoryTabsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                isActive && styles.tabActive,
                isActive && { borderBottomColor: tab.accent },
              ]}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text
                style={[
                  styles.tabLabel,
                  isActive && { color: tab.accent, fontFamily: fonts.bodySemi },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    ...(Platform.OS === 'web'
      ? ({
          position: 'sticky' as any,
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
    backgroundColor:
      Platform.OS === 'web'
        ? 'rgba(7, 5, 10, 0.85)'
        : colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  scrollContent: {
    gap: 2,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
    borderRadius: radii.sm,
  },
  tabActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
});
