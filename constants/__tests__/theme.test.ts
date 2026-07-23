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

    test('glowShadowPrimary returns valid CSS boxShadow on Web', () => {
      const style = glowShadowPrimary();
      expect(style).toEqual({
        boxShadow: '0 0 16px rgba(192, 132, 252, 0.4)',
      });
      expect((style as any).shadowColor).toBeUndefined();
      expect((style as any).elevation).toBeUndefined();
    });

    test('glowShadowAccent returns valid CSS boxShadow on Web', () => {
      const style = glowShadowAccent();
      expect(style).toEqual({
        boxShadow: '0 0 16px rgba(244, 114, 182, 0.4)',
      });
      expect((style as any).shadowColor).toBeUndefined();
      expect((style as any).elevation).toBeUndefined();
    });

    test('glowShadowPrimary accepts custom intensity values on Web', () => {
      expect(glowShadowPrimary(0.8)).toEqual({
        boxShadow: '0 0 16px rgba(192, 132, 252, 0.8)',
      });
      expect(glowShadowPrimary(0)).toEqual({
        boxShadow: '0 0 16px rgba(192, 132, 252, 0)',
      });
      expect(glowShadowPrimary(1.0)).toEqual({
        boxShadow: '0 0 16px rgba(192, 132, 252, 1)',
      });
    });

    test('glowShadowAccent accepts custom intensity values on Web', () => {
      expect(glowShadowAccent(0.1)).toEqual({
        boxShadow: '0 0 16px rgba(244, 114, 182, 0.1)',
      });
      expect(glowShadowAccent(0.5)).toEqual({
        boxShadow: '0 0 16px rgba(244, 114, 182, 0.5)',
      });
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
      expect(style).toEqual({
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
      });
      expect((style as any).boxShadow).toBeUndefined();
    });

    test('glowShadowAccent returns native shadow/elevation properties on iOS', () => {
      setPlatform('ios');
      const style = glowShadowAccent();
      expect(style).toEqual({
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
      });
      expect((style as any).boxShadow).toBeUndefined();
    });

    test('glowShadowPrimary returns native shadow/elevation properties on Android', () => {
      setPlatform('android');
      const style = glowShadowPrimary(0.6);
      expect(style).toEqual({
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 6,
      });
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
    test('Web primary RGBA color match colors.primary hex value', () => {
      const hex = colors.primary.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      setPlatform('web');
      const webStyle = glowShadowPrimary(0.4) as any;
      expect(webStyle.boxShadow).toContain(`rgba(${r}, ${g}, ${b}, 0.4)`);
    });

    test('Web accent RGBA color match colors.accent hex value', () => {
      const hex = colors.accent.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      setPlatform('web');
      const webStyle = glowShadowAccent(0.4) as any;
      expect(webStyle.boxShadow).toContain(`rgba(${r}, ${g}, ${b}, 0.4)`);
    });
  });
});
