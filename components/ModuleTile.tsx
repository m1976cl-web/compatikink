import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, elevationSoft, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { triggerHaptic } from '@/lib/haptics';

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
  /** Stagger index for entrance animation delay */
  index?: number;
  /** Status badge text (e.g., '🚧 Beta') */
  badge?: string;
}

/**
 * Interactive module card with glassmorphism latex effect, hover glow, press scaling, and tactile haptic feedback.
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
  index = 0,
  badge,
}: ModuleTileProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(16)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Staggered entrance
  useEffect(() => {
    const delay = Math.min(index * 40, 400);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: isHovered ? 1.015 : 1,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    triggerHaptic.light();
    onPress();
  };

  const webHoverStyle = Platform.OS === 'web' && isHovered
    ? ({
        borderColor: accent || '#c084fc',
        boxShadow: `0 0 20px ${accent ? accent + '55' : 'rgba(192, 132, 252, 0.45)'}, 0 0 8px ${accent || '#c084fc'}`,
        cursor: 'pointer',
      } as any)
    : {};

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [
            { translateY: translateYAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={[
          styles.tile,
          disabled && styles.disabled,
          webHoverStyle,
          style,
        ]}
      >
        <View style={styles.row}>
          {mark ? (
            <View style={[styles.markWrap, { backgroundColor: accent + '20', borderColor: accent + '40' }]}>
              <Text style={[styles.mark, { color: accent }]}>{mark}</Text>
            </View>
          ) : null}
          <View style={styles.copy}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {badge ? <Text style={styles.badge}>{badge}</Text> : null}
            {description ? <Text style={styles.description} numberOfLines={2}>{description}</Text> : null}
            {children}
          </View>
          <Text style={[styles.chevron, { color: accent }]}>›</Text>
        </View>
      </Pressable>
    </Animated.View>
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
  badge: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    marginTop: 2,
  },
});
