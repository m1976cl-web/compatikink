import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radii } from '@/constants/theme';
import { getUserGamificationData, UserGamificationData, EXPLORATION_LEVELS } from '@/lib/badgesXP';

export function XPLevelWidget({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [data, setData] = useState<UserGamificationData | null>(null);

  useEffect(() => {
    getUserGamificationData().then(setData);
  }, []);

  if (!data) return null;

  const currentLevelInfo = EXPLORATION_LEVELS.find(l => l.level === data.currentLevel);
  const maxXP = currentLevelInfo ? currentLevelInfo.maxXP : 0;
  const minXP = currentLevelInfo ? currentLevelInfo.minXP : 0;
  const progressPercent = maxXP === Infinity ? 100 : ((data.totalXP - minXP) / (maxXP - minXP)) * 100;

  return (
    <TouchableOpacity style={[styles.container, compact && styles.containerCompact]} onPress={() => router.push('/trophy-room')}>
      <View style={styles.header}>
        <Text style={styles.title}>⭐ Nivel {data.currentLevel} • {data.levelTitle}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progressPercent))}%` }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  containerCompact: {
    padding: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: 14,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.backgroundMid,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});
