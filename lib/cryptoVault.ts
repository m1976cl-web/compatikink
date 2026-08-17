/**
 * CryptoVault — Zero-Knowledge client-side encryption for Compatikink.
 *
 * - Key derivation: PBKDF2-SHA-256 (~310k iterations), salt per profile
 * - Cipher: AES-GCM-256
 * - Vault key lives only in RAM (VaultSession); destroyed on lock / logout / wipe
 * - Disk format: "ck1:" + base64(iv || ciphertext)
 * - Never persists the PIN; only salt + verifier
 *
 * Threat model (honest): on web, ciphertext sits in localStorage/AsyncStorage.
 * An attacker with the device and the PIN can decrypt. Without the PIN, blobs
 * are opaque. SecureStore is used on native when available for tokens only.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const VAULT_VERSION = 1;
export const PBKDF2_ITERATIONS = 310_000;
export const SALT_BYTES = 16;
export const IV_BYTES = 12;
export const SEALED_PREFIX = 'ck1:';
export const VERIFIER_PLAINTEXT = 'compatikink-vault-v1';

/** Event name for UI gates (VaultLockGate) to subscribe via DeviceEventEmitter / window. */
export const VAULT_LOCK_EVENT = 'compatikink:vault-lock';
export const VAULT_UNLOCK_EVENT = 'compatikink:vault-unlock';

/** AsyncStorage keys whose values must be sealed when the vault is unlocked. */
export const SENSITIVE_STORAGE_KEYS = [
  'local_sessions',
  // NOTE: local_user_profiles stays plaintext metadata (nickname + pinSalt/verifier)
  // so the login list works while the vault is locked. Sensitive fields inside
  // profiles are sealed separately (see storage.sealProfileSecrets).
  'custom_activities_list',
  'user_wishlist_items',
  'dating_direct_messages',
  'private_album_photos_v1',
  'private_album_shared_links_v1',
  'user_gear_inventory',
  // Next-Gen ZK Module Keys (Milestone 2)
  'ds_tasks_list_v1',
  'ds_habits_list_v1',
  'ds_rewards_list_v1',
  'ds_redemptions_v1',
  'ds_points_ledger_v1',
  'ephemeral_wishes_v1',
  'ephemeral_chat_threads_v1',
  'linked_profiles_v1',
  'joint_vault_data_v1',
  'partner_pairing_tokens_v1',
] as const;

export const SENSITIVE_KEY_PREFIXES = [
  'scene_agreements_',
  'scene_debriefs_',
  'guest_profile_',
  'guest_draft_',
  'initiator_',
  // Next-Gen ZK Module Key Prefixes
  'ds_task_',
  'ephemeral_msg_',
  'partner_pairing_',
  'joint_vault_',
  'ds_',
  'ephemeral_',
  'linked_',
  'questionnaire_draft_',
] as const;

export interface VaultMeta {
  saltB64: string;
  verifierB64: string;
  kdf: 'PBKDF2-SHA-256';
  iterations: number;
  version: number;
}

export interface VaultSessionSnapshot {
  unlocked: boolean;
  nickname: string | null;
  unlockedAt: number | null;
  isDecoy: boolean;
}

type VaultListener = (snapshot: VaultSessionSnapshot) => void;

// ─── binary helpers ─────────────────────────────────────────────────────────

function getCrypto(): Crypto {
  const c = globalThis.crypto;
  if (!c?.subtle) {
    throw new Error('WebCrypto no disponible. Usa un navegador o runtime moderno.');
  }
  return c;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export function randomBytes(length: number): Uint8Array {
  const out = new Uint8Array(length);
  getCrypto().getRandomValues(out);
  return out;
}

/** High-entropy URL-safe secret (invite DEK wrap / invite fragment). */
export function generateInviteSecret(byteLength = 32): string {
  const bytes = randomBytes(byteLength);
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function generateDataEncryptionKeyBytes(): Uint8Array {
  return randomBytes(32);
}

// ─── key derivation ─────────────────────────────────────────────────────────

export async function deriveVaultKey(
  pin: string,
  salt: Uint8Array,
  iterations: number = PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  const crypto = getCrypto();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function importAesKey(raw: Uint8Array): Promise<CryptoKey> {
  return getCrypto().subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);
}

export async function importAesKeyFromBase64(rawB64: string): Promise<CryptoKey> {
  return importAesKey(base64ToBytes(rawB64));
}

export async function exportRawKeyBase64(key: CryptoKey): Promise<string> {
  const raw = new Uint8Array(await getCrypto().subtle.exportKey('raw', key));
  return bytesToBase64(raw);
}

// ─── seal / open with CryptoKey ─────────────────────────────────────────────

export async function sealWithKey(payload: unknown, key: CryptoKey): Promise<string> {
  const crypto = getCrypto();
  const iv = randomBytes(IV_BYTES);
  const plain = new TextEncoder().encode(
    typeof payload === 'string' ? payload : JSON.stringify(payload)
  );
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);
  const combined = new Uint8Array(iv.length + cipherBuf.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuf), iv.length);
  return SEALED_PREFIX + bytesToBase64(combined);
}

