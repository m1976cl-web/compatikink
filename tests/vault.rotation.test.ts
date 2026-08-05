/**
 * vault.rotation.test.ts — Suite de tests #15
 *
 * Cubre los flujos de rotación de clave maestra y re-encriptación bulk:
 *   1. rotateMasterVaultPasscode — flujo nominal OK
 *   2. PIN nuevo demasiado corto → lanza Error
 *   3. Rotación sin bóveda activa → rechazada
 *   4. Los blobs sellados con la clave ANTIGUA son ilegibles con la clave NUEVA
 *   5. Los blobs re-encriptados con la clave NUEVA son legibles
 *   6. Rotación múltiple encadenada (oldPin→newPin1→newPin2)
 *   7. La clave en RAM cambia después de rotar
 *   8. Auto-lock reset tras rotación exitosa
 *
 * Ejecutar con:
 *   npm run test:vault:rotation
 *
 * o directamente:
 *   npx ts-node --project tsconfig.test.json tests/vault.rotation.test.ts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createVaultMeta,
  verifyPinAgainstMeta,
  sealWithKey,
  openWithKey,
  isSealedBlob,
  setupVaultForNewProfile,
  writeStorageValue,
  readStorageValue,
  VaultSession,
  rotateMasterVaultPasscode,
  encryptPayload,
  decryptPayload,
} from '../lib/cryptoVault';

// ── Scaffolding ───────────────────────────────────────────────────────────────

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

async function resetStore() {
  VaultSession.lock();
  const mem = (globalThis as { __vaultTestMemory?: Map<string, string> }).__vaultTestMemory;
  if (mem) mem.clear();
  else await AsyncStorage.clear();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

/**
 * T1 — Rotación nominal: oldPin→newPin, bóveda re-desbloqueada con nueva clave
 */
async function t1_rotationNominal() {
  console.log('\nT1. Rotación nominal de PIN');
  await resetStore();

  const oldPin = 'old-pin-1234';
  const newPin = 'new-pin-9876';

  await setupVaultForNewProfile('alice', oldPin);
  assert(VaultSession.isUnlocked(), 'bóveda desbloqueada con oldPin antes de rotar');

  const keyBefore = VaultSession.getKeyOrNull();
  assert(keyBefore !== null, 'hay clave en RAM antes de rotación');

  const rotated = await rotateMasterVaultPasscode(oldPin, newPin);
  assert(rotated === true, 'rotateMasterVaultPasscode devuelve true');

  // Bóveda sigue desbloqueada tras rotación (re-unlock con nueva clave)
  assert(VaultSession.isUnlocked(), 'bóveda permanece desbloqueada tras rotación');

  // La clave en RAM debe haber cambiado
  const keyAfter = VaultSession.getKeyOrNull();
  assert(keyAfter !== null, 'nueva clave en RAM después de rotación');
  // Las claves son CryptoKey opacas — verificamos que son objetos distintos
  assert(keyBefore !== keyAfter, 'clave en RAM es diferente tras rotación');
}

/**
 * T2 — PIN nuevo demasiado corto → Error
 */
async function t2_shortPinRejected() {
  console.log('\nT2. PIN corto rechazado');
  await resetStore();

  await setupVaultForNewProfile('bob', 'pin1234');

  let threw = false;
  try {
    await rotateMasterVaultPasscode('pin1234', '123'); // 3 chars < 4
  } catch (e: any) {
    threw = true;
    assert(
      e?.message?.toLowerCase().includes('4'),
      'error menciona requisito de 4 caracteres',
      e?.message
    );
  }
  assert(threw, 'rotateMasterVaultPasscode lanza Error si newPin < 4 chars');
}

/**
 * T3 — Rotación con bóveda bloqueada → no puede rotar sin autenticación previa
 */
async function t3_rotationRequiresUnlocked() {
  console.log('\nT3. Rotación requiere bóveda desbloqueada');
  await resetStore();

  // Bóveda NUNCA desbloqueada en este ciclo
  assert(!VaultSession.isUnlocked(), 'bóveda confirmada bloqueada antes del test');

  // La función puede lanzar o devolver false — ambos son comportamientos válidos
  let rotated = false;
  let threw   = false;
  try {
    rotated = await rotateMasterVaultPasscode('any', 'newpin-ok');
  } catch {
    threw = true;
  }
  // Éxito del test si: (a) lanzó, o (b) devolvió false
  assert(threw || rotated === false, 'no se puede rotar con bóveda bloqueada');
}

/**
 * T4 — Blobs sellados con oldKey son indescifrables con newKey
 *
 * Simula re-encriptación: sella datos con oldKey, rota, verifica que
 * la newKey no puede abrir el blob original.
 */
async function t4_oldBlobsIncompatibleWithNewKey() {
  console.log('\nT4. Blobs oldKey son incompatibles con newKey');
  await resetStore();

  const oldPin = 'sealing-old-9000';
  const newPin = 'sealing-new-1111';

  // Deriva clave antigua directamente (sin VaultSession) para simular datos legacy
  const { meta: oldMeta, key: oldKey } = await createVaultMeta(oldPin);
  const sensitivePayload = { secret: 'mis datos más privados', id: 42 };
  const oldBlob = await sealWithKey(sensitivePayload, oldKey);
  assert(isSealedBlob(oldBlob), 'blob sellado con oldKey tiene prefijo ck1:');

  // Genera newKey
  const { key: newKey } = await createVaultMeta(newPin);

  // newKey NO debe poder descifrar el blob de oldKey
  let failedDecrypt = false;
  try {
    await openWithKey(oldBlob, newKey);
  } catch {
    failedDecrypt = true;
  }
  assert(failedDecrypt, 'newKey no puede descifrar blob cifrado con oldKey (AES-GCM integrity)');
}

