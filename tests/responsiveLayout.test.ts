/**
 * Empirical Stress Test Harness for Milestone 2 Responsive Layout
 * Tests:
 * 1. hooks/useResponsive.ts logic across window width boundaries
 * 2. Layout width calculations & overflow stress test in app/index.tsx, app/report.tsx, app/compass.tsx, and components/CompatibilityInfographic.tsx
 */

// ----------------------------------------------------------------------
// 1. Breakpoints & Hook Logic under Test
// ----------------------------------------------------------------------
export const BREAKPOINTS = {
  desktop: 768,
  tablet: 600,
};

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

// ----------------------------------------------------------------------
// 2. Layout Width Calculators & Overflow Checks
// ----------------------------------------------------------------------

export interface ContainerLayoutMetrics {
  windowWidth: number;
  contentMaxWidth: number;
  scrollPadding: number;
  contentWidth: number;
  isDesktop: boolean;

  // app/index.tsx (Dashboard) metrics
  index?: {
    desktopGridGap: number;
    colLeftFlex: number; // 48
    colRightFlex: number; // 52
    colLeftWidth: number;
    colRightWidth: number;
    totalGridWidth: number;
    gridOverflow: number; // >0 means overflow
    colLeftCardInnerWidth: number; // colLeftWidth - 2*24 - 2*1
  };

  // app/report.tsx metrics
  report?: {
    desktopSummaryGap: number;
    summaryInnerWidth: number; // contentWidth - 2*24 - 2*1
    summaryLeftColWidth: number;
    summaryRightColWidth: number;
    cardGridGap: number;
    cardItemWidthPct: number; // 48.5%
    cardItemWidthPx: number;
    twoCardRowWidth: number; // 2 * cardItemWidthPx + cardGridGap
    cardGridOverflow: number; // twoCardRowWidth - contentWidth (>0 means overflow)
  };

  // app/compass.tsx metrics
  compass?: {
    desktopGap: number;
    colLeftWidth: number; // (contentWidth - 24) * 0.48
    plotCardInnerWidth: number; // colLeftWidth - 2*24 - 2*1.5
    fixedPlotSize: number; // 400
    plotOverflow: number; // fixedPlotSize - plotCardInnerWidth (>0 means overflow)
  };

  // components/CompatibilityInfographic.tsx metrics
  infographic?: {
    desktopGap: number;
    colLeftWidth: number; // (contentWidth - 24) * 0.5
    colRightWidth: number; // (contentWidth - 24) * 0.5
    gridOverflow: number;
  };
}

export function calculateLayoutMetrics(windowWidth: number): ContainerLayoutMetrics {
  const scrollPadding = 24; // spacing.lg = 24
  const contentMaxWidth = 1140;
  const contentWidth = Math.min(windowWidth, contentMaxWidth) - 2 * scrollPadding;
  const isDesktop = windowWidth >= BREAKPOINTS.desktop;

  const metrics: ContainerLayoutMetrics = {
    windowWidth,
    contentMaxWidth,
    scrollPadding,
    contentWidth,
    isDesktop,
  };

  if (isDesktop) {
    // ---------------- app/index.tsx ----------------
    const indexGap = 24;
    const availIndexWidth = contentWidth - indexGap;
    const colLeftWidth = availIndexWidth * (48 / 100);
    const colRightWidth = availIndexWidth * (52 / 100);
    const totalIndexGridWidth = colLeftWidth + colRightWidth + indexGap;

    metrics.index = {
      desktopGridGap: indexGap,
      colLeftFlex: 48,
      colRightFlex: 52,
      colLeftWidth,
      colRightWidth,
      totalGridWidth: totalIndexGridWidth,
      gridOverflow: totalIndexGridWidth - contentWidth,
      colLeftCardInnerWidth: colLeftWidth - 2 * 24 - 2 * 1,
    };

    // ---------------- app/report.tsx ----------------
    const reportSummaryGap = 24;
    const summaryInnerWidth = contentWidth - 2 * 24 - 2 * 1; // padding 24, border 1
    const summaryLeftColWidth = (summaryInnerWidth - reportSummaryGap) / 2;
    const summaryRightColWidth = (summaryInnerWidth - reportSummaryGap) / 2;

    const cardGridGap = 16;
    const cardItemWidthPct = 48.5;
    const cardItemWidthPx = contentWidth * (cardItemWidthPct / 100);
    const twoCardRowWidth = 2 * cardItemWidthPx + cardGridGap;

    metrics.report = {
      desktopSummaryGap: reportSummaryGap,
      summaryInnerWidth,
      summaryLeftColWidth,
      summaryRightColWidth,
      cardGridGap,
      cardItemWidthPct,
      cardItemWidthPx,
      twoCardRowWidth,
      cardGridOverflow: twoCardRowWidth - contentWidth,
    };

    // ---------------- app/compass.tsx ----------------
    const compassGap = 24;
    const compassAvail = contentWidth - compassGap;
    const compassColLeft = compassAvail * (48 / 100);
    const plotCardInnerWidth = compassColLeft - 2 * 24 - 2 * 1.5; // padding 24, border 1.5
    const fixedPlotSize = 400; // renderPlot(400)

    metrics.compass = {
      desktopGap: compassGap,
      colLeftWidth: compassColLeft,
      plotCardInnerWidth,
      fixedPlotSize,
      plotOverflow: fixedPlotSize - plotCardInnerWidth,
    };

    // ---------------- components/CompatibilityInfographic.tsx ----------------
    const infoGap = 24;
    const infoColWidth = (contentWidth - infoGap) / 2;

    metrics.infographic = {
      desktopGap: infoGap,
      colLeftWidth: infoColWidth,
      colRightWidth: infoColWidth,
      gridOverflow: 2 * infoColWidth + infoGap - contentWidth,
    };
  }

  return metrics;
}

