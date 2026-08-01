import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  accent?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  icon,
  accent = colors.primary,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backBtn}
        activeOpacity={0.7}
      >
        <Text style={[styles.backArrow, { color: accent }]}>←</Text>
        <Text style={[styles.backLabel, { color: accent }]}>Dashboard</Text>
      </TouchableOpacity>
      <View style={styles.titleRow}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={[styles.accentLine, { backgroundColor: accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(7, 5, 10, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 4,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    marginBottom: 2,
  },
  backArrow: {
    fontSize: 18,
    fontWeight: '700',
  },
  backLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    letterSpacing: 0.3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl + 2,
    color: colors.text,
    letterSpacing: 0.2,
    flex: 1,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 18,
    maxWidth: 540,
  },
  accentLine: {
    height: 2,
    borderRadius: 1,
    marginTop: spacing.xs,
    opacity: 0.6,
  },
});
