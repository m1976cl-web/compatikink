import { Platform, ViewStyle } from 'react-native';

export const BREAKPOINTS = {
  desktop: 768,
  tablet: 600,
};

export const colors = {
  background: '#0a0612',
  surface: '#150d24',
  surfaceLight: '#211536',
  border: '#3c2957',
  primary: '#c084fc',
  primaryDark: '#9333ea',
  primaryLight: '#e9d5ff',
  accent: '#f472b6',
  neonPurple: '#d8b4fe',
  neonPink: '#f472b6',
  neonCyan: '#38bdf8',
  neonGreen: '#4ade80',
  glowPurple: 'rgba(192, 132, 252, 0.35)',
  glowPink: 'rgba(244, 114, 182, 0.35)',
  text: '#f8f5fc',
  textMuted: '#d1c4e9',
  success: '#4ade80',
  warning: '#fbbf24',
  danger: '#f87171',
  info: '#38bdf8',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const glowShadowPrimary = (intensity = 0.4): ViewStyle => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0 0 16px rgba(192, 132, 252, ${intensity})`,
    } as any;
  }
  return {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: intensity,
    shadowRadius: 12,
    elevation: 6,
  };
};

export const glowShadowAccent = (intensity = 0.4): ViewStyle => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0 0 16px rgba(244, 114, 182, ${intensity})`,
    } as any;
  }
  return {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: intensity,
    shadowRadius: 12,
    elevation: 6,
  };
};

