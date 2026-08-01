/**
 * Phase D vault verification — run with:
 *   npm run test:vault
 *
 * Covers: encrypt/decrypt roundtrip, plaintext migration on unlock,
 * invite guest DEK wrap (#k=), panic wipe completeness.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SEALED_PREFIX,
  VaultSession,
  createVaultMeta,
  verifyPinAgainstMeta,
  sealWithKey,
  openWithKey,
  isSealedBlob,
  isSensitiveStorageKey,
  migratePlaintextBlobsOnUnlock,
  unlockVaultForProfile,
  setupVaultForNewProfile,
  generateInviteSecret,
  generateDataEncryptionKeyBytes,
  wrapDek,
  unwrapDek,
  sealWithDek,
  openWithDek,
  encryptPayload,
  decryptPayload,
  writeStorageValue,
  readStorageValue,
  SENSITIVE_STORAGE_KEYS,
} from '../lib/cryptoVault';

/** Mirrors lib/sessions.parseInviteSecretFromUrl for Node (no expo-router). */
function parseInviteSecretFromUrl(href: string): string | undefined {
  try {
    const u = new URL(href, 'https://compatikink.local');
    const fromQuery = u.searchParams.get('k');
    if (fromQuery) return fromQuery;
    const hash = u.hash.replace(/^#/, '');
    const params = new URLSearchParams(hash.includes('=') ? hash : `k=${hash}`);
    return params.get('k') ?? undefined;
  } catch {
    return undefined;
  }
}

function buildInviteLink(inviteCode: string, inviteSecret?: string): string {
  if (inviteSecret) return `compatikink://guest/${inviteCode}#k=${inviteSecret}`;
  return `compatikink://guest/${inviteCode}`;
}

/**
 * Mirrors lib/storage.panicWipeData key selection + VaultSession.lock
 * (imported storage pulls expo-modules-core; we verify wipe contract here).
 */
async function panicWipeLikeProduction(): Promise<void> {
  VaultSession.lock();
  const keys = await AsyncStorage.getAllKeys();
  const keysToRemove = keys.filter(
    (k) =>
      isSensitiveStorageKey(k) ||
      k.startsWith('initiator_') ||
      k.startsWith('local_sessions') ||
      k.startsWith('scene_agreements_') ||
      k.startsWith('local_user_profiles') ||
      k.startsWith('current_profile_') ||
      k.startsWith('scene_debriefs_') ||
      k.startsWith('guest_draft_') ||
      k.startsWith('guest_profile_') ||
      k.startsWith('private_album_') ||
      k.startsWith('dating_') ||
      k.startsWith('user_wishlist') ||
      k.startsWith('custom_activities') ||
      k.includes('compatikink') ||
      k.includes('vault')
  );
  if (keysToRemove.length > 0) await AsyncStorage.multiRemove(keysToRemove);

  const remaining = await AsyncStorage.getAllKeys();
  const extra = remaining.filter(
    (k) =>
      k.startsWith('ck_') ||
      k === 'initiator_token' ||
      k === 'current_profile_nickname' ||
      k === 'local_user_profiles' ||
      k === 'local_sessions'
  );
  if (extra.length > 0) await AsyncStorage.multiRemove(extra);
}

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string, detail?: string) {
  if (cond) {
    console.log(`  ✅ ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ ${msg}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

async function resetStore() {
  VaultSession.lock();
  const mem = (globalThis as { __vaultTestMemory?: Map<string, string> }).__vaultTestMemory;
  if (mem) mem.clear();
  else await AsyncStorage.clear();
}

async function testRoundtrip() {
  console.log('\n1. Vault roundtrip encrypt/decrypt');
  await resetStore();

  const pin = '4829';
  const { meta, key } = await createVaultMeta(pin);
  assert(!!key, 'createVaultMeta returns CryptoKey');
  assert(meta.kdf === 'PBKDF2-SHA-256', 'vault meta uses PBKDF2-SHA-256');
  assert(typeof meta.saltB64 === 'string' && meta.saltB64.length > 0, 'salt present');
  assert(isSealedBlob(meta.verifierB64), 'verifier is ck1 sealed blob');

  const wrong = await verifyPinAgainstMeta('0000', meta);
  assert(wrong === null, 'wrong PIN rejected');

  const okKey = await verifyPinAgainstMeta(pin, meta);
  assert(!!okKey, 'correct PIN derives key');

  const payload = { hello: 'boveda', n: 42, nested: { a: true } };
  const sealed = await sealWithKey(payload, okKey!);
  assert(sealed.startsWith(SEALED_PREFIX), 'sealed blob has ck1: prefix');
  const opened = await openWithKey<typeof payload>(sealed, okKey!);
  assert(
    opened.hello === payload.hello && opened.n === 42 && opened.nested.a === true,
    'roundtrip preserves JSON payload'
  );

  const passphrase = 'export-pass-phrase';
  const enc = await encryptPayload({ backup: true, items: [1, 2] }, passphrase);
  const dec = await decryptPayload<{ backup: boolean; items: number[] }>(enc, passphrase);
  assert(dec.backup === true && dec.items.length === 2, 'passphrase encryptPayload roundtrip');
}

async function testPlaintextMigration() {
  console.log('\n2. Plaintext migration on unlock');
  await resetStore();

  const plainSessions = JSON.stringify({
    s1: { id: 's1', inviteCode: 'ABC123', status: 'pending' },
  });
  const plainWishlist = JSON.stringify([{ activityId: 'a1', activityName: 'Test' }]);
  await AsyncStorage.setItem('local_sessions', plainSessions);
  await AsyncStorage.setItem('user_wishlist_items', plainWishlist);
  await AsyncStorage.setItem('scene_debriefs_xyz', JSON.stringify([{ id: 'd1' }]));
  await AsyncStorage.setItem('some_ui_flag', '1');

  const pin = '1357';
  const meta = await setupVaultForNewProfile('alice', pin);
  assert(VaultSession.isUnlocked(), 'vault unlocked after setup');
  assert(!!meta.saltB64 && !!meta.verifierB64, 'new profile vault meta created');

  const migrated = await migratePlaintextBlobsOnUnlock();
  assert(migrated === 0, 'second migrate is idempotent (0)');

  const rawSessions = await AsyncStorage.getItem('local_sessions');
  const rawWish = await AsyncStorage.getItem('user_wishlist_items');
  const rawDebrief = await AsyncStorage.getItem('scene_debriefs_xyz');
  assert(!!rawSessions && isSealedBlob(rawSessions), 'local_sessions sealed after unlock migrate');
  assert(!!rawWish && isSealedBlob(rawWish), 'user_wishlist_items sealed after unlock migrate');
  assert(!!rawDebrief && isSealedBlob(rawDebrief), 'prefixed scene_debriefs_ sealed');
  assert((await AsyncStorage.getItem('some_ui_flag')) === '1', 'non-sensitive key left plaintext');

  const sessionsOpen = await readStorageValue('local_sessions');
  assert(sessionsOpen === plainSessions, 'opened sessions match original plaintext JSON');

  await resetStore();
  await AsyncStorage.setItem('dating_direct_messages', JSON.stringify({ chat: 'hi' }));
  const legacy = await unlockVaultForProfile('bob', '9991', { pin: '9991' });
  assert(legacy.migratedFromLegacyPin === true, 'legacy plaintext pin migrates to vault meta');
  const dm = await AsyncStorage.getItem('dating_direct_messages');
  assert(!!dm && isSealedBlob(dm), 'DM blob sealed on legacy unlock');
  assert(
    (SENSITIVE_STORAGE_KEYS as readonly string[]).includes('dating_direct_messages'),
    'dating_direct_messages listed as sensitive'
  );
}

async function testInviteGuestEncrypt() {
  console.log('\n3. Invite guest encrypt/decrypt with #k=');
  await resetStore();

  const inviteSecret = generateInviteSecret();
  assert(inviteSecret.length >= 32, 'invite secret is high-entropy');
  assert(!inviteSecret.includes('+') && !inviteSecret.includes('/'), 'invite secret URL-safe');

  const link = buildInviteLink('XY9Z2K', inviteSecret);
  assert(link.includes('#k='), 'invite link embeds #k= fragment');

  const href = `https://m1976cl-web.github.io/compatikink/guest/XY9Z2K#k=${inviteSecret}`;
  const fromHash = parseInviteSecretFromUrl(href);
  assert(fromHash === inviteSecret, 'parseInviteSecretFromUrl reads #k=');

  const fromQuery = parseInviteSecretFromUrl(
    `https://m1976cl-web.github.io/compatikink/guest/XY9Z2K?k=${inviteSecret}`
  );
  assert(fromQuery === inviteSecret, 'parseInviteSecretFromUrl reads ?k=');

  const dekRaw = generateDataEncryptionKeyBytes();
  assert(dekRaw.length === 32, 'DEK is 32 bytes');

  const wrap = await wrapDek(dekRaw, inviteSecret);
  assert(isSealedBlob(wrap), 'DEK wrap is ck1 blob');
  const unwrapped = await unwrapDek(wrap, inviteSecret);
  assert(
    Buffer.from(unwrapped).equals(Buffer.from(dekRaw)),
    'unwrapDek recovers DEK with invite secret'
  );

  const guestPayload = {
    guestNickname: 'Guest',
    responses: { act1: { interest: 4, experience: 2 } },
    profile: { role: 'switch' },
  };
  const guestCipher = await sealWithDek(guestPayload, dekRaw);
  assert(isSealedBlob(guestCipher), 'guest payload sealed with DEK');
  const opened = await openWithDek<typeof guestPayload>(guestCipher, unwrapped);
  assert(
    opened.guestNickname === 'Guest' && opened.responses.act1.interest === 4,
    'host can decrypt guest ciphertext with unwrapped DEK'
  );

  let failedWrong = false;
  try {
    await unwrapDek(wrap, 'wrong-secret');
  } catch {
    failedWrong = true;
  }
  assert(failedWrong, 'wrong invite secret cannot unwrap DEK');
}

async function testPanicWipe() {
  console.log('\n4. Panic wipe completeness');
  await resetStore();

  const pin = '2468';
  await setupVaultForNewProfile('wipe-me', pin);
  await writeStorageValue('local_sessions', JSON.stringify({ keep: false }));
  await writeStorageValue('private_album_photos_v1', JSON.stringify([{ id: 1 }]));
  await AsyncStorage.setItem(
    'local_user_profiles',
    JSON.stringify({ 'wipe-me': { nickname: 'wipe-me' } })
  );
  await AsyncStorage.setItem('current_profile_nickname', 'wipe-me');
  await AsyncStorage.setItem('initiator_token', 'tok-123');
  await AsyncStorage.setItem('scene_agreements_abc', '{}');
  await AsyncStorage.setItem('guest_draft_xyz', '{}');
  await AsyncStorage.setItem('user_wishlist_items', '[]');
  await AsyncStorage.setItem('dating_direct_messages', '{}');
  await AsyncStorage.setItem('ck_extra_flag', '1');
  await AsyncStorage.setItem('harmless_theme_pref', 'dark');

  assert(VaultSession.isUnlocked(), 'vault unlocked before wipe');

  await panicWipeLikeProduction();

  assert(!VaultSession.isUnlocked(), 'VaultSession locked after panic wipe');
  assert(VaultSession.getKeyOrNull() === null, 'vault key cleared from RAM');

  const remaining = await AsyncStorage.getAllKeys();
  const mustBeGone = [
    'local_sessions',
    'private_album_photos_v1',
    'local_user_profiles',
    'current_profile_nickname',
    'initiator_token',
    'scene_agreements_abc',
    'guest_draft_xyz',
    'user_wishlist_items',
    'dating_direct_messages',
    'ck_extra_flag',
  ];
  for (const k of mustBeGone) {
    assert(!remaining.includes(k), `wiped key removed: ${k}`);
  }
  assert(
    remaining.every((k) => !mustBeGone.includes(k)),
    'no sensitive keys remain after wipe'
  );
  assert(remaining.includes('harmless_theme_pref'), 'non-sensitive prefs can survive wipe');
}

async function main() {
  console.log('====================================================');
  console.log('  COMPATIKINK — Vault / ZK verify suite');
  console.log('====================================================');

  try {
    await testRoundtrip();
    await testPlaintextMigration();
    await testInviteGuestEncrypt();
    await testPanicWipe();
  } catch (err) {
    console.error('\nUnhandled error:', err);
    failed++;
  }

  console.log('\n----------------------------------------------------');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('----------------------------------------------------');
  if (failed > 0) process.exit(1);
}

main();
