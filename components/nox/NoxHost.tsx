import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import {
  getNoxScene,
  isNoxSceneId,
  type NoxSceneId,
} from '@/components/nox/scenes';

const NOX_IMAGES: Record<NoxSceneId, ImageSourcePropType> = {
  landing: require('@/assets/nox/nox-landing.webp'),
  onboarding: require('@/assets/nox/nox-onboarding.webp'),
  home: require('@/assets/nox/nox-home.webp'),
  auth: require('@/assets/nox/nox-auth.webp'),
  questionnaire: require('@/assets/nox/nox-questionnaire.webp'),
  invite: require('@/assets/nox/nox-invite.webp'),
  guest: require('@/assets/nox/nox-guest.webp'),
  report: require('@/assets/nox/nox-report.webp'),
  manual: require('@/assets/nox/nox-manual.webp'),
  share: require('@/assets/nox/nox-share.webp'),
  privacy: require('@/assets/nox/nox-privacy.webp'),
};

export type NoxHostVariant = 'hero' | 'banner' | 'compact' | 'inline';

const VARIANT_SIZE: Record<NoxHostVariant, number> = {
  hero: 220,
  banner: 152,
  compact: 108,
  inline: 72,
};

export interface NoxHostProps {
  scene: NoxSceneId;
  variant?: NoxHostVariant;
  /** Override caption, or `false` to hide it. */
  caption?: string | false;
  showName?: boolean;
  style?: ViewStyle;
}

export function NoxHost({
  scene,
  variant = 'banner',
  caption,
  showName = true,
  style,
}: NoxHostProps) {
  const resolvedScene: NoxSceneId = isNoxSceneId(scene) ? scene : 'landing';
  const meta = getNoxScene(resolvedScene);
  const size = VARIANT_SIZE[variant];
  const showCaption = caption !== false;
  const captionText = typeof caption === 'string' ? caption : meta.caption;
  const radius = variant === 'inline' ? size / 2 : radii.xl;

  return (
    <View
      style={[styles.wrap, variant === 'inline' && styles.wrapInline, style]}
      accessibilityRole="image"
      accessibilityLabel={meta.a11y}
    >
      <View
        style={[
          styles.frame,
          {
            width: size,
            height: size,
            borderRadius: radius,
          },
        ]}
      >
        <Image
          source={NOX_IMAGES[resolvedScene]}
          style={[styles.image, { width: size, height: size, borderRadius: radius }]}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>
      {showName || showCaption ? (
        <View style={styles.copy}>
          {showName ? <Text style={styles.name}>Nox</Text> : null}
          {showCaption ? <Text style={styles.caption}>{captionText}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  wrapInline: {
    marginBottom: spacing.sm,
  },
  frame: {
    backgroundColor: '#0a0612',
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.45)',
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowRadius: 16,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 0 },
  },
  image: {
    backgroundColor: '#07050a',
  },
  copy: {
    alignItems: 'center',
    gap: 2,
    maxWidth: 420,
    paddingHorizontal: spacing.sm,
  },
  name: {
    color: colors.primary,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  caption: {
    color: colors.textMuted,
    fontFamily: fonts.displayItalic,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
