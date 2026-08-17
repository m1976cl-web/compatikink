/**
 * Profile Enhancements Security & Feature Test Suite
 *
 * Empirical verification of:
 * 1. ZK Intimate Media targeted single-user authorization.
 * 2. Blind Secret Crush & Mutual Match Collision.
 * 3. Virtual Date session creation and live safewords.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { VaultSession, setupVaultForNewProfile } from '../../lib/cryptoVault';
import {
  saveAuthorizedMediaItem,
  toggleTargetUserAuthorization,
  canUserViewMedia,
  getMediaForProfileView,
} from '../../lib/authorizedMediaStorage';
import {
  toggleBlindCrush,
  getCrushStatus,
  getAllMutualMatchesForUser,
} from '../../lib/blindCrushManager';
import {
  createVirtualDateSession,
  updateVirtualDateSafeword,
} from '../../lib/virtualDateManager';

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

async function runProfileEnhancementsSuite() {
  console.log('\n====================================================');
  console.log('  PROFILE ENHANCEMENTS TEST SUITE');
  console.log('====================================================\n');

  await AsyncStorage.clear();
  VaultSession.lock();

  await setupVaultForNewProfile('user_alpha', '123456');

  // --------------------------------------------------------------------------
  // 1. ZK TARGETED MEDIA AUTHORIZATION
  // --------------------------------------------------------------------------
  console.log('--- 1. Intimate Media Targeted Single-User Authorization ---');

  const photoItem = {
    id: 'photo_1',
    ownerNickname: 'user_alpha',
    title: 'Shibari Art',
    mediaType: 'photo' as const,
    uri: 'https://example.com/photo.jpg',
    isPrivateVault: true,
    authorizedTargetNicknames: ['user_beta'],
    createdAt: new Date().toISOString(),
  };

  await saveAuthorizedMediaItem(photoItem);

  assert(
    canUserViewMedia(photoItem, 'user_alpha'),
    'Owner can view their own private photo'
  );
  assert(
    canUserViewMedia(photoItem, 'user_beta'),
    'Authorized user_beta can view photo'
  );
  assert(
    !canUserViewMedia(photoItem, 'user_charlie'),
    'Unauthorized user_charlie CANNOT view photo'
  );

  // Toggle authorization for user_charlie
  const { isAuthorizedNow } = await toggleTargetUserAuthorization('photo_1', 'user_charlie');
  assert(isAuthorizedNow, 'user_charlie granted explicit authorization');

  const { visibleMedia, totalPrivateCount } = await getMediaForProfileView('user_alpha', 'user_charlie');
  assert(totalPrivateCount === 1, 'Total private count is 1');
  assert(visibleMedia.length === 1, 'user_charlie can now see photo in profile view');

  // --------------------------------------------------------------------------
  // 2. BLIND SECRET CRUSH & MUTUAL MATCH COLLISION
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Blind Secret Crush & Mutual Match Collision ---');

  // User Alpha crushes on User Beta (blind)
  const crush1 = await toggleBlindCrush('user_alpha', 'user_beta');
  assert(crush1.isCrushActiveNow, 'Alpha set crush on Beta');
  assert(!crush1.isMutualMatch, 'Crush is blind (not mutual yet)');

  const statusBefore = await getCrushStatus('user_beta', 'user_alpha');
  assert(!statusBefore.hasCrushOnTarget, 'Beta has no knowledge of Alpha crush');

  // User Beta reciprocates crush on User Alpha -> MATCH COLLISION!
  const crush2 = await toggleBlindCrush('user_beta', 'user_alpha');
  assert(crush2.isMutualMatch, 'Mutual Crush Collision triggered upon bidirectional match!');

  const mutuals = await getAllMutualMatchesForUser('user_alpha');
  assert(mutuals.includes('user_beta'), 'user_beta listed in mutual crush matches for user_alpha');

  // --------------------------------------------------------------------------
  // 3. VIRTUAL DATE SESSION & SAFEWORDS
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Virtual Date Session & Safewords ---');

  const dateSession = await createVirtualDateSession('user_alpha', 'user_beta');
  assert(dateSession.status === 'active', 'Virtual Date created with active status');
  assert(dateSession.currentSafeword === 'green', 'Initial safeword is green');

  const pausedSession = await updateVirtualDateSafeword(dateSession.id, 'red');
  assert(pausedSession?.status === 'safeword_paused', 'Safeword Red pauses Virtual Date session');

  console.log(`\n====================================================`);
  console.log(`Profile Enhancements Results: ${passed} passed, ${failed} failed`);
  console.log(`====================================================\n`);

  if (failed > 0) process.exit(1);
}

runProfileEnhancementsSuite().catch((err) => {
  console.error('Unhandled error in Profile Enhancements Suite:', err);
  process.exit(1);
});
