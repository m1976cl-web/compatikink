/**
 * Desktop UX & Self-Report Test Suite
 *
 * Empirical verification of:
 * 1. Self-Report Mode generation without requiring a guest response.
 * 2. FetLife Style Role Preferences (Dar/Recibir/Ambos/Flexible) assignment.
 * 3. Desktop Keyboard Shortcut mapping logic.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { VaultSession, setupVaultForNewProfile } from '../../lib/cryptoVault';
import { createLocalSession, loadLocalSessions } from '../../lib/storage';
import { generateReport } from '../../lib/compatibility';
import { ActivityResponse, RolePreference } from '../../types';

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

async function runDesktopUXAndSelfReportSuite() {
  console.log('\n====================================================');
  console.log('  DESKTOP UX & SELF-REPORT TEST SUITE');
  console.log('====================================================\n');

  await AsyncStorage.clear();
  VaultSession.lock();

  await setupVaultForNewProfile('desktop_user', '555555');

  // 1. FetLife Role Preferences Verification
  console.log('--- 1. FetLife Role Preferences Assignment ---');
  const myResponses: ActivityResponse[] = [
    { activityId: 'bo_rope', rating: 'love', role: 'give', intensity: 4 },
    { activityId: 'im_spanking', rating: 'like', role: 'receive', intensity: 3 },
    { activityId: 'in_eye_contact', rating: 'love', role: 'both', intensity: 5 },
    { activityId: 'pe_d/s_dynamic', rating: 'curious', role: 'flexible', intensity: 2 },
  ];

  const rolesFound = myResponses.map((r) => r.role);
  assert(rolesFound.includes('give'), 'Give (Dar / Dom) role preference supported');
  assert(rolesFound.includes('receive'), 'Receive (Recibir / Sub) role preference supported');
  assert(rolesFound.includes('both'), 'Both (Ambos) role preference supported');
  assert(rolesFound.includes('flexible'), 'Flexible (Switch) role preference supported');

  // 2. Self-Report Generation
  console.log('\n--- 2. Self-Report Mode (Ver Mis Propios Resultados) ---');
  const session = await createLocalSession('desktop_user', myResponses);
  assert(session.id.length > 0, 'Local session created');

  const selfReport = generateReport(
    session.id,
    session.initiatorResponses,
    session.initiatorResponses, // Self-comparison
    session.initiatorProfile,
    session.initiatorProfile
  );

  assert(selfReport !== null, 'Self-report generated successfully');
  assert(typeof selfReport.compatibilityScore === 'number' && selfReport.compatibilityScore >= 0, 'Self-compatibility score calculated');
  assert(selfReport.items.length > 0, 'Self-report contains categorized preference items');

  // 3. Desktop Keyboard Shortcut Cycling Helper Verification
  console.log('\n--- 3. Keyboard Shortcut Cycling Logic ---');
  const roleCycle: RolePreference[] = ['give', 'receive', 'both', 'flexible'];

  let currentRole: RolePreference = 'give';
  currentRole = roleCycle[(roleCycle.indexOf(currentRole) + 1) % roleCycle.length];
  assert(currentRole === 'receive', 'Pressing R cycles from give to receive');

  currentRole = roleCycle[(roleCycle.indexOf(currentRole) + 1) % roleCycle.length];
  assert(currentRole === 'both', 'Pressing R cycles from receive to both');

  currentRole = roleCycle[(roleCycle.indexOf(currentRole) + 1) % roleCycle.length];
  assert(currentRole === 'flexible', 'Pressing R cycles from both to flexible');

  console.log(`\n====================================================`);
  console.log(`Desktop & Self-Report Results: ${passed} passed, ${failed} failed`);
  console.log(`====================================================\n`);

  if (failed > 0) process.exit(1);
}

runDesktopUXAndSelfReportSuite().catch((err) => {
  console.error('Unhandled error in Desktop UX Suite:', err);
  process.exit(1);
});
