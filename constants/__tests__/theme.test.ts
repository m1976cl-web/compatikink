declare const describe: any, test: any, expect: any, beforeEach: any, afterEach: any;

import { Platform, StyleSheet } from 'react-native';
import { glowShadowPrimary, glowShadowAccent, colors } from '../theme';

describe('constants/theme.ts Glow Shadow Functions', () => {
  const originalPlatform = Platform.OS;

  const setPlatform = (os: string) => {
    Object.defineProperty(Platform, 'OS', {
      value: os,
      configurable: true,
      writable: true,
    });
  };

  afterEach(() => {
    setPlatform(originalPlatform);
  });

  describe('Web Platform Mocks', () => {
    beforeEach(() => {
      setPlatform('web');
    });

    test('glowShadowPrimary returns soft copper boxShadow on Web', () => {
      const style = glowShadowPrimary();
      expect((style as any).boxShadow).toContain('rgba(201, 160, 106');
      expect((style as any).shadowColor).toBeUndefined();
      expect((style as any).elevation).toBeUndefined();
    });

    test('glowShadowAccent returns soft accent boxShadow on Web', () => {
      const style = glowShadowAccent();
      expect((style as any).boxShadow).toContain('rgba(154, 107, 79');
      expect((style as any).shadowColor).toBeUndefined();
      expect((style as any).elevation).toBeUndefined();
    });

    test('glowShadowPrimary accepts custom intensity values on Web', () => {
      const high = glowShadowPrimary(0.8) as any;
      const zero = glowShadowPrimary(0) as any;
      expect(high.boxShadow).toContain('rgba(201, 160, 106');
      expect(zero.boxShadow).toContain('rgba(201, 160, 106, 0)');
    });

    test('glowShadowAccent accepts custom intensity values on Web', () => {
      const low = glowShadowAccent(0.1) as any;
      const mid = glowShadowAccent(0.5) as any;
      expect(low.boxShadow).toContain('rgba(154, 107, 79');
      expect(mid.boxShadow).toContain('rgba(154, 107, 79');
    });

    test('StyleSheet.create processes Web style objects without error', () => {
      expect(() => {
        StyleSheet.create({
          glowPrimary: glowShadowPrimary(),
          glowAccent: glowShadowAccent(0.7),
        });
      }).not.toThrow();
    });
  });

  describe('Mobile Platform Mocks (iOS & Android)', () => {
    test('glowShadowPrimary returns native shadow/elevation properties on iOS', () => {
      setPlatform('ios');
      const style = glowShadowPrimary();
      expect(style.shadowColor).toBe(colors.primary);
      expect(style.shadowOffset).toEqual({ width: 0, height: 6 });
      expect(style.elevation).toBe(5);
      expect((style as any).boxShadow).toBeUndefined();
    });

    test('glowShadowAccent returns native shadow/elevation properties on iOS', () => {
      setPlatform('ios');
      const style = glowShadowAccent();
      expect(style.shadowColor).toBe(colors.accent);
      expect(style.shadowOffset).toEqual({ width: 0, height: 6 });
      expect((style as any).boxShadow).toBeUndefined();
    });

    test('glowShadowPrimary returns native shadow/elevation properties on Android', () => {
      setPlatform('android');
      const style = glowShadowPrimary(0.6);
      expect(style.shadowColor).toBe(colors.primary);
      expect(style.shadowOpacity).toBeCloseTo(0.3);
      expect(style.elevation).toBe(5);
      expect((style as any).boxShadow).toBeUndefined();
    });

    test('StyleSheet.create processes Mobile style objects without error', () => {
      setPlatform('ios');
      expect(() => {
        StyleSheet.create({
          glowPrimary: glowShadowPrimary(),
          glowAccent: glowShadowAccent(0.7),
        });
      }).not.toThrow();
    });
  });

  describe('Color Match & Consistency Verification', () => {
    test('palette is noir copper (not purple neon)', () => {
      expect(colors.background).toBe('#0c0a09');
      expect(colors.primary).toBe('#c9a06a');
      expect(colors.accent).toBe('#9a6b4f');
      // Legacy aliases remapped away from purple
      expect(colors.neonPurple).toBe(colors.primary);
    });

    test('Web primary RGBA color match colors.primary hex value', () => {
      const hex = colors.primary.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      setPlatform('web');
      const webStyle = glowShadowPrimary(0.4) as any;
      expect(webStyle.boxShadow).toContain(`rgba(${r}, ${g}, ${b}`);
    });

    test('Web accent RGBA color match colors.accent hex value', () => {
      const hex = colors.accent.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      setPlatform('web');
      const webStyle = glowShadowAccent(0.4) as any;
      expect(webStyle.boxShadow).toContain(`rgba(${r}, ${g}, ${b}`);
    });
  });
});
