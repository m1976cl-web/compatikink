import { ReactNode } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, elevationSoft, fonts, fontSize, radii, spacing } from '@/constants/theme';

interface ModuleTileProps {
  title: string;
  description?: string;
  onPress: () => void;
  /** Leading mark (glyph, emoji, or letter) */
  mark?: string;
  /** Category accent color — defaults to primary purple */
  accent?: string;
  disabled?: boolean;
  style?: ViewStyle;
  children?: ReactNode;
}

/**
 * Interactive module card with glassmorphism latex effect.
 * Uses accent color for the mark badge and hover border glow.
 */
export function ModuleTile({
  title,
  description,
  onPress,
  mark,
  accent = colors.primary,
  disabled = false,
  style,
  children,
}: ModuleTileProps) {
  const webHoverStyle = Platform.OS === 'web'
    ? ({
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
        cursor: 'pointer',
      } as any)
    : {};

  return (
    <TouchableOpacity
      style={[
        styles.tile,
        webHoverStyle,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.row}>
        {mark ? (
          <View style={[styles.markWrap, { backgroundColor: accent + '20', borderColor: accent + '40' }]}>
            <Text style={[styles.mark, { color: accent }]}>{mark}</Text>
          </View>
        ) : null}
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {description ? <Text style={styles.description} numberOfLines={2}>{description}</Text> : null}
          {children}
        </View>
        <Text style={[styles.chevron, { color: accent }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: Platform.OS === 'web'
      ? 'rgba(21, 13, 36, 0.65)'
      : colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    ...elevationSoft(),
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        } as any)
      : {}),
  },
  disabled: {
    opacity: 0.45,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  markWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    color: colors.text,
    letterSpacing: 0.2,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 18,
  },
  chevron: {
    fontFamily: fonts.display,
    fontSize: 22,
    opacity: 0.7,
  },
});
