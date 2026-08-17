/**
 * FetLife Media Privacy & Comparison Test Suite
 *
 * Empirical verification of:
 * 1. Media Privacy Levels: public, friends_only, authorized_only, private_vault.
 * 2. canUserViewMedia permission rules.
 * 3. Direct Comparison Matrix calculation ("Comparate Conmigo").
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { VaultSession, setupVaultForNewProfile } from '../../lib/cryptoVault';
import { AuthorizedMediaItem } from '../../types/profileEnhancements';
import { canUserViewMedia, saveAuthorizedMediaItem } from '../../lib/authorizedMediaStorage';
import { generateReport } from '../../lib/compatibility';
import { ActivityResponse, UserProfile } from '../../types';

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

async function runFetlifeMediaAndComparisonSuite() {
  console.log('\n====================================================');
  console.log('  FETLIFE MEDIA PRIVACY & COMPARISON TEST SUITE');
  console.log('====================================================\n');

  await AsyncStorage.clear();
  VaultSession.lock();

  await setupVaultForNewProfile('alex_test', '666666');

  // 1. FetLife Media Privacy Levels Verification
  console.log('--- 1. Media Privacy Levels (canUserViewMedia) ---');

  const publicPhoto: AuthorizedMediaItem = {
    id: 'm1',
    ownerNickname: 'alex_test',
    title: 'Public Photo',
    mediaType: 'photo',
    uri: 'https://example.com/p1.jpg',
    isPrivateVault: false,
    privacyLevel: 'public',
    authorizedTargetNicknames: [],
    createdAt: new Date().toISOString(),
  };

  const friendsOnlyPhoto: AuthorizedMediaItem = {
    id: 'm2',
    ownerNickname: 'alex_test',
    title: 'Friends Only Photo',
    mediaType: 'photo',
    uri: 'https://example.com/p2.jpg',
    isPrivateVault: true,
    privacyLevel: 'friends_only',
    authorizedTargetNicknames: [],
    createdAt: new Date().toISOString(),
  };

  const authorizedOnlyPhoto: AuthorizedMediaItem = {
    id: 'm3',
    ownerNickname: 'alex_test',
    title: 'Authorized Only Photo',
    mediaType: 'photo',
    uri: 'https://example.com/p3.jpg',
    isPrivateVault: true,
    privacyLevel: 'authorized_only',
    authorizedTargetNicknames: ['sam_friend'],
    createdAt: new Date().toISOString(),
  };

  const privateVaultPhoto: AuthorizedMediaItem = {
    id: 'm4',
    ownerNickname: 'alex_test',
    title: 'Private Vault Photo',
    mediaType: 'photo',
    uri: 'https://example.com/p4.jpg',
    isPrivateVault: true,
    privacyLevel: 'private_vault',
    authorizedTargetNicknames: [],
    createdAt: new Date().toISOString(),
  };

  // Assert public photo
  assert(canUserViewMedia(publicPhoto, 'random_stranger', false), 'Public photo visible to anyone');

  // Assert friends_only photo
  assert(!canUserViewMedia(friendsOnlyPhoto, 'random_stranger', false), 'Friends-only photo hidden from stranger');
  assert(canUserViewMedia(friendsOnlyPhoto, 'mutual_friend', true), 'Friends-only photo visible to mutual friend');

  // Assert authorized_only photo
  assert(!canUserViewMedia(authorizedOnlyPhoto, 'random_stranger', false), 'Authorized-only photo hidden from stranger');
  assert(canUserViewMedia(authorizedOnlyPhoto, 'sam_friend', false), 'Authorized-only photo visible to authorized nickname sam_friend');

  // Assert private_vault photo
  assert(!canUserViewMedia(privateVaultPhoto, 'sam_friend', true), 'Private vault photo hidden from all external viewers');
  assert(canUserViewMedia(privateVaultPhoto, 'alex_test', false), 'Owner can always view their own private vault photo');

  // 2. "Comparate Conmigo" Direct Comparison Engine
  console.log('\n--- 2. "Comparate Conmigo" Direct Comparison Engine ---');

  const myProfile: UserProfile = { nickname: 'alex_test', allowPublicComparison: true };
  const targetProfile: UserProfile = { nickname: 'sam_friend', allowPublicComparison: true };

  const myResp: ActivityResponse[] = [
    { activityId: 'bo_rope', rating: 'love', role: 'both', intensity: 4 },
    { activityId: 'im_spanking', rating: 'like', role: 'flexible', intensity: 3 },
  ];

  const targetResp: ActivityResponse[] = [
    { activityId: 'bo_rope', rating: 'love', role: 'both', intensity: 4 },
    { activityId: 'im_spanking', rating: 'like', role: 'flexible', intensity: 3 },
  ];

  const compReport = generateReport(
    'comp_direct_1',
    myResp,
    targetResp,
    myProfile,
    targetProfile
  );

  assert(compReport !== null, 'Direct comparison report generated');
  assert(compReport.compatibilityScore >= 80, 'High compatibility score for complementary roles');
  assert(compReport.items.some((i) => i.section === 'mutual_match'), 'Mutual matches identified in direct comparison');

  console.log(`\n====================================================`);
  console.log(`FetLife Media & Comparison Results: ${passed} passed, ${failed} failed`);
  console.log(`====================================================\n`);

  if (failed > 0) process.exit(1);
}

runFetlifeMediaAndComparisonSuite().catch((err) => {
  console.error('Unhandled error in Fetlife Media & Comparison Suite:', err);
  process.exit(1);
});
