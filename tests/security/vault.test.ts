/**
 * Vault Security Test Suite
 * Tests for cryptoVault.ts seal/open round-trip, PIN verification, duress, and lockout.
 */
import {
  sealWithKey,
  openWithKey,
  deriveVaultKey,
  randomBytes,
  createVaultMeta,
  verifyPinAgainstMeta,
  createDuressMeta,
  verifyDuressPin,
  recordFailedPinAttempt,
  clearPinLockoutAttempts,
  getPinLockoutStatus,
  isSealedBlob,
  SEALED_PREFIX,
  bytesToBase64,
  base64ToBytes,
  PBKDF2_ITERATIONS,
} from '@/lib/cryptoVault';

// Use a small iteration count for test speed
const TEST_ITERATIONS = 1000;

describe('CryptoVault — Seal / Open Round-Trip', () => {
  let testKey: CryptoKey;
  const testSalt = randomBytes(16);

  beforeAll(async () => {
    testKey = await deriveVaultKey('test-pin-1234', testSalt, TEST_ITERATIONS);
  });

  it('seals and opens a string payload', async () => {
    const payload = 'hello world';
    const sealed = await sealWithKey(payload, testKey);
    expect(sealed.startsWith(SEALED_PREFIX)).toBe(true);
    const opened = await openWithKey<string>(sealed, testKey);
    expect(opened).toBe(payload);
  });

  it('seals and opens a JSON object payload', async () => {
    const payload = { name: 'test', data: [1, 2, 3], nested: { a: true } };
    const sealed = await sealWithKey(payload, testKey);
    const opened = await openWithKey<typeof payload>(sealed, testKey);
    expect(opened).toEqual(payload);
  });

  it('produces different ciphertext for same payload (random IV)', async () => {
    const payload = 'same content';
    const sealed1 = await sealWithKey(payload, testKey);
    const sealed2 = await sealWithKey(payload, testKey);
    expect(sealed1).not.toBe(sealed2);
  });

  it('fails to open with wrong key', async () => {
    const wrongKey = await deriveVaultKey('wrong-pin', testSalt, TEST_ITERATIONS);
    const sealed = await sealWithKey('secret', testKey);
    await expect(openWithKey(sealed, wrongKey)).rejects.toThrow();
  });

  it('detects sealed blobs correctly', () => {
    expect(isSealedBlob('ck1:abc')).toBe(true);
    expect(isSealedBlob('plaintext')).toBe(false);
    expect(isSealedBlob(null)).toBe(false);
    expect(isSealedBlob(undefined)).toBe(false);
    expect(isSealedBlob('')).toBe(false);
  });
});

describe('CryptoVault — PIN Verification', () => {
  it('verifies correct PIN against meta', async () => {
    const pin = 'my-secure-pin';
    const { meta } = await createVaultMeta(pin);
    const key = await verifyPinAgainstMeta(pin, meta);
    expect(key).not.toBeNull();
  });

  it('rejects incorrect PIN against meta', async () => {
    const { meta } = await createVaultMeta('correct-pin');
    const key = await verifyPinAgainstMeta('wrong-pin', meta);
    expect(key).toBeNull();
  });
});

describe('CryptoVault — Duress PIN', () => {
  it('creates and verifies duress meta', async () => {
    const duressMeta = await createDuressMeta('panic-1234', 'decoy');
    expect(duressMeta.action).toBe('decoy');
    const isValid = await verifyDuressPin('panic-1234', duressMeta);
    expect(isValid).toBe(true);
  });

  it('rejects wrong duress PIN', async () => {
    const duressMeta = await createDuressMeta('panic-1234', 'wipe');
    const isValid = await verifyDuressPin('wrong-pin', duressMeta);
    expect(isValid).toBe(false);
  });
});

describe('CryptoVault — PIN Lockout', () => {
  const testUser = 'lockout-test-user';

  beforeEach(async () => {
    await clearPinLockoutAttempts(testUser);
  });

  it('starts with no lockout', async () => {
    const status = await getPinLockoutStatus(testUser);
    expect(status.isLockedOut).toBe(false);
    expect(status.attemptsLeft).toBe(5);
  });

  it('tracks failed attempts', async () => {
    await recordFailedPinAttempt(testUser);
    await recordFailedPinAttempt(testUser);
    const status = await getPinLockoutStatus(testUser);
    expect(status.attemptsLeft).toBe(3);
  });

  it('locks out after 3 failed attempts (short lockout)', async () => {
    await recordFailedPinAttempt(testUser);
    await recordFailedPinAttempt(testUser);
    const result = await recordFailedPinAttempt(testUser);
    expect(result.isLockedOut).toBe(true);
    expect(result.remainingSeconds).toBeGreaterThan(0);
  });

  it('clears lockout', async () => {
    await recordFailedPinAttempt(testUser);
    await recordFailedPinAttempt(testUser);
    await recordFailedPinAttempt(testUser);
    await clearPinLockoutAttempts(testUser);
    const status = await getPinLockoutStatus(testUser);
    expect(status.isLockedOut).toBe(false);
    expect(status.attemptsLeft).toBe(5);
  });
});

describe('CryptoVault — Base64 Encoding', () => {
  it('roundtrips bytes correctly', () => {
    const original = randomBytes(64);
    const encoded = bytesToBase64(original);
    const decoded = base64ToBytes(encoded);
    expect(Array.from(decoded)).toEqual(Array.from(original));
  });
});
