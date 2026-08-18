import { Platform, TextStyle, ViewStyle } from 'react-native';

/**
 * Compatikink design tokens — noir íntimo
 * Ink depth + copper accent. Not purple-neon AI, not cream/terracotta broadsheet.
 */

export const BREAKPOINTS = {
  desktop: 768,
  tablet: 600,
};

/** Glossy Black Latex & Neon Purple palette */
export const colors = {
  // Depth layers (glossy black obsidian)
  background: '#07050a',
  backgroundMid: '#0d0814',
  backgroundAlt: '#120b1c',
  surface: '#150d24',
  surfaceLight: '#1d1230',
  surfaceElevated: '#26173e',
  border: '#4c2882',
  borderSubtle: 'rgba(192, 132, 252, 0.35)',

  // Brand accent — Glossy Neon Purple & Magenta
  primary: '#c084fc',
  primaryDark: '#9333ea',
  primaryLight: '#e9d5ff',
  accent: '#f472b6',
  accentSoft: 'rgba(244, 114, 182, 0.15)',

  // Functional
  success: '#4ade80',
  warning: '#fbbf24',
  danger: '#f87171',
  error: '#f87171',
  info: '#38bdf8',

  // Text
  text: '#ffffff',
  textMuted: '#d8b4fe',
  textDim: '#c084fc',
  onPrimary: '#07050a',

  // Legacy & Neon aliases
  neonPurple: '#c084fc',
  neonRose: '#f43f5e',
  neonEmerald: '#10b981',
  neonPink: '#f472b6',
  neonCyan: '#38bdf8',
  neonGreen: '#4ade80',
  glowPurple: 'rgba(192, 132, 252, 0.35)',
  glowPink: 'rgba(244, 114, 182, 0.35)',
};

/** Office Light / Modo Oficina palette tokens */
export const officeLightColors = {
  background: '#f8fafc',
  backgroundMid: '#f1f5f9',
  surface: '#ffffff',
  border: '#cbd5e1',
  borderSubtle: 'rgba(14, 165, 233, 0.25)',
  primary: '#0284c7',
  primaryDark: '#0369a1',
  accent: '#0d9488',
  text: '#0f172a',
  textMuted: '#475569',
  textDim: '#64748b',
};

/** Glossy Latex gradient stops for shell / ScreenContainer */
export const gradients = {
  ink: ['#07050a', '#0d0814', '#150d24'] as const,
  inkRadialHint: 'radial-gradient(ellipse 120% 80% at 50% -20%, rgba(192,132,252,0.18) 0%, transparent 60%), linear-gradient(165deg, #07050a 0%, #0d0814 45%, #150d24 100%)',
  surfaceWash: 'linear-gradient(180deg, rgba(21,13,36,0.95) 0%, rgba(13,8,20,0.98) 100%)',
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
  xs: 12,
  sm: 14,
  md: 16,
  lg: 19,
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
  mono: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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
    lineHeight: 24,
    color: colors.text,
  } as TextStyle,
  bodyMuted: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    lineHeight: 22,
    color: colors.textMuted,
  } as TextStyle,
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    letterSpacing: 1.2,
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
