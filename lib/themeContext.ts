/**
 * Theme Context & Palette Switcher — Feature 3
 * Allows toggling dynamically between 3 premium glossy aesthetic themes:
 * 1. Latex Negro Brillante (Obsidian + Neon Purple)
 * 2. Vinilo Carmesí (Dark Crimson + Rose Red)
 * 3. Cyberpunk Piel Neón (Midnight + Cyan Blue)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreset = 'latex_negro' | 'vinilo_carmesi' | 'cyberpunk_neon';

export interface ThemePalette {
  id: ThemePreset;
  name: string;
  emoji: string;
  background: string;
  backgroundMid: string;
  surface: string;
  border: string;
  borderSubtle: string;
  primary: string;
  primaryDark: string;
  accent: string;
  text: string;
  textMuted: string;
  textDim: string;
  gradientHint: string;
}

export const THEME_PRESETS: Record<ThemePreset, ThemePalette> = {
  latex_negro: {
    id: 'latex_negro',
    name: 'Latex Negro Brillante',
    emoji: '🖤',
    background: '#07050a',
    backgroundMid: '#0d0814',
    surface: '#150d24',
    border: '#352054',
    borderSubtle: 'rgba(192, 132, 252, 0.25)',
    primary: '#c084fc',
    primaryDark: '#9333ea',
    accent: '#f472b6',
    text: '#f3e8ff',
    textMuted: '#c084fc',
    textDim: '#7e22ce',
    gradientHint: 'radial-gradient(ellipse 120% 80% at 50% -20%, rgba(192,132,252,0.18) 0%, transparent 60%), linear-gradient(165deg, #07050a 0%, #0d0814 45%, #150d24 100%)',
  },
  vinilo_carmesi: {
    id: 'vinilo_carmesi',
    name: 'Vinilo Carmesí Oscuro',
    emoji: '🍷',
    background: '#0c0406',
    backgroundMid: '#1a080c',
    surface: '#280c12',
    border: '#5c1624',
    borderSubtle: 'rgba(244, 63, 94, 0.25)',
    primary: '#f43f5e',
    primaryDark: '#be123c',
    accent: '#fb7185',
    text: '#ffe4e6',
    textMuted: '#f43f5e',
    textDim: '#9f1239',
    gradientHint: 'radial-gradient(ellipse 120% 80% at 50% -20%, rgba(244,63,94,0.18) 0%, transparent 60%), linear-gradient(165deg, #0c0406 0%, #1a080c 45%, #280c12 100%)',
  },
  cyberpunk_neon: {
    id: 'cyberpunk_neon',
    name: 'Cyberpunk Piel Neón',
    emoji: '⚡',
    background: '#040b14',
    backgroundMid: '#081726',
    surface: '#0d2338',
    border: '#154668',
    borderSubtle: 'rgba(56, 189, 248, 0.25)',
    primary: '#38bdf8',
    primaryDark: '#0284c7',
    accent: '#2dd4bf',
    text: '#e0f2fe',
    textMuted: '#38bdf8',
    textDim: '#0369a1',
    gradientHint: 'radial-gradient(ellipse 120% 80% at 50% -20%, rgba(56,189,248,0.18) 0%, transparent 60%), linear-gradient(165deg, #040b14 0%, #081726 45%, #0d2338 100%)',
  },
};

const THEME_STORAGE_KEY = 'compatikink_theme_preset_v1';

export interface ThemeContextValue {
  currentTheme: ThemePreset;
  palette: ThemePalette;
  setTheme: (preset: ThemePreset) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  currentTheme: 'latex_negro',
  palette: THEME_PRESETS.latex_negro,
  setTheme: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemePreset>('latex_negro');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved && saved in THEME_PRESETS) {
        setCurrentTheme(saved as ThemePreset);
      }
    });
  }, []);

  const setTheme = async (preset: ThemePreset) => {
    setCurrentTheme(preset);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, preset);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        palette: THEME_PRESETS[currentTheme],
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
