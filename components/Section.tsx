import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, fontSize, spacing, typography } from '@/constants/theme';

interface SectionProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  style?: ViewStyle;
  /** Optional compact eyebrow above the title */
  eyebrow?: string;
}

/**
 * One job per section: title + short support + content.
 * Not a decorative card — layout grouping only.
 */
export function Section({ title, subtitle, children, style, eyebrow }: SectionProps) {
  return (
    <View style={[styles.section, style]}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  eyebrow: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    color: colors.text,
    letterSpacing: 0.2,
    lineHeight: 30,
  },
  subtitle: {
    ...typography.bodyMuted,
    marginTop: spacing.xs,
    maxWidth: 520,
  },
  body: {
    marginTop: spacing.md,
  },
});
