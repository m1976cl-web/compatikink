/**
 * tests/vault.canary.test.ts — Unit Test Suite for Canary PIN Anti-Coerción (#13)
 * Run with: pnpm run test:vault:canary
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setupVaultForNewProfile,
  setupCanaryPin,
  unlockVaultForProfile,
  writeStorageValue,
  readStorageValue,
  VaultSession,
  isSealedBlob,
  VaultLockGateAPI,
} from '../lib/cryptoVault';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

async function runCanaryTests() {
  console.log('🧪 Executing Canary PIN Anti-Coercion Suite (R2)...\n');
  let passedCount = 0;

  const test = (name: string, fn: () => void | Promise<void>) => async () => {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passedCount++;
    } catch (e: any) {
      console.error(`  ✕ ${name}: ${e?.message}`);
      throw e;
    }
  };

  // 1. Validation test: setupCanaryPin
  await test('setupCanaryPin enforces min length 4', async () => {
    try {
      await setupCanaryPin('1234', '123');
      assert(false, 'Should have thrown error for length < 4');
    } catch (e: any) {
      assert(e.message.includes('4 dígitos'), 'Expected min length error message');
    }
  })();

  await test('setupCanaryPin enforces canaryPin != primaryPin', async () => {
    try {
      await setupCanaryPin('1234', '1234');
      assert(false, 'Should have thrown error for identical PINs');
    } catch (e: any) {
      assert(e.message.includes('no puede ser idéntico'), 'Expected identical PIN error message');
    }
  })();

  // 2. Full Canary PIN Decoy Flow
  await test('Canary PIN setup, decoy unlock, read isolation, write protection, and master recovery', async () => {
    await AsyncStorage.clear();
    VaultSession.lock();

    const masterPin = '1234';
    const canaryPin = '9999';

    // A. Setup profile with Master PIN
    const masterMeta = await setupVaultForNewProfile('alice', masterPin);
    const canaryMeta = await setupCanaryPin(masterPin, canaryPin, 'decoy');
    const profile = { nickname: 'alice', vaultMeta: masterMeta, duressMeta: canaryMeta };

    // B. Write real sensitive data under Master PIN
    const realWishlistData = JSON.stringify([{ activityId: 'act1', name: 'Real Wish' }]);
    await writeStorageValue('user_wishlist_items', realWishlistData);
    const realDiskBlob = await AsyncStorage.getItem('user_wishlist_items');
    assert(realDiskBlob !== null, 'Disk blob must exist');
    assert(isSealedBlob(realDiskBlob!), 'Real wishlist stored as sealed ck1 blob');

    // C. Lock vault
    VaultSession.lock();
    assert(VaultSession.getSnapshot().unlocked === false, 'Vault locked');
    assert(VaultSession.getSnapshot().isDecoy === false, 'isDecoy is false when locked');

    // D. Unlock with Canary PIN '9999'
    const res = await unlockVaultForProfile('alice', canaryPin, profile);
    assert(res.isDuress === true, 'Canary PIN returns isDuress: true');
    assert(res.duressAction === 'decoy', 'Duress action is decoy');
    assert(VaultSession.getSnapshot().unlocked === true, 'Vault unlocked in decoy mode');
    assert(VaultSession.getSnapshot().isDecoy === true, 'VaultSession reports isDecoy = true');
    assert(VaultLockGateAPI.isDecoyMode() === true, 'VaultLockGateAPI.isDecoyMode() is true');

    // E. Read sensitive data in Decoy Mode -> Intercepted, returns static empty state without AES-GCM decryption errors
    const decoyWishlist = await readStorageValue('user_wishlist_items');
    assert(decoyWishlist === '[]', 'Decoy mode returns empty array for user_wishlist_items');

    const decoySessions = await readStorageValue('local_sessions');
    assert(decoySessions === '{}', 'Decoy mode returns empty object for local_sessions');

    // F. Attempt write in Decoy Mode -> Real disk blob remains untouched
    await writeStorageValue('user_wishlist_items', JSON.stringify([{ activityId: 'fake', name: 'Fake Wish' }]));
    const diskBlobAfterDecoyWrite = await AsyncStorage.getItem('user_wishlist_items');
    assert(diskBlobAfterDecoyWrite === realDiskBlob, 'Disk blob untouched by decoy write');

    // G. Lock and unlock with Master PIN '1234' -> Real data fully recovered
    VaultSession.lock();
    assert(VaultSession.getSnapshot().isDecoy === false, 'Lock resets isDecoy flag');

    await unlockVaultForProfile('alice', masterPin, profile);
    assert(VaultSession.getSnapshot().isDecoy === false, 'Master PIN unlocks non-decoy mode');
    assert(VaultLockGateAPI.isDecoyMode() === false, 'isDecoyMode is false for Master PIN');

    const restoredWishlist = await readStorageValue('user_wishlist_items');
    assert(restoredWishlist !== null, 'Restored wishlist not null');
    assert(restoredWishlist!.includes('Real Wish'), 'Master PIN reads original encrypted data intact');
  })();

  console.log(`\n🎉 All ${passedCount} Canary PIN tests passed successfully!`);
}

runCanaryTests().catch((err) => {
  console.error('\n💥 Canary PIN test suite failed:', err);
  process.exit(1);
});
