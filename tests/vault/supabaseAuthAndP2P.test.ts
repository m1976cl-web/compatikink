/**
 * Supabase Auth, P2P Pairing, Push Notifications & Biometric Contracts Test Suite
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { VaultSession, setupVaultForNewProfile } from '../../lib/cryptoVault';
import { generateP2PSharePayload, parseAndDecryptP2PPayload } from '../../lib/p2pPairing';
import { loadPushPreferences, savePushPreferences } from '../../lib/pushNotifications';
import { isSupabaseConfigured } from '../../lib/supabase';
import { UserProfile, ActivityResponse } from '../../types';

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

async function runSuite() {
  console.log('\n====================================================');
  console.log('  SUPABASE GOOGLE AUTH, P2P & ADVANCED SUITE');
  console.log('====================================================\n');

  await AsyncStorage.clear();
  VaultSession.lock();
  await setupVaultForNewProfile('tester_p2p', '123456');

  // 1. Supabase Client Configuration Status
  console.log('--- 1. Supabase Client Configuration Status ---');
  assert(
    typeof isSupabaseConfigured === 'boolean',
    'isSupabaseConfigured returns boolean status'
  );

  // 2. P2P Offline Pairing & Payload Decryption
  console.log('\n--- 2. P2P Offline Pairing & Payload Decryption ---');
  const mockProfile: UserProfile = { nickname: 'Alice_Dom', allowPublicComparison: true };
  const mockResponses: ActivityResponse[] = [
    { activityId: 'pe_d/s_dynamic', rating: 'love', role: 'give', intensity: 5 },
    { activityId: 'bo_rope', rating: 'like', role: 'flexible', intensity: 4 },
  ];
  const secretKey = 'chilean_pair_secret_2026';

  const payload = await generateP2PSharePayload(mockProfile, mockResponses, secretKey);
  assert(payload.startsWith('ckp2p:'), 'Generated P2P payload has ckp2p: prefix');

  const decrypted = await parseAndDecryptP2PPayload(payload, secretKey);
  assert(decrypted.senderNickname === 'Alice_Dom', 'P2P sender nickname decrypted correctly');
  assert(decrypted.responses.length === 2, 'P2P responses decrypted matching length');
  assert(decrypted.responses[0].rating === 'love', 'P2P response rating preserved after decryption');

  // 3. Push Notifications Preference Storage
  console.log('\n--- 3. Push Notifications Preferences ---');
  const initialPrefs = await loadPushPreferences();
  assert(initialPrefs.enabledAftercare === true, 'Default Aftercare Push enabled');

  await savePushPreferences({ ...initialPrefs, enabledDsTasks: false });
  const updatedPrefs = await loadPushPreferences();
  assert(updatedPrefs.enabledDsTasks === false, 'Updated push preferences persisted');

  console.log(`\n====================================================`);
  console.log(`Suite Results: ${passed} passed, ${failed} failed`);
  console.log(`====================================================\n`);

  if (failed > 0) process.exit(1);
}

runSuite().catch((err) => {
  console.error('Unhandled error in Advanced Suite:', err);
  process.exit(1);
});
