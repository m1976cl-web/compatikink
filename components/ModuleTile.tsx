import { ReactNode } from 'react';
import {
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
  /** Optional leading mark (prefer typography/glyph over emoji) */
  mark?: string;
  disabled?: boolean;
  style?: ViewStyle;
  children?: ReactNode;
}

/**
 * Interactive module entry — card allowed because it is a press target.
 * Prefer mark/glyph strings over emoji as primary iconography.
 */
export function ModuleTile({
  title,
  description,
  onPress,
  mark,
  disabled = false,
  style,
  children,
}: ModuleTileProps) {
  return (
    <TouchableOpacity
      style={[styles.tile, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.row}>
        {mark ? (
          <View style={styles.markWrap}>
            <Text style={styles.mark}>{mark}</Text>
          </View>
        ) : null}
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
          {children}
        </View>
        <Text style={styles.chevron}>→</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    ...elevationSoft(),
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
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    color: colors.primary,
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
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.primary,
    opacity: 0.8,
  },
});