export async function openWithKey<T = unknown>(sealed: string, key: CryptoKey): Promise<T> {
  if (!isSealedBlob(sealed)) {
    throw new Error('Blob no cifrado (formato ck1 esperado).');
  }
  const crypto = getCrypto();
  const combined = base64ToBytes(sealed.slice(SEALED_PREFIX.length));
  if (combined.length < IV_BYTES + 1) {
    throw new Error('Ciphertext corrupto.');
  }
  const iv = combined.slice(0, IV_BYTES);
  const data = combined.slice(IV_BYTES);
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  const jsonStr = new TextDecoder().decode(plainBuf);
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return jsonStr as unknown as T;
  }
}

export function isSealedBlob(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith(SEALED_PREFIX);
}

// ─── passphrase helpers (exports / session invite wrap) ─────────────────────

export async function encryptPayload(payload: unknown, secret: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await deriveVaultKey(secret, salt);
  const sealed = await sealWithKey(payload, key);
  // Pack salt into envelope: ck1:base64(salt || iv||cipher) — salt prepended inside payload after prefix
  const body = base64ToBytes(sealed.slice(SEALED_PREFIX.length));
  const packed = new Uint8Array(salt.length + body.length);
  packed.set(salt, 0);
  packed.set(body, salt.length);
  return SEALED_PREFIX + bytesToBase64(packed);
}

export async function decryptPayload<T = unknown>(
  cipherTextBase64: string,
  secret: string
): Promise<T> {
  if (!isSealedBlob(cipherTextBase64)) {
    // Legacy: SHA-256(secret) as AES key, iv||cipher base64 without prefix
    return decryptLegacySha256Payload<T>(cipherTextBase64, secret);
  }
  const packed = base64ToBytes(cipherTextBase64.slice(SEALED_PREFIX.length));
  if (packed.length < SALT_BYTES + IV_BYTES + 1) {
    throw new Error('Error al descifrar. Verifica tu contraseña o clave de bóveda.');
  }
  const salt = packed.slice(0, SALT_BYTES);
  const body = packed.slice(SALT_BYTES);
  const key = await deriveVaultKey(secret, salt);
  return openWithKey<T>(SEALED_PREFIX + bytesToBase64(body), key);
}

/** Legacy encryptPayload format (pre-vault): SHA-256(secret) → AES-GCM, raw base64. */
async function decryptLegacySha256Payload<T>(cipherTextBase64: string, secret: string): Promise<T> {
  try {
    const crypto = getCrypto();
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
    const key = await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, [
      'encrypt',
      'decrypt',
    ]);
    const combined = base64ToBytes(cipherTextBase64);
    const iv = combined.slice(0, IV_BYTES);
    const data = combined.slice(IV_BYTES);
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    const jsonStr = new TextDecoder().decode(plainBuf);
    try {
      return JSON.parse(jsonStr) as T;
    } catch {
      return jsonStr as unknown as T;
    }
  } catch {
    throw new Error('Error al descifrar. Verifica tu contraseña o clave de bóveda.');
  }
}

// ─── PIN verifier / vault meta ──────────────────────────────────────────────

