import { Platform, TextStyle, ViewStyle } from 'react-native';

/**
 * Compatikink design tokens — noir íntimo
 * Ink depth + copper accent. Not purple-neon AI, not cream/terracotta broadsheet.
 */

export const BREAKPOINTS = {
  desktop: 768,
  tablet: 600,
};

/** Ink / copper palette */
export const colors = {
  // Depth layers (ink)
  background: '#0c0a09',
  backgroundMid: '#14110f',
  backgroundAlt: '#1a1612',
  surface: '#1c1814',
  surfaceLight: '#2a241e',
  surfaceElevated: '#322b24',
  border: '#3d342c',
  borderSubtle: 'rgba(201, 160, 106, 0.18)',

  // Brand accent — copper / amber (contained)
  primary: '#c9a06a',
  primaryDark: '#a67c4a',
  primaryLight: '#e8d4b0',
  accent: '#9a6b4f',
  accentSoft: 'rgba(201, 160, 106, 0.12)',

  // Functional
  success: '#6b9b7a',
  warning: '#d4a84b',
  danger: '#c45c5c',
  info: '#5a8a8a',

  // Text
  text: '#f2ebe3',
  textMuted: '#a89f94',
  textDim: '#6e655c',
  onPrimary: '#0c0a09',

  // Legacy aliases (screens not yet migrated) — map neon → copper/teal family
  neonPurple: '#c9a06a',
  neonPink: '#9a6b4f',
  neonCyan: '#5a8a8a',
  neonGreen: '#6b9b7a',
  glowPurple: 'rgba(201, 160, 106, 0.28)',
  glowPink: 'rgba(154, 107, 79, 0.28)',
};

/** Soft ink gradient stops for shell / ScreenContainer */
export const gradients = {
  ink: ['#0c0a09', '#161210', '#1a1410'] as const,
  inkRadialHint: 'radial-gradient(ellipse 120% 80% at 50% -20%, rgba(201,160,106,0.08) 0%, transparent 55%), linear-gradient(165deg, #0c0a09 0%, #14110f 45%, #1a1410 100%)',
  surfaceWash: 'linear-gradient(180deg, rgba(28,24,20,0.92) 0%, rgba(20,17,15,0.98) 100%)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 24,
  xxl: 32,
  hero: 40,
  brand: 48,
};

/**
 * Font families — loaded via expo-font in app/_layout.tsx
 * Display: Cormorant Garamond (intimate serif)
 * Body: Source Sans 3 (expressive, not Inter/system)
 */
export const fonts = {
  display: 'CormorantGaramond_700Bold',
  displaySemi: 'CormorantGaramond_600SemiBold',
  displayRegular: 'CormorantGaramond_400Regular',
  displayItalic: 'CormorantGaramond_400Regular_Italic',
  body: 'SourceSans3_400Regular',
  bodyMedium: 'SourceSans3_500Medium',
  bodySemi: 'SourceSans3_600SemiBold',
  bodyBold: 'SourceSans3_700Bold',
};

export const typography = {
  brand: {
    fontFamily: fonts.display,
    fontSize: fontSize.brand,
    letterSpacing: 1.2,
    color: colors.text,
  } as TextStyle,
  hero: {
    fontFamily: fonts.display,
    fontSize: fontSize.hero,
    letterSpacing: 0.4,
    color: colors.text,
  } as TextStyle,
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xxl,
    letterSpacing: 0.3,
    color: colors.text,
  } as TextStyle,
  section: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    letterSpacing: 0.2,
    color: colors.text,
  } as TextStyle,
  body: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    lineHeight: 22,
    color: colors.text,
  } as TextStyle,
  bodyMuted: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    lineHeight: 22,
    color: colors.textMuted,
  } as TextStyle,
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textMuted,
  } as TextStyle,
  button: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    letterSpacing: 0.3,
  } as TextStyle,
};

/** Soft copper ambient — depth, not neon glow */
export const glowShadowPrimary = (intensity = 0.35): ViewStyle => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0 8px 28px rgba(201, 160, 106, ${intensity * 0.45}), 0 2px 8px rgba(0, 0, 0, 0.35)`,
    } as ViewStyle;
  }
  return {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: intensity * 0.5,
    shadowRadius: 16,
    elevation: 5,
  };
};

export const glowShadowAccent = (intensity = 0.35): ViewStyle => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0 8px 28px rgba(154, 107, 79, ${intensity * 0.45}), 0 2px 8px rgba(0, 0, 0, 0.35)`,
    } as ViewStyle;
  }
  return {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: intensity * 0.5,
    shadowRadius: 16,
    elevation: 5,
  };
};

/** Quiet elevation for interactive surfaces */
export const elevationSoft = (): ViewStyle => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(201, 160, 106, 0.06)',
    } as ViewStyle;
  }
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  };
};
