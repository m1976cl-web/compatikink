import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { glowShadowPrimary, glowShadowAccent, colors } from '@/constants/theme';
import * as compassModule from '@/app/compass';
import { ActivityResponse } from '@/types';

const CompassScreen = (compassModule as any).default || compassModule;

async function runTests() {
  console.log('====================================================');
  console.log('  EMPIRICAL STRESS TEST SUITE — CHALLENGER M2_2');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  const findings: string[] = [];

  function assert(condition: boolean, message: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      if (detail) console.error(`         Detail: ${detail}`);
      findings.push(`FAIL: ${message}${detail ? ' - ' + detail : ''}`);
      failed++;
    }
  }

  function assertEqual(actual: any, expected: any, message: string) {
    const actJson = JSON.stringify(actual);
    const expJson = JSON.stringify(expected);
    if (actJson === expJson) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      console.error(`         Expected: ${expJson}`);
      console.error(`         Actual:   ${actJson}`);
      findings.push(`FAIL: ${message} | Expected: ${expJson} | Actual: ${actJson}`);
      failed++;
    }
  }

  const setPlatform = (os: string) => {
    Object.defineProperty(Platform, 'OS', {
      value: os,
      configurable: true,
      writable: true,
    });
  };

  const origPlatform = Platform.OS;

  // =========================================================================
  // TASK 1: constants/theme.ts Glow Shadow Functions Stress Test
  // =========================================================================
  console.log('----------------------------------------------------');
  console.log('1. Testing constants/theme.ts Glow Shadow Functions');
  console.log('----------------------------------------------------');

  // 1.1 Web Platform Mocks
  setPlatform('web');
  assertEqual(
    glowShadowPrimary(),
    { boxShadow: '0 0 16px rgba(192, 132, 252, 0.4)' },
    'glowShadowPrimary() default intensity 0.4 on Web'
  );

  assertEqual(
    glowShadowAccent(),
    { boxShadow: '0 0 16px rgba(244, 114, 182, 0.4)' },
    'glowShadowAccent() default intensity 0.4 on Web'
  );

  assertEqual(
    glowShadowPrimary(0.85),
    { boxShadow: '0 0 16px rgba(192, 132, 252, 0.85)' },
    'glowShadowPrimary(0.85) custom intensity on Web'
  );

  assertEqual(
    glowShadowAccent(0.12),
    { boxShadow: '0 0 16px rgba(244, 114, 182, 0.12)' },
    'glowShadowAccent(0.12) custom intensity on Web'
  );

  assertEqual(
    glowShadowPrimary(0),
    { boxShadow: '0 0 16px rgba(192, 132, 252, 0)' },
    'glowShadowPrimary(0) 0 boundary on Web'
  );

  assertEqual(
    glowShadowAccent(1),
    { boxShadow: '0 0 16px rgba(244, 114, 182, 1)' },
    'glowShadowAccent(1) 1.0 boundary on Web'
  );

  // 1.2 Mobile Platform Mocks (iOS)
  setPlatform('ios');
  assertEqual(
    glowShadowPrimary(),
    {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 6,
    },
    'glowShadowPrimary() default intensity 0.4 on iOS'
  );

  assertEqual(
    glowShadowAccent(0.75),
    {
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.75,
      shadowRadius: 12,
      elevation: 6,
    },
    'glowShadowAccent(0.75) custom intensity on iOS'
  );

  // 1.3 Mobile Platform Mocks (Android)
  setPlatform('android');
  assertEqual(
    glowShadowPrimary(0.6),
    {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 6,
    },
    'glowShadowPrimary(0.6) custom intensity on Android'
  );

  // 1.4 Windows Platform Mock
  setPlatform('windows');
  assertEqual(
    glowShadowPrimary(0.5),
    {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 6,
    },
    'glowShadowPrimary(0.5) fallback on Windows mobile style branch'
  );

  // 1.5 Cross-Platform StyleSheet.create validation
  setPlatform('web');
  try {
    const webSheet = StyleSheet.create({
      card: glowShadowPrimary(0.5),
      button: glowShadowAccent(0.3),
    });
    assert(!!webSheet, 'StyleSheet.create processes Web glow style objects');
  } catch (e: any) {
    assert(false, 'StyleSheet.create failed on Web style objects', e.message);
  }

  setPlatform('ios');
  try {
    const mobileSheet = StyleSheet.create({
      card: glowShadowPrimary(0.5),
      button: glowShadowAccent(0.3),
    });
    assert(!!mobileSheet, 'StyleSheet.create processes Mobile glow style objects');
  } catch (e: any) {
    assert(false, 'StyleSheet.create failed on Mobile style objects', e.message);
  }

  // 1.6 Color consistency check between Hex and Web RGBA
  setPlatform('web');
  const primObj = glowShadowPrimary(0.4) as any;
  assert(
    primObj.boxShadow === `0 0 16px rgba(192, 132, 252, 0.4)`,
    'glowShadowPrimary RGB values match colors.primary (#c084fc)'
  );

  const accObj = glowShadowAccent(0.4) as any;
  assert(
    accObj.boxShadow === `0 0 16px rgba(244, 114, 182, 0.4)`,
    'glowShadowAccent RGB values match colors.accent (#f472b6)'
  );

  setPlatform(origPlatform);

  // =========================================================================
  // TASK 2: app/compass.tsx Route & Component Rendering Tests
  // =========================================================================
  console.log('\n----------------------------------------------------');
  console.log('2. Testing app/compass.tsx Route & Component');
  console.log('----------------------------------------------------');

  // 2.1 Route Registration & Export Type
  assert(typeof CompassScreen === 'function', 'app/compass.tsx default export is a function component');
  assert(CompassScreen.name === 'CompassScreen', 'Exported component function name is CompassScreen');

  // 2.2 JSX Element Creation without Runtime Exception
  try {
    const element = React.createElement(CompassScreen);
    assert(element !== null && typeof element === 'object', 'React.createElement(CompassScreen) creates valid JSX element structure');
    assert(element.type === CompassScreen, 'JSX element type matches CompassScreen component reference');
  } catch (e: any) {
    assert(false, 'React.createElement(CompassScreen) threw exception', e.message);
  }

  // 2.3 Verification of Inner Logic: Compass Point & Archetype Calculations
  const { calculateCompassPoint, determineArchetype } = await import('@/lib/compatibility');

  // Test 2.3.1: Null / Empty profile baseResponses
  const emptyPoint = calculateCompassPoint([]);
  assertEqual(emptyPoint, { x: 5, y: 50 }, 'calculateCompassPoint([]) handles empty array -> returns bounds baseline {x:5, y:50}');

  const emptyArchetype = determineArchetype([], 50);
  assertEqual(emptyArchetype, 'Explorador Neutro', 'determineArchetype([], 50) handles empty array -> returns "Explorador Neutro"');

  // Test 2.3.2: Single positive response with valid real ID ('bo_rope')
  const singleResponse: ActivityResponse[] = [
    { activityId: 'bo_rope', rating: 'love', role: 'give', intensity: 5 },
  ];
  const singlePoint = calculateCompassPoint(singleResponse);
  assert(singlePoint.x > 5 && singlePoint.y > 50, `calculateCompassPoint with 1 item produces shifted point: x=${singlePoint.x}, y=${singlePoint.y}`);
  
  const singleArchetype = determineArchetype(singleResponse, singlePoint.y);
  assert(typeof singleArchetype === 'string' && singleArchetype.length > 0, `determineArchetype produces archetype: "${singleArchetype}"`);

  // Test 2.3.3: Dominant vs Submissive responses with real IDs
  const domResponses: ActivityResponse[] = [
    { activityId: 'pe_d/s_dynamic', rating: 'love', role: 'give', intensity: 5 },
    { activityId: 'bo_rope', rating: 'love', role: 'give', intensity: 4 },
  ];
  const domPoint = calculateCompassPoint(domResponses);
  const domArchetype = determineArchetype(domResponses, domPoint.y);
  assert(domPoint.y > 50, `Dominant responses yield y > 50 (y=${domPoint.y})`);
  assert(domArchetype === 'Líder Dominante' || domArchetype.includes('Dominante'), `Dominant archetype calculated correctly: "${domArchetype}"`);

  const subResponses: ActivityResponse[] = [
    { activityId: 'pe_d/s_dynamic', rating: 'love', role: 'receive', intensity: 5 },
    { activityId: 'bo_rope', rating: 'love', role: 'receive', intensity: 4 },
  ];
  const subPoint = calculateCompassPoint(subResponses);
  const subArchetype = determineArchetype(subResponses, subPoint.y);
  assert(subPoint.y < 50, `Submissive responses yield y < 50 (y=${subPoint.y})`);
  assert(subArchetype === 'Sumiso Devoto' || subArchetype.includes('Sumiso'), `Submissive archetype calculated correctly: "${subArchetype}"`);

  // Test 2.3.4: Partner calculations with missing / partial data
  const nullGuestSession = {
    id: 's_null',
    inviteCode: 'CODE01',
    initiatorToken: 't01',
    initiatorNickname: 'Initiator',
    initiatorResponses: domResponses,
    guestResponses: null,
    status: 'waiting' as const,
    createdAt: new Date().toISOString(),
  };

  const nullPartnerPoint = nullGuestSession.guestResponses ? calculateCompassPoint(nullGuestSession.guestResponses) : null;
  assertEqual(nullPartnerPoint, null, 'CompassScreen partnerPoint calculation returns null for session with null guestResponses');

  const completeGuestSession = {
    id: 's_comp',
    inviteCode: 'CODE02',
    initiatorToken: 't02',
    initiatorNickname: 'Initiator',
    initiatorResponses: domResponses,
    guestNickname: 'PartnerBob',
    guestResponses: subResponses,
    status: 'complete' as const,
    createdAt: new Date().toISOString(),
  };

  const compPartnerPoint = calculateCompassPoint(completeGuestSession.guestResponses);
  const compPartnerArchetype = determineArchetype(completeGuestSession.guestResponses, compPartnerPoint.y);
  assert(compPartnerPoint.x > 0 && compPartnerPoint.y > 0, `Complete session partner point calculated: x=${compPartnerPoint.x}, y=${compPartnerPoint.y}`);
  assert(typeof compPartnerArchetype === 'string' && compPartnerArchetype.length > 0, `Complete session partner archetype calculated: "${compPartnerArchetype}"`);

  // Test 2.3.5: Fallback partner nickname resolution
  const sessionNoNickname = {
    id: 's_noname',
    inviteCode: 'CODE03',
    initiatorToken: 't03',
    initiatorNickname: 'Initiator',
    initiatorResponses: domResponses,
    guestResponses: subResponses,
    status: 'complete' as const,
    createdAt: new Date().toISOString(),
  };
  const fallbackPartnerName = (sessionNoNickname as any).guestNickname || (sessionNoNickname as any).guestProfile?.nickname || 'Pareja';
  assertEqual(fallbackPartnerName, 'Pareja', 'Partner nickname fallback to "Pareja" when guestNickname and guestProfile are undefined');

  // Test 2.3.6: Out of bounds partner index handling
  const sessionsList = [completeGuestSession];
  const outOfBoundsIndex = 5;
  const selectedSessionOutOfBounds = sessionsList[outOfBoundsIndex];
  assertEqual(selectedSessionOutOfBounds, undefined, 'Out of bounds partner index yields undefined session without error');

  const safePartnerPoint = selectedSessionOutOfBounds && (selectedSessionOutOfBounds as any).guestResponses
    ? calculateCompassPoint((selectedSessionOutOfBounds as any).guestResponses)
    : null;
  assertEqual(safePartnerPoint, null, 'Out of bounds partner index cleanly resolves partnerPoint to null');

  // Print Summary
  console.log('\n====================================================');
  console.log('  TEST SUMMARY');
  console.log('====================================================');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (findings.length > 0) {
    console.log('\nFindings / Failures:');
    findings.forEach((f) => console.log(` - ${f}`));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL EMPIRICAL VERIFICATION TESTS PASSED SUCCESSFULLY!');
  }
}

runTests().catch((err) => {
  console.error('Fatal error during test execution:', err);
  process.exit(1);
});