// ----------------------------------------------------------------------
// 3. Test Runner
// ----------------------------------------------------------------------
export function runEmpiricalStressTest() {
  const boundaryWidths = [320, 599, 599.9, 600, 767, 767.9, 768, 1024, 1440, 1920];
  const adversarialWidths = [0, -100, 375.5, 3840];
  const allWidths = [...boundaryWidths, ...adversarialWidths];

  console.log('======================================================================');
  console.log('  MILESTONE 2 RESPONSIVE LAYOUT EMPIRICAL STRESS TEST HARNESS');
  console.log('======================================================================\n');

  // Task 1: Hook Verification
  console.log('--- TASK 1: hooks/useResponsive.ts Boundary Verification ---');
  let hookPassedAll = true;
  for (const w of allWidths) {
    const res = evalUseResponsive(w);
    const countTrue = (res.isMobile ? 1 : 0) + (res.isTablet ? 1 : 0) + (res.isDesktop ? 1 : 0);
    const validRealNum = !isNaN(w) && isFinite(w);
    const invariantOk = !validRealNum || countTrue === 1;

    let expectedCategory = 'Mobile';
    if (w >= 768) expectedCategory = 'Desktop';
    else if (w >= 600) expectedCategory = 'Tablet';

    const matchCategory =
      (expectedCategory === 'Mobile' && res.isMobile) ||
      (expectedCategory === 'Tablet' && res.isTablet) ||
      (expectedCategory === 'Desktop' && res.isDesktop);

    const ok = invariantOk && matchCategory;
    if (!ok) hookPassedAll = false;

    console.log(
      `Width: ${w.toString().padStart(6)}px | Mobile: ${res.isMobile.toString().padEnd(5)} | Tablet: ${res.isTablet.toString().padEnd(5)} | Desktop: ${res.isDesktop.toString().padEnd(5)} | Result: ${ok ? '✅ PASS' : '❌ FAIL'}`
    );
  }
  console.log(`Hook Verification Verdict: ${hookPassedAll ? '✅ PASSED ALL BOUNDARIES' : '❌ FAILED'}\n`);

  // Task 2: Layout Stress Testing
  console.log('--- TASK 2: app/index.tsx, app/report.tsx, app/compass.tsx Layout Calculations ---');
  const desktopBoundaryWidths = [768, 1024, 1440, 1920];

  for (const w of desktopBoundaryWidths) {
    const m = calculateLayoutMetrics(w);
    console.log(`\n▶ [WINDOW WIDTH = ${w}px] ContentWidth: ${m.contentWidth}px`);

    // index.tsx check
    if (m.index) {
      console.log(
        `  • app/index.tsx Desktop Grid: ColLeft=${m.index.colLeftWidth.toFixed(2)}px (48%), ColRight=${m.index.colRightWidth.toFixed(2)}px (52%), Gap=${m.index.desktopGridGap}px -> Total=${m.index.totalGridWidth.toFixed(2)}px (Overflow: ${m.index.gridOverflow.toFixed(2)}px) -> ${m.index.gridOverflow <= 0.001 ? '✅ OK' : '❌ OVERFLOW'}`
      );
    }

    // report.tsx check
    if (m.report) {
      console.log(
        `  • app/report.tsx Card Grid: ItemWidth=${m.report.cardItemWidthPx.toFixed(2)}px (48.5%), Gap=16px -> 2-Item Row=${m.report.twoCardRowWidth.toFixed(2)}px vs ContentWidth=${m.contentWidth}px (Overflow: ${m.report.cardGridOverflow.toFixed(2)}px) -> ${m.report.cardGridOverflow <= 0.001 ? '✅ OK' : '❌ OVERFLOW'}`
      );
    }

    // infographic check
    if (m.infographic) {
      console.log(
        `  • CompatibilityInfographic Desktop Grid: ColLeft=${m.infographic.colLeftWidth.toFixed(2)}px, ColRight=${m.infographic.colRightWidth.toFixed(2)}px -> ${m.infographic.gridOverflow <= 0.001 ? '✅ OK' : '❌ OVERFLOW'}`
      );
    }

    // compass.tsx check
    if (m.compass) {
      const overflow = m.compass.plotOverflow;
      const status = overflow <= 0 ? '✅ OK' : '⚠️ OVERFLOW (BREAKDOWN RISK)';
      console.log(
        `  • app/compass.tsx Plot Card: ColLeft=${m.compass.colLeftWidth.toFixed(2)}px, InnerCardWidth=${m.compass.plotCardInnerWidth.toFixed(2)}px vs FixedPlotSize=${m.compass.fixedPlotSize}px (Plot Overflow: ${overflow.toFixed(2)}px) -> ${status}`
      );
    }
  }

  // Calculate critical breakpoint for compass.tsx
  console.log('\n--- BREAKDOWN RISK ANALYSIS ---');
  let compassMinW = 768;
  while (compassMinW < 2000) {
    const m = calculateLayoutMetrics(compassMinW);
    if (m.compass && m.compass.plotOverflow <= 0) {
      break;
    }
    compassMinW++;
  }
  console.log(`📌 app/compass.tsx fixed 400px plot overflows left column for desktop window widths from 768px up to ${compassMinW - 1}px.`);
  console.log(`   (At width 768px, inner available width is ~283.08px, causing a 116.92px visual overflow unless container clips/resizes).`);

  console.log('\n======================================================================');
  console.log('  END OF EMPIRICAL STRESS TEST');
  console.log('======================================================================');
}

if (process.argv[1]?.includes('responsiveLayout.test.ts')) {
  runEmpiricalStressTest();
}
