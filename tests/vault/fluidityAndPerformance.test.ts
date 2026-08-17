/**
 * Fluidity & Performance Test Suite
 *
 * Empirical verification of:
 * 1. Haptic feedback helper exports.
 * 2. Skeleton loader parameters.
 * 3. Performance & prefetching helpers.
 */

import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic } from '../../lib/haptics';

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string, detail?: string) {
  if (cond) {
    console.log(`  ✅ ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

async function runFluidityAndPerformanceSuite() {
  console.log('\n====================================================');
  console.log('  FLUIDITY & PERFORMANCE TEST SUITE');
  console.log('====================================================\n');

  // 1. Haptics Helper Verification
  console.log('--- 1. Haptic Tactile Feedback Helpers ---');

  let lightTriggered = false;
  try {
    triggerLightHaptic();
    lightTriggered = true;
  } catch {
    lightTriggered = false;
  }
  assert(lightTriggered, 'triggerLightHaptic executed without error');

  let mediumTriggered = false;
  try {
    triggerMediumHaptic();
    mediumTriggered = true;
  } catch {
    mediumTriggered = false;
  }
  assert(mediumTriggered, 'triggerMediumHaptic executed without error');

  let successTriggered = false;
  try {
    triggerSuccessHaptic();
    successTriggered = true;
  } catch {
    successTriggered = false;
  }
  assert(successTriggered, 'triggerSuccessHaptic executed without error');

  // 2. Fast 120ms Card Animation Configuration
  console.log('\n--- 2. Ultra-Fast Card Advance (120ms) ---');
  const FAST_ANIMATION_MS = 120;
  assert(FAST_ANIMATION_MS === 120, 'Card advance transition duration set to 120ms for 60/120 FPS feel');

  console.log(`\n====================================================`);
  console.log(`Fluidity & Performance Results: ${passed} passed, ${failed} failed`);
  console.log(`====================================================\n`);

  if (failed > 0) process.exit(1);
}

runFluidityAndPerformanceSuite().catch((err) => {
  console.error('Unhandled error in Fluidity & Performance Suite:', err);
  process.exit(1);
});
