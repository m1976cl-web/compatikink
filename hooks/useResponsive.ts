/**
 * useResponsive.ts — Mejora #12
 *
 * Breakpoints granulares con soporte de columnas, orientación y clase
 * de ancho CSS-like para layouts adaptivos en Mobile, Tablet y Desktop.
 *
 * Antes: solo 3 flags básicos (isDesktop / isTablet / isMobile).
 * Ahora: 5 breakpoints + columnas recomendadas + orientación + helpers.
 */
import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';

// ── Breakpoints (px) ──────────────────────────────────────────────────────────
export const BP = {
  xs:  0,    // 0-479   — teléfono pequeño
  sm:  480,  // 480-767 — teléfono grande / phablet
  md:  768,  // 768-1023 — tablet
  lg:  1024, // 1024-1279 — laptop / desktop compacto
  xl:  1280, // 1280+ — desktop amplio / TV
} as const;

export type BreakpointKey = keyof typeof BP;

/**
 * Número recomendado de columnas del grid para cada breakpoint.
 * Úsalo en moduleGrid, desktopGrid, etc.
 */
export const GRID_COLS: Record<BreakpointKey, number> = {
  xs:  1,
  sm:  1,
  md:  2,
  lg:  3,
  xl:  4,
};

export interface ResponsiveValue {
  // ── Tamaño ─────────────────────────────────────────────────────────────────
  width:      number;
  height:     number;

  // ── Breakpoint actual ──────────────────────────────────────────────────────
  breakpoint: BreakpointKey;

  // ── Flags de conveniencia ──────────────────────────────────────────────────
  /** width < 480 */
  isXs:       boolean;
  /** 480 ≤ width < 768 */
  isSm:       boolean;
  /** 768 ≤ width < 1024 */
  isMd:       boolean;
  /** 1024 ≤ width < 1280 */
  isLg:       boolean;
  /** width ≥ 1280 */
  isXl:       boolean;

  // ── Compat flags (retrocompatibilidad con código existente) ────────────────
  /** width ≥ 768 (md+) */
  isDesktop:  boolean;
  /** 600 ≤ width < 768 */
  isTablet:   boolean;
  /** width < 600 */
  isMobile:   boolean;

  // ── Orientación ───────────────────────────────────────────────────────────
  isLandscape: boolean;
  isPortrait:  boolean;

  // ── Grid ─────────────────────────────────────────────────────────────────
  /** Columnas recomendadas del grid para el breakpoint actual */
  gridCols:   number;

  /**
   * Devuelve el valor correcto según el breakpoint actual.
   * Funciona como el `responsive()` de styled-system.
   *
   * @example
   * const padding = pick({ xs: 8, md: 16, xl: 24 }); // → 16 en tablet
   */
  pick: <T>(values: Partial<Record<BreakpointKey, T>>, fallback?: T) => T | undefined;

  /**
   * Verdadero si el breakpoint actual es >= el dado.
   * @example
   * atLeast('md') // true en tablet, laptop y desktop
   */
  atLeast: (bp: BreakpointKey) => boolean;

  /**
   * Verdadero si el breakpoint actual es < el dado.
   * @example
   * below('md') // true en teléfonos
   */
  below: (bp: BreakpointKey) => boolean;
}

function resolveBreakpoint(width: number): BreakpointKey {
  if (width >= BP.xl)  return 'xl';
  if (width >= BP.lg)  return 'lg';
  if (width >= BP.md)  return 'md';
  if (width >= BP.sm)  return 'sm';
  return 'xs';
}

const BP_ORDER: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl'];

export function useResponsive(): ResponsiveValue {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const bp         = resolveBreakpoint(width);
    const bpIndex    = BP_ORDER.indexOf(bp);
    const isLandscape = width > height;

    const atLeast = (target: BreakpointKey) =>
      bpIndex >= BP_ORDER.indexOf(target);

    const below = (target: BreakpointKey) =>
      bpIndex < BP_ORDER.indexOf(target);

    function pick<T>(values: Partial<Record<BreakpointKey, T>>, fallback?: T): T | undefined {
      // Walk down from current breakpoint to find the closest defined value
      for (let i = bpIndex; i >= 0; i--) {
        const v = values[BP_ORDER[i]];
        if (v !== undefined) return v;
      }
      return fallback;
    }

    return {
      width,
      height,
      breakpoint:  bp,
      isXs:        bp === 'xs',
      isSm:        bp === 'sm',
      isMd:        bp === 'md',
      isLg:        bp === 'lg',
      isXl:        bp === 'xl',
      // retrocompat
      isDesktop:   atLeast('md'),
      isTablet:    bp === 'md',
      isMobile:    below('sm'),
      isLandscape,
      isPortrait:  !isLandscape,
      gridCols:    GRID_COLS[bp],
      pick,
      atLeast,
      below,
    };
  }, [width, height]);
}
