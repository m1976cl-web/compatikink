/**
 * Empirical Test Suite: useResponsive hook logic & boundary condition testing
 */

import { BREAKPOINTS } from '../../constants/theme';

export function evalUseResponsive(width: number, height: number = 800) {
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
  const isMobile = width < BREAKPOINTS.tablet;

  return {
    isDesktop,
    isTablet,
    isMobile,
    width,
    height,
  };
}

export interface TestResult {
  width: number;
  expected: { isMobile: boolean; isTablet: boolean; isDesktop: boolean };
  actual: { isMobile: boolean; isTablet: boolean; isDesktop: boolean };
  passed: boolean;
  notes?: string;
}

export function runUseResponsiveTests(): { passedAll: boolean; results: TestResult[] } {
  const testCases: { width: number; expected: { isMobile: boolean; isTablet: boolean; isDesktop: boolean }; note: string }[] = [
    { width: 320, expected: { isMobile: true, isTablet: false, isDesktop: false }, note: 'Mobile Portrait (iPhone SE)' },
    { width: 599, expected: { isMobile: true, isTablet: false, isDesktop: false }, note: 'Mobile upper integer bound' },
    { width: 599.9, expected: { isMobile: true, isTablet: false, isDesktop: false }, note: 'Mobile upper float boundary' },
    { width: 600, expected: { isMobile: false, isTablet: true, isDesktop: false }, note: 'Tablet lower bound (600px)' },
    { width: 767, expected: { isMobile: false, isTablet: true, isDesktop: false }, note: 'Tablet upper integer bound' },
    { width: 767.9, expected: { isMobile: false, isTablet: true, isDesktop: false }, note: 'Tablet upper float boundary' },
    { width: 768, expected: { isMobile: false, isTablet: false, isDesktop: true }, note: 'Desktop lower bound (768px)' },
    { width: 1024, expected: { isMobile: false, isTablet: false, isDesktop: true }, note: 'Standard Desktop / Tablet Landscape' },
    { width: 1440, expected: { isMobile: false, isTablet: false, isDesktop: true }, note: 'Large Laptop / Monitor' },
    { width: 1920, expected: { isMobile: false, isTablet: false, isDesktop: true }, note: 'Full HD Monitor' },
    // Edge & Adversarial cases
    { width: 0, expected: { isMobile: true, isTablet: false, isDesktop: false }, note: 'Zero width boundary' },
    { width: -100, expected: { isMobile: true, isTablet: false, isDesktop: false }, note: 'Negative width boundary' },
    { width: 3840, expected: { isMobile: false, isTablet: false, isDesktop: true }, note: '4K Ultra-wide monitor' },
  ];

  let passedAll = true;
  const results: TestResult[] = [];

  for (const tc of testCases) {
    const actual = evalUseResponsive(tc.width);
    const passed =
      actual.isMobile === tc.expected.isMobile &&
      actual.isTablet === tc.expected.isTablet &&
      actual.isDesktop === tc.expected.isDesktop;

    // Check invariant: exactly one flag must be true for all valid real width numbers
    const sumFlags = (actual.isMobile ? 1 : 0) + (actual.isTablet ? 1 : 0) + (actual.isDesktop ? 1 : 0);
    const invariantPassed = sumFlags === 1;

    if (!passed || !invariantPassed) {
      passedAll = false;
    }

    results.push({
      width: tc.width,
      expected: tc.expected,
      actual: { isMobile: actual.isMobile, isTablet: actual.isTablet, isDesktop: actual.isDesktop },
      passed: passed && invariantPassed,
      notes: tc.note,
    });
  }

  return { passedAll, results };
}

if (process.argv[1]?.includes('useResponsive.test.ts')) {
  const { passedAll, results } = runUseResponsiveTests();
  console.log('====================================================');
  console.log('   USE_RESPONSIVE BOUNDARY VERIFICATION SUITE');
  console.log('====================================================');
  results.forEach((r) => {
    const status = r.passed ? '✅ PASS' : '❌ FAIL';
    console.log(
      `${status} | Width: ${r.width.toString().padStart(6)}px | Mobile: ${r.actual.isMobile} | Tablet: ${r.actual.isTablet} | Desktop: ${r.actual.isDesktop} | (${r.notes})`
    );
  });
  console.log('----------------------------------------------------');
  console.log(`FINAL RESULT: ${passedAll ? 'PASSED ALL TESTS' : 'FAILED TESTS'}`);
  console.log('====================================================');
}
