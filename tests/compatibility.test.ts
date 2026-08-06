import assert from 'node:assert/strict';
import { generateReport } from '../lib/compatibility';
import { calculateRoleComplementarityScore } from '../lib/vaultUnified';
import { ActivityResponse } from '../types';

console.log('════════════════════════════════════════════════════');
console.log('  COMPATIKINK — Compatibility Engine Unit Suite (P1.1)');
console.log('════════════════════════════════════════════════════\n');

function testCompatibilityEngine() {
  console.log('1. Testing generateReport classification and scoring...');

  // Use valid activity IDs from data/activities.ts
  const initiatorResponses: ActivityResponse[] = [
    { activityId: 'pe_d/s_dynamic', rating: 'love', role: 'give', intensity: 3 },
    { activityId: 'bo_rope', rating: 'hard_limit', role: 'flexible', intensity: 1 },
    { activityId: 'bo_cuffs', rating: 'curious', role: 'flexible', intensity: 2 },
    { activityId: 'bo_blindfold', rating: 'like', role: 'give', intensity: 3 },
  ];

  const guestResponses: ActivityResponse[] = [
    { activityId: 'pe_d/s_dynamic', rating: 'love', role: 'receive', intensity: 3 },
    { activityId: 'bo_rope', rating: 'like', role: 'receive', intensity: 4 }, // hard limit conflict vs initiator hard_limit
    { activityId: 'bo_cuffs', rating: 'like', role: 'flexible', intensity: 2 }, // explore together
    { activityId: 'bo_blindfold', rating: 'like', role: 'give', intensity: 3 }, // role mismatch (give vs give)
  ];

  const report = generateReport('test-session-1', initiatorResponses, guestResponses);

  assert.ok(report.compatibilityScore >= 0 && report.compatibilityScore <= 100, 'Score must be between 0 and 100');
  console.log(`  ✅ Compatibility Score calculated: ${report.compatibilityScore}%`);

  const hardLimitConflict = report.items.find((i) => i.section === 'hard_limit_conflict');
  assert.ok(hardLimitConflict, 'Must detect hard limit conflict for bo_rope');
  console.log('  ✅ Hard limit conflict correctly classified');

  const exploreTogether = report.items.find((i) => i.section === 'explore_together');
  assert.ok(exploreTogether, 'Must classify curious + like as explore_together for bo_cuffs');
  console.log('  ✅ Explore together correctly classified');

  const mutualMatch = report.items.find((i) => i.section === 'mutual_match');
  assert.ok(mutualMatch, 'Must classify love + love complementary roles as mutual_match for pe_d/s_dynamic');
  console.log('  ✅ Mutual match correctly classified');

  const roleMismatch = report.items.find((i) => i.section === 'role_mismatch');
  assert.ok(roleMismatch, 'Must detect role mismatch (give vs give) for bo_blindfold');
  console.log('  ✅ Role mismatch correctly classified');
}

function testRoleComplementarity() {
  console.log('\n2. Testing calculateRoleComplementarityScore...');

  const scoreDomSub = calculateRoleComplementarityScore('Dom', 'Sub');
  assert.equal(scoreDomSub, 100, 'Dom vs Sub should yield 100% complementarity');
  console.log('  ✅ Dom vs Sub score: 100%');

  const scoreSwitchSwitch = calculateRoleComplementarityScore('Switch', 'Switch');
  assert.equal(scoreSwitchSwitch, 90, 'Switch vs Switch should yield 90%');
  console.log('  ✅ Switch vs Switch score: 90%');

  const scoreDomDom = calculateRoleComplementarityScore('Dom', 'Dom');
  assert.equal(scoreDomDom, 40, 'Dom vs Dom should yield low score (40%)');
  console.log('  ✅ Dom vs Dom score: 40%');
}

try {
  testCompatibilityEngine();
  testRoleComplementarity();
  console.log('\n────────────────────────────────────────────────────');
  console.log('  Results: All P1.1 Compatibility Tests Passed! ✅');
  console.log('────────────────────────────────────────────────────\n');
} catch (e: any) {
  console.error('\n❌ Test Failure:', e?.message || e);
  process.exit(1);
}