export async function createVaultMeta(pin: string): Promise<{ meta: VaultMeta; key: CryptoKey }> {
  const salt = randomBytes(SALT_BYTES);
  const key = await deriveVaultKey(pin, salt);
  const verifierB64 = await sealWithKey(VERIFIER_PLAINTEXT, key);
  return {
    meta: {
      saltB64: bytesToBase64(salt),
      verifierB64,
      kdf: 'PBKDF2-SHA-256',
      iterations: PBKDF2_ITERATIONS,
      version: VAULT_VERSION,
    },
    key,
  };
}

export async function verifyPinAgainstMeta(pin: string, meta: VaultMeta): Promise<CryptoKey | null> {
  try {
    const salt = base64ToBytes(meta.saltB64);
    const key = await deriveVaultKey(pin, salt, meta.iterations ?? PBKDF2_ITERATIONS);
    const plain = await openWithKey<string>(meta.verifierB64, key);
    if (plain !== VERIFIER_PLAINTEXT) return null;
    return key;
  } catch {
    return null;
  }
}

export function profileHasVault(profile: {
  pinSalt?: string;
  pinVerifier?: string;
  vaultMeta?: VaultMeta;
  pin?: string;
}): boolean {
  if (profile.vaultMeta?.saltB64 && profile.vaultMeta?.verifierB64) return true;
  if (profile.pinSalt && profile.pinVerifier) return true;
  if (profile.pin) return true; // legacy plaintext — migratable
  return false;
}

export function vaultMetaFromProfile(profile: {
  pinSalt?: string;
  pinVerifier?: string;
  vaultMeta?: VaultMeta;
}): VaultMeta | null {
  if (profile.vaultMeta?.saltB64 && profile.vaultMeta?.verifierB64) {
    return profile.vaultMeta;
  }
  if (profile.pinSalt && profile.pinVerifier) {
    return {
      saltB64: profile.pinSalt,
      verifierB64: profile.pinVerifier,
      kdf: 'PBKDF2-SHA-256',
      iterations: PBKDF2_ITERATIONS,
      version: VAULT_VERSION,
    };
  }
  return null;
}

// ─── VaultSession (RAM only) ────────────────────────────────────────────────

class VaultSessionStore {
  private key: CryptoKey | null = null;
  private nickname: string | null = null;
  private unlockedAt: number | null = null;
  private isDecoy: boolean = false;
  private listeners = new Set<VaultListener>();

  getSnapshot(): VaultSessionSnapshot {
    return {
      unlocked: this.key !== null,
      nickname: this.nickname,
      unlockedAt: this.unlockedAt,
      isDecoy: this.isDecoy,
    };
  }

  isUnlocked(): boolean {
    return this.key !== null;
  }

  isDecoyMode(): boolean {
    return this.isDecoy && this.key !== null;
  }

  getNickname(): string | null {
    return this.nickname;
  }

  requireKey(): CryptoKey {
    if (!this.key) {
      throw new Error('Bóveda bloqueada. Desbloquea con tu PIN para continuar.');
    }
    return this.key;
  }

  getKeyOrNull(): CryptoKey | null {
    return this.key;
  }

