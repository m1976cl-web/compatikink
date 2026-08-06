import assert from 'node:assert/strict';
import { createLocalSession, saveGuestProfile, purgeAllUserData } from '../lib/storage';
import { UserProfile } from '../types';
import { generateReport } from '../lib/compatibility';

console.log('════════════════════════════════════════════════════');
console.log('  COMPATIKINK — E2E Integration Flow Test Suite (P1.2)');
console.log('════════════════════════════════════════════════════\n');

async function testFullIntegrationFlow() {
  console.log('1. Simulating Host Profile & ZK Session creation...');

  const hostProfile: UserProfile = {
    nickname: 'MorganHost',
    role: 'Dom',
    experienceLevel: 'advanced',
    baseResponses: [
      { activityId: 'pe_d/s_dynamic', rating: 'love', role: 'give', intensity: 4 },
      { activityId: 'bo_rope', rating: 'hard_limit', role: 'flexible', intensity: 1 },
    ],
  };

  const session = await createLocalSession(
    hostProfile.nickname,
    hostProfile.baseResponses!,
    hostProfile
  );

  assert.ok(session.id, 'Session ID must be generated');
  assert.ok(session.initiatorToken, 'Initiator token must be present');
  assert.equal(session.initiatorNickname, 'MorganHost');
  assert.equal(session.status, 'waiting');
  console.log(`  ✅ Session created with ID: ${session.id}`);

  console.log('\n2. Simulating Guest Join & Response Submission...');
  const guestProfile: UserProfile = {
    nickname: 'AlexGuest',
    role: 'Sub',
    experienceLevel: 'intermediate',
    baseResponses: [
      { activityId: 'pe_d/s_dynamic', rating: 'love', role: 'receive', intensity: 4 },
      { activityId: 'bo_rope', rating: 'like', role: 'receive', intensity: 2 },
    ],
  };

  await saveGuestProfile(session.id, {
    nickname: guestProfile.nickname,
    notes: 'Respuesta completada en la integración',
  });
  console.log('  ✅ Guest profile attached to session');

  console.log('\n3. Generating Compatibility Report...');
  const report = generateReport(
    session.id,
    hostProfile.baseResponses!,
    guestProfile.baseResponses!,
    hostProfile,
    guestProfile
  );

  assert.ok(report.compatibilityScore > 0, 'Report compatibility score calculated');
  console.log(`  ✅ Report generated. Match score: ${report.compatibilityScore}%`);

  console.log('\n4. Testing P0.4 Data Purge ("Right to Be Forgotten")...');
  await purgeAllUserData();
  console.log('  ✅ purgeAllUserData executed without error');
}

testFullIntegrationFlow()
  .then(() => {
    console.log('\n────────────────────────────────────────────────────');
    console.log('  Results: All P1.2 Integration Flow Tests Passed! ✅');
    console.log('────────────────────────────────────────────────────\n');
  })
  .catch((e) => {
    console.error('\n❌ Test Failure:', e?.message || e);
    process.exit(1);
  });
