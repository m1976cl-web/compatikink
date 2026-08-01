import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, fontSize, spacing, typography } from '@/constants/theme';

interface AppHeaderProps {
  /** When true, shows Compatikink as the dominant brand signal */
  brand?: boolean;
  title?: string;
  subtitle?: string;
  /** Optional mark / wordmark companion (e.g. Nox) */
  mark?: string;
  right?: ReactNode;
  style?: ViewStyle;
}

export function AppHeader({
  brand = false,
  title,
  subtitle,
  mark = 'Nox',
  right,
  style,
}: AppHeaderProps) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        <View style={styles.textBlock}>
          {brand ? (
            <>
              <Text style={styles.brand} accessibilityRole="header">
                Compatikink
              </Text>
              {mark ? <Text style={styles.mark}>{mark}</Text> : null}
            </>
          ) : null}
          {title ? (
            <Text style={[styles.title, brand && styles.titleUnderBrand]} accessibilityRole="header">
              {title}
            </Text>
          ) : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      <View style={styles.rule} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: fontSize.brand,
    color: colors.text,
    letterSpacing: 1.4,
    lineHeight: 52,
  },
  mark: {
    fontFamily: fonts.displayItalic,
    fontSize: fontSize.md,
    color: colors.primary,
    letterSpacing: 2,
    marginTop: -4,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    lineHeight: 36,
  },
  titleUnderBrand: {
    fontFamily: fonts.body,
    fontSize: fontSize.lg,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMuted,
    marginTop: spacing.sm,
  },
  right: {
    paddingTop: spacing.xs,
  },
  rule: {
    marginTop: spacing.md,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
  },
});