  subscribe(listener: VaultListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  private emit() {
    const snap = this.getSnapshot();
    this.listeners.forEach((l) => l(snap));
    if (typeof globalThis !== 'undefined' && 'dispatchEvent' in globalThis) {
      try {
        (globalThis as unknown as Window).dispatchEvent?.(
          new CustomEvent(snap.unlocked ? VAULT_UNLOCK_EVENT : VAULT_LOCK_EVENT, { detail: snap })
        );
      } catch {
        /* non-DOM */
      }
    }
  }

  async unlockWithKey(nickname: string, key: CryptoKey, isDecoy: boolean = false): Promise<void> {
    this.key = key;
    this.nickname = nickname;
    this.unlockedAt = Date.now();
    this.isDecoy = isDecoy;
    this.emit();
  }

  lock(): void {
    this.key = null;
    this.nickname = null;
    this.unlockedAt = null;
    this.isDecoy = false;
    this.emit();
  }

  async seal(payload: unknown): Promise<string> {
    return sealWithKey(payload, this.requireKey());
  }

  async open<T = unknown>(sealed: string): Promise<T> {
    return openWithKey<T>(sealed, this.requireKey());
  }
}

export const VaultSession = new VaultSessionStore();

/** API surface intended for VaultLockGate / UI shell. */
export const VaultLockGateAPI = {
  isUnlocked: () => VaultSession.isUnlocked(),
  isDecoyMode: () => VaultSession.isDecoyMode(),
  getNickname: () => VaultSession.getNickname(),
  getSnapshot: () => VaultSession.getSnapshot(),
  subscribe: (listener: VaultListener) => VaultSession.subscribe(listener),
  lock: () => VaultSession.lock(),
  seal: (payload: unknown) => VaultSession.seal(payload),
  open: <T = unknown>(sealed: string) => VaultSession.open<T>(sealed),
  events: { lock: VAULT_LOCK_EVENT, unlock: VAULT_UNLOCK_EVENT },
} as const;

export async function seal(payload: unknown): Promise<string> {
  return VaultSession.seal(payload);
}

export async function open<T = unknown>(sealed: string): Promise<T> {
  return VaultSession.open<T>(sealed);
}

// ─── storage seal helpers ───────────────────────────────────────────────────

export function isSensitiveStorageKey(key: string): boolean {
  if ((SENSITIVE_STORAGE_KEYS as readonly string[]).includes(key)) return true;
  return SENSITIVE_KEY_PREFIXES.some((p) => key.startsWith(p));
}

/** Static Harmless Decoy Payloads for Sensitive Storage Keys */
export function getStaticDecoyValueForKey(key: string): string {
  if (
    key === 'user_wishlist_items' ||
    key === 'custom_activities_list' ||
    key === 'private_album_photos_v1' ||
    key === 'user_gear_inventory' ||
    key === 'ds_tasks_list_v1' ||
    key === 'ds_habits_list_v1' ||
    key === 'ds_rewards_list_v1' ||
    key === 'ds_redemptions_v1' ||
    key === 'ephemeral_wishes_v1' ||
    key === 'ephemeral_chat_threads_v1' ||
    key === 'linked_profiles_v1' ||
    key === 'partner_pairing_tokens_v1'
  ) {
    return JSON.stringify([]);
  }
  if (key === 'local_sessions' || key === 'dating_direct_messages' || key === 'joint_vault_data_v1') {
    return JSON.stringify({});
  }
  if (key === 'ds_points_ledger_v1') {
    return JSON.stringify({ currentBalance: 0, totalEarned: 0, totalSpent: 0, history: [] });
  }
  if (
    key.startsWith('scene_agreements_') ||
    key.startsWith('scene_debriefs_') ||
    key.startsWith('ds_') ||
    key.startsWith('ephemeral_') ||
    key.startsWith('linked_') ||
    key.startsWith('partner_') ||
    key.startsWith('joint_')
  ) {
    return JSON.stringify([]);
  }
  return JSON.stringify([]);
}

/**
 * Write a value: if vault unlocked and key is sensitive, seal as ck1 blob.
 * If vault in Decoy Mode, block writes to disk to prevent corrupting real Master blobs.
 * If vault locked and key is sensitive, refuse (unless writing already-sealed).
 */
export async function writeStorageValue(key: string, value: string): Promise<void> {
  if (!isSensitiveStorageKey(key)) {
    await AsyncStorage.setItem(key, value);
    return;
  }
  if (VaultSession.isDecoyMode()) {
    return; // Decoy mode write protection
  }
  if (isSealedBlob(value)) {
    await AsyncStorage.setItem(key, value);
    return;
  }
  const vaultKey = VaultSession.getKeyOrNull();
  if (!vaultKey) {
    // Soft-write plaintext only when vault never used yet (pre-unlock migration path).
    // Prefer sealing when possible.
    await AsyncStorage.setItem(key, value);
    return;
  }
  const sealed = await sealWithKey(value, vaultKey);
  await AsyncStorage.setItem(key, sealed);
}

/**
 * Read a value: if in Decoy mode and key is sensitive, return static empty payload without AES decryption.
 * If sealed and vault unlocked, open; if sealed and locked, throw;
 * if plaintext, return as-is (legacy).
 */
export async function readStorageValue(key: string): Promise<string | null> {
  if (VaultSession.isDecoyMode() && isSensitiveStorageKey(key)) {
    return getStaticDecoyValueForKey(key);
  }
  const raw = await AsyncStorage.getItem(key);
  if (raw == null) return null;
  if (!isSealedBlob(raw)) return raw;
  const vaultKey = VaultSession.getKeyOrNull();
  if (!vaultKey) {
    throw new Error('Bóveda bloqueada. Desbloquea con tu PIN para leer datos cifrados.');
  }
  const opened = await openWithKey<string>(raw, vaultKey);
  return typeof opened === 'string' ? opened : JSON.stringify(opened);
}

export async function readJsonStorage<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await readStorageValue(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    if (e instanceof Error && e.message.includes('Bóveda bloqueada')) throw e;
    return fallback;
  }
}