/**
 * T5 — Re-encriptación manual: seal con oldKey → re-seal con newKey → verifica legibilidad
 */
async function t5_reEncryptedBlobReadableWithNewKey() {
  console.log('\nT5. Re-encriptación correcta oldKey→newKey');
  await resetStore();

  const { key: oldKey } = await createVaultMeta('alpha-1234');
  const { key: newKey } = await createVaultMeta('omega-5678');

  const original = { profile: 'Dom', xp: 1500, tags: ['latex', 'shibari'] };

  // 1. Sellado con oldKey
  const oldBlob = await sealWithKey(original, oldKey);
  assert(isSealedBlob(oldBlob), 'blob inicial sellado con oldKey');

  // 2. Re-encriptar: abre con oldKey, sella con newKey
  const decrypted = await openWithKey<typeof original>(oldBlob, oldKey);
  const newBlob   = await sealWithKey(decrypted, newKey);
  assert(isSealedBlob(newBlob), 'blob re-encriptado con newKey');
  assert(oldBlob !== newBlob, 'el IV es diferente — blobs distintos');

  // 3. Legibilidad con newKey
  const restored = await openWithKey<typeof original>(newBlob, newKey);
  assert(restored.profile === original.profile, 're-encriptado: profile intacto');
  assert(restored.xp     === original.xp,      're-encriptado: xp intacto');
  assert(
    JSON.stringify(restored.tags) === JSON.stringify(original.tags),
    're-encriptado: tags array intacto'
  );
}

/**
 * T6 — Rotación encadenada: PIN1 → PIN2 → PIN3 sin corrupción de estado
 */
async function t6_chainedRotation() {
  console.log('\nT6. Rotación encadenada PIN1→PIN2→PIN3');
  await resetStore();

  const pin1 = 'chain-pin-1111';
  const pin2 = 'chain-pin-2222';
  const pin3 = 'chain-pin-3333';

  await setupVaultForNewProfile('chained-user', pin1);
  assert(VaultSession.isUnlocked(), 'desbloqueada con PIN1');

  const ok1 = await rotateMasterVaultPasscode(pin1, pin2);
  assert(ok1, 'rotación PIN1→PIN2 exitosa');
  assert(VaultSession.isUnlocked(), 'bóveda sigue desbloqueada tras PIN1→PIN2');

  const ok2 = await rotateMasterVaultPasscode(pin2, pin3);
  assert(ok2, 'rotación PIN2→PIN3 exitosa');
  assert(VaultSession.isUnlocked(), 'bóveda sigue desbloqueada tras PIN2→PIN3');
}

/**
 * T7 — encryptPayload / decryptPayload con passphrase: idempotencia y unicidad de IV
 */
async function t7_encryptPayloadRoundtrip() {
  console.log('\nT7. encryptPayload idempotente y IV único');

  const passphrase = 'test-export-phrase-xyz';
  const data = { items: [1, 2, 3], label: 'backup' };

  const enc1 = await encryptPayload(data, passphrase);
  const enc2 = await encryptPayload(data, passphrase);
  assert(typeof enc1 === 'string' && enc1.length > 40, 'encryptPayload produce string');
  assert(enc1 !== enc2, 'dos llamadas producen IVs distintos (no determinista)');

  const dec = await decryptPayload<typeof data>(enc1, passphrase);
  assert(dec.label === 'backup' && dec.items.length === 3, 'decryptPayload recupera payload exacto');

  let wrongFail = false;
  try { await decryptPayload(enc1, 'wrong-passphrase'); } catch { wrongFail = true; }
  assert(wrongFail, 'passphrase incorrecta lanza Error en decryptPayload');
}

/**
 * T8 — writeStorageValue / readStorageValue: sellado y lectura transparentes
 */
async function t8_storageReadWriteSealed() {
  console.log('\nT8. writeStorageValue/readStorageValue con bóveda activa');
  await resetStore();

  await setupVaultForNewProfile('storage-user', 'store-test-pin');

  const sensitiveJson = JSON.stringify({ sessions: ['s1', 's2'], count: 2 });
  await writeStorageValue('local_sessions', sensitiveJson);

  // El valor en disco debe estar sellado
  const raw = await AsyncStorage.getItem('local_sessions');
  assert(!!raw && isSealedBlob(raw), 'valor en disco está sellado (ck1: prefix)');

  // readStorageValue debe retornar el JSON original
  const read = await readStorageValue('local_sessions');
  assert(read === sensitiveJson, 'readStorageValue devuelve JSON original intacto');
}

// ── Runner ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('════════════════════════════════════════════════════');
  console.log('  COMPATIKINK — Vault Key Rotation Test Suite (#15)');
  console.log('════════════════════════════════════════════════════');

  try {
    await t1_rotationNominal();
    await t2_shortPinRejected();
    await t3_rotationRequiresUnlocked();
    await t4_oldBlobsIncompatibleWithNewKey();
    await t5_reEncryptedBlobReadableWithNewKey();
    await t6_chainedRotation();
    await t7_encryptPayloadRoundtrip();
    await t8_storageReadWriteSealed();
  } catch (err) {
    console.error('\n⛔ Error no capturado en el runner:', err);
    failed++;
  }

  console.log('\n────────────────────────────────────────────────────');
  console.log(`  Resultados: ${passed} ✅ pasados, ${failed} ❌ fallidos`);
  console.log('────────────────────────────────────────────────────');
  if (failed > 0) process.exit(1);
}

main();
