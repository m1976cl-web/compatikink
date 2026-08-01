import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, fontSize, spacing, typography } from '@/constants/theme';
import { Button } from '@/components/Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
  style?: ViewStyle;
}

/**
 * Quiet empty placeholder — typography-led, no emoji hero.
 */
export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  children,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.wrap, style]} accessibilityRole="summary">
      <View style={styles.rule} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {children}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button title={actionLabel} onPress={onAction} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  rule: {
    width: 48,
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.55,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodyMuted,
    textAlign: 'center',
    maxWidth: 360,
  },
  action: {
    marginTop: spacing.lg,
    minWidth: 200,
  },
});