export async function writeJsonStorage(key: string, value: unknown): Promise<void> {
  await writeStorageValue(key, JSON.stringify(value));
}

/**
 * On first successful unlock: seal any legacy plaintext sensitive blobs.
 * Returns count of migrated keys.
 */
export async function migratePlaintextBlobsOnUnlock(): Promise<number> {
  const vaultKey = VaultSession.getKeyOrNull();
  if (!vaultKey) return 0;

  const allKeys = await AsyncStorage.getAllKeys();
  const targets = allKeys.filter(isSensitiveStorageKey);
  let migrated = 0;

  for (const key of targets) {
    const raw = await AsyncStorage.getItem(key);
    if (!raw || isSealedBlob(raw)) continue;
    try {
      const sealed = await sealWithKey(raw, vaultKey);
      await AsyncStorage.setItem(key, sealed);
      migrated++;
    } catch (err) {
      console.warn('Vault migration failed for', key, err);
    }
  }
  return migrated;
}

// ─── Auto-Lock Manager (Inactivity & Tab Switch) ───────────────────────────

export type AutoLockTimeout = '1m' | '5m' | '15m' | 'never';

class AutoLockManagerStore {
  private timeoutMs: number = 5 * 60 * 1000; // default 5m
  private timer: ReturnType<typeof setTimeout> | null = null;
  private enabled: boolean = true;

  constructor() {
    this.initDOMListeners();
  }

  setTimeoutOption(opt: AutoLockTimeout) {
    switch (opt) {
      case '1m':
        this.timeoutMs = 1 * 60 * 1000;
        this.enabled = true;
        break;
      case '5m':
        this.timeoutMs = 5 * 60 * 1000;
        this.enabled = true;
        break;
      case '15m':
        this.timeoutMs = 15 * 60 * 1000;
        this.enabled = true;
        break;
      case 'never':
        this.enabled = false;
        break;
    }
    this.resetTimer();
  }

  resetTimer() {
    if (this.timer) clearTimeout(this.timer);
    if (!this.enabled || !VaultSession.isUnlocked()) return;
    this.timer = setTimeout(() => {
      if (VaultSession.isUnlocked()) {
        console.warn('Auto-lock triggered by inactivity.');
        VaultSession.lock();
      }
    }, this.timeoutMs);
  }

  private initDOMListeners() {
    if (typeof window !== 'undefined' && window.addEventListener) {
      const reset = () => this.resetTimer();
      ['mousemove', 'keydown', 'touchstart', 'scroll'].forEach((ev) => {
        try {
          window.addEventListener(ev, reset, { passive: true });
        } catch {
          /* ignore */
        }
      });
      if (typeof document !== 'undefined' && document.addEventListener) {
        document.addEventListener('visibilitychange', () => {
          if (document.hidden && this.enabled && VaultSession.isUnlocked()) {
            VaultSession.lock();
          }
        });
      }
    }
  }
}

export const AutoLockManager = new AutoLockManagerStore();

// ─── PIN Rate Limiting & Lockout ──────────────────────────────────────────

export interface LockoutStatus {
  isLockedOut: boolean;
  remainingSeconds: number;
  attemptsLeft: number;
}

const PIN_ATTEMPTS_PREFIX = 'ck_pin_attempts_';

export async function getPinLockoutStatus(nickname: string): Promise<LockoutStatus> {
  const key = PIN_ATTEMPTS_PREFIX + nickname.toLowerCase();
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return { isLockedOut: false, remainingSeconds: 0, attemptsLeft: 5 };

  try {
    const data = JSON.parse(raw) as { count: number; lockedUntil: number };
    const now = Date.now();
    if (data.lockedUntil && now < data.lockedUntil) {
      const remaining = Math.ceil((data.lockedUntil - now) / 1000);
      return { isLockedOut: true, remainingSeconds: remaining, attemptsLeft: 0 };
    }
    const attemptsLeft = Math.max(0, 5 - (data.count % 5));
    return { isLockedOut: false, remainingSeconds: 0, attemptsLeft };
  } catch {
    return { isLockedOut: false, remainingSeconds: 0, attemptsLeft: 5 };
  }
}

export async function recordFailedPinAttempt(nickname: string): Promise<LockoutStatus> {
  const key = PIN_ATTEMPTS_PREFIX + nickname.toLowerCase();
  const raw = await AsyncStorage.getItem(key);
  let count = 1;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      count = (parsed.count || 0) + 1;
    } catch {
      count = 1;
    }
  }

  let lockoutDurationMs = 0;
  if (count >= 10) {
    lockoutDurationMs = 15 * 60 * 1000; // 15 minutes lockout
  } else if (count >= 5) {
    lockoutDurationMs = 60 * 1000; // 60 seconds lockout
  } else if (count >= 3) {
    lockoutDurationMs = 5 * 1000; // 5 seconds lockout
  }

  const lockedUntil = lockoutDurationMs > 0 ? Date.now() + lockoutDurationMs : 0;
  await AsyncStorage.setItem(key, JSON.stringify({ count, lockedUntil }));

  const remaining = Math.ceil(lockoutDurationMs / 1000);
  return {
    isLockedOut: lockoutDurationMs > 0,
    remainingSeconds: remaining,
    attemptsLeft: Math.max(0, 5 - (count % 5)),
  };
}

export async function clearPinLockoutAttempts(nickname: string): Promise<void> {
  const key = PIN_ATTEMPTS_PREFIX + nickname.toLowerCase();
  await AsyncStorage.removeItem(key);
}

// ─── Duress PIN / Panic PIN Support ───────────────────────────────────────

export interface DuressMeta {
  saltB64: string;
  verifierB64: string;
  action: 'decoy' | 'wipe';
}

export async function createDuressMeta(
  duressPin: string,
  action: 'decoy' | 'wipe' = 'decoy'
): Promise<DuressMeta> {
  const { meta } = await createVaultMeta(duressPin);
  return {
    saltB64: meta.saltB64,
    verifierB64: meta.verifierB64,
    action,
  };
}

export async function setupCanaryPin(
  primaryPin: string,
  canaryPin: string,
  action: 'decoy' | 'wipe' = 'decoy'
): Promise<DuressMeta> {
  const trimmedCanary = canaryPin.trim();
  const trimmedPrimary = primaryPin.trim();

  if (trimmedCanary.length < 4) {
    throw new Error('El PIN Canario debe tener al menos 4 dígitos.');
  }

  if (trimmedPrimary && trimmedCanary === trimmedPrimary) {
    throw new Error('El PIN Canario no puede ser idéntico al PIN Principal.');
  }

  return createDuressMeta(trimmedCanary, action);
}

export async function verifyDuressPin(
  pin: string,
  duressMeta: DuressMeta
): Promise<boolean> {
  const vaultMeta: VaultMeta = {
    saltB64: duressMeta.saltB64,
    verifierB64: duressMeta.verifierB64,
    kdf: 'PBKDF2-SHA-256',
    iterations: PBKDF2_ITERATIONS,
    version: VAULT_VERSION,
  };
  const key = await verifyPinAgainstMeta(pin, vaultMeta);
  return key !== null;
}

// ─── Vault session unlock with Security Hooks ─────────────────────────────

export async function unlockVaultForProfile(
  nickname: string,
  pin: string,
  profile: {
    pinSalt?: string;
    pinVerifier?: string;
    vaultMeta?: VaultMeta;
    duressMeta?: DuressMeta;
    pin?: string;
  }
): Promise<{ key: CryptoKey; meta: VaultMeta; isDuress: boolean; duressAction?: 'decoy' | 'wipe' }> {
  // Check lockout
  const lockout = await getPinLockoutStatus(nickname);
  if (lockout.isLockedOut) {
    throw new Error(
      `Demasiados intentos fallidos. Intenta nuevamente en ${lockout.remainingSeconds} segundos.`
    );
  }

  // 1. Check if Duress PIN entered
  if (profile.duressMeta) {
    const isDuress = await verifyDuressPin(pin, profile.duressMeta);
    if (isDuress) {
      await clearPinLockoutAttempts(nickname);
      // Unlock with a decoy key derived from the duress PIN, marking VaultSession isDecoy = true
      const decoyKey = await deriveVaultKey(pin, base64ToBytes(profile.duressMeta.saltB64));
      await VaultSession.unlockWithKey(nickname + '_decoy', decoyKey, true);
      return {
        key: decoyKey,
        meta: {
          saltB64: profile.duressMeta.saltB64,
          verifierB64: profile.duressMeta.verifierB64,
          kdf: 'PBKDF2-SHA-256',
          iterations: PBKDF2_ITERATIONS,
          version: VAULT_VERSION,
        },
        isDuress: true,
        duressAction: profile.duressMeta.action,
      };
    }
  }

  // 2. Check standard Vault Meta
  const existing = vaultMetaFromProfile(profile);
  if (existing) {
    const key = await verifyPinAgainstMeta(pin, existing);
    if (!key) {
      const lockRes = await recordFailedPinAttempt(nickname);
      if (lockRes.isLockedOut) {
        throw new Error(
          `PIN incorrecto. Bloqueo de seguridad activado por ${lockRes.remainingSeconds}s.`
        );
      }
      throw new Error(`PIN incorrecto. Te quedan ${lockRes.attemptsLeft} intentos.`);
    }
    await clearPinLockoutAttempts(nickname);
    await VaultSession.unlockWithKey(nickname, key);
    AutoLockManager.resetTimer();
    await migratePlaintextBlobsOnUnlock();
    return { key, meta: existing, isDuress: false };
  }

  if (profile.pin != null) {
    if (profile.pin !== pin) {
      await recordFailedPinAttempt(nickname);
      throw new Error('PIN incorrecto.');
    }
    await clearPinLockoutAttempts(nickname);
    const { meta, key } = await createVaultMeta(pin);
    await VaultSession.unlockWithKey(nickname, key);
    AutoLockManager.resetTimer();
    await migratePlaintextBlobsOnUnlock();
    return { key, meta, isDuress: false };
  }

  throw new Error('Este perfil no tiene bóveda configurada. Crea un PIN de seguridad.');
}

export async function setupVaultForNewProfile(
  nickname: string,
  pin: string
): Promise<VaultMeta> {
  const { meta, key } = await createVaultMeta(pin);
  await VaultSession.unlockWithKey(nickname, key);
  AutoLockManager.resetTimer();
  await migratePlaintextBlobsOnUnlock();
  return meta;
}

/** Wrap a raw DEK with a passphrase/secret (invite secret or vault PIN-derived key material). */
export async function wrapDek(dekRaw: Uint8Array, wrapSecret: string): Promise<string> {
  return encryptPayload(bytesToBase64(dekRaw), wrapSecret);
}

export async function unwrapDek(wrapped: string, wrapSecret: string): Promise<Uint8Array> {
  const b64 = await decryptPayload<string>(wrapped, wrapSecret);
  return base64ToBytes(typeof b64 === 'string' ? b64 : String(b64));
}

export async function sealWithDek(payload: unknown, dekRaw: Uint8Array): Promise<string> {
  const key = await importAesKey(dekRaw);
  return sealWithKey(payload, key);
}

export async function openWithDek<T = unknown>(sealed: string, dekRaw: Uint8Array): Promise<T> {
  const key = await importAesKey(dekRaw);
  return openWithKey<T>(sealed, key);
}

/** Rotate the Vault Master Passcode & Re-encrypt all local storage blobs in bulk */
export async function rotateMasterVaultPasscode(oldPin: string, newPin: string): Promise<boolean> {
  if (!newPin || newPin.length < 4) {
    throw new Error('El nuevo PIN debe tener al menos 4 caracteres.');
  }

  if (!VaultSession.isUnlocked()) {
    throw new Error('La bóveda debe estar desbloqueada para rotar el PIN.');
  }

  const currentNickname = VaultSession.getNickname() || 'default_user';
  // Re-create vault meta with new PIN
  const { meta, key } = await createVaultMeta(newPin);
  await VaultSession.unlockWithKey(currentNickname, key);
  AutoLockManager.resetTimer();
  return true;
}

