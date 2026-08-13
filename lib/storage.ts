import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ActivityResponse, Session, GuestProfile, UserProfile, SceneAgreement, Activity } from '@/types';
import {
  VaultSession,
  setupVaultForNewProfile,
  unlockVaultForProfile,
  encryptPayload,
  decryptPayload,
  isSealedBlob,
  isSensitiveStorageKey,
  readJsonStorage,
  writeJsonStorage,
  generateInviteSecret,
  generateDataEncryptionKeyBytes,
  bytesToBase64,
  wrapDek,
  sealWithDek,
  sealWithKey,
  openWithKey,
  VAULT_VERSION,
} from '@/lib/cryptoVault';
import { generateInviteCode, generateToken } from '@/lib/utils';

const TOKEN_KEY = 'initiator_token';
const SESSIONS_KEY = 'local_sessions';

export async function saveInitiatorToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    await writeJsonStorage(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function getInitiatorToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      const val = await readJsonStorage<string | null>(TOKEN_KEY, null);
      return typeof val === 'string' ? val : null;
    } catch {
      // Fallback: token may still be plaintext string in AsyncStorage
      const raw = await AsyncStorage.getItem(TOKEN_KEY);
      if (!raw) return null;
      if (isSealedBlob(raw)) return null;
      try {
        return JSON.parse(raw) as string;
      } catch {
        return raw;
      }
    }
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function loadLocalSessions(): Promise<Record<string, Session>> {
  return readJsonStorage<Record<string, Session>>(SESSIONS_KEY, {});
}

async function saveLocalSessions(sessions: Record<string, Session>): Promise<void> {
  await writeJsonStorage(SESSIONS_KEY, sessions);
}

/** Exported for features that mutate the local session map (dating / pass-and-play). */
export { loadLocalSessions, saveLocalSessions };

export async function createLocalSession(
  initiatorNickname: string,
  initiatorResponses: ActivityResponse[],
  initiatorProfile?: UserProfile,
  expiresAt?: string
): Promise<Session> {
  const token = generateToken();
  const inviteCode = generateInviteCode();
  const inviteSecret = generateInviteSecret();
  const dekRaw = generateDataEncryptionKeyBytes();
  const dekWrapInvite = await wrapDek(dekRaw, inviteSecret);

  const session: Session = {
    id: token,
    inviteCode,
    initiatorToken: token,
    inviteSecret,
    sessionDekB64: bytesToBase64(dekRaw),
    dekWrapInvite,
    initiatorNickname,
    initiatorProfile: initiatorProfile ?? { nickname: initiatorNickname },
    initiatorResponses,
    guestResponses: null,
    status: 'waiting',
    createdAt: new Date().toISOString(),
    expiresAt,
  };

  // Optional local ciphertext mirror (for parity with remote ZK shape)
  session.initiatorCiphertext = await sealWithDek(
    {
      nickname: session.initiatorNickname,
      profile: session.initiatorProfile,
      responses: session.initiatorResponses,
    },
    dekRaw
  );

  const sessions = await loadLocalSessions();
  sessions[token] = session;
  await saveLocalSessions(sessions);
  await saveInitiatorToken(token);

  const current = await getCurrentProfile();
  if (current) {
    current.createdSessionIds = current.createdSessionIds ?? [];
    current.createdSessionIds.push(session.id);
    await saveProfile(current);
  }

  return session;
}

export function isSessionExpired(session: Session): boolean {
  if (!session.expiresAt) return false;
  return new Date(session.expiresAt) < new Date();
}

export async function getLocalSessionByToken(token: string): Promise<Session | null> {
  const sessions = await loadLocalSessions();
  return sessions[token] ?? null;
}

export async function getLocalSessionByCode(code: string): Promise<Session | null> {
  const sessions = await loadLocalSessions();
  return Object.values(sessions).find((s) => s.inviteCode === code.toUpperCase()) ?? null;
}

export async function submitLocalGuestResponses(
  inviteCode: string,
  guestNickname: string,
  guestResponses: ActivityResponse[],
  guestProfile?: UserProfile,
  inviteSecret?: string
): Promise<Session | null> {
  const sessions = await loadLocalSessions();
  const session = Object.values(sessions).find((s) => s.inviteCode === inviteCode.toUpperCase());
  if (!session || session.status !== 'waiting') return null;

  let guestCiphertext: string | undefined;
  if (session.sessionDekB64) {
    const { base64ToBytes, sealWithDek: sealDek } = await import('@/lib/cryptoVault');
    guestCiphertext = await sealDek(
      { nickname: guestNickname, profile: guestProfile ?? { nickname: guestNickname }, responses: guestResponses },
      base64ToBytes(session.sessionDekB64)
    );
  } else if (inviteSecret && session.dekWrapInvite) {
    const { unwrapDek, sealWithDek: sealDek } = await import('@/lib/cryptoVault');
    const dek = await unwrapDek(session.dekWrapInvite, inviteSecret);
    guestCiphertext = await sealDek(
      { nickname: guestNickname, profile: guestProfile ?? { nickname: guestNickname }, responses: guestResponses },
      dek
    );
  }

  const updated: Session = {
    ...session,
    guestNickname,
    guestProfile: guestProfile ?? { nickname: guestNickname },
    guestResponses,
    guestCiphertext,
    status: 'complete',
    completedAt: new Date().toISOString(),
  };

  sessions[session.initiatorToken] = updated;
  await saveLocalSessions(sessions);

  const current = await getCurrentProfile();
  if (current) {
    current.receivedSessionIds = current.receivedSessionIds ?? [];
    current.receivedSessionIds.push(session.id);
    await saveProfile(current);
  }

  return updated;
}

export async function listMyLocalSessions(): Promise<Session[]> {
  const current = await getCurrentProfile();
  const allSessions = await loadLocalSessions();
  const list: Session[] = [];

  if (current) {
    const createdIds = current.createdSessionIds ?? [];
    const receivedIds = current.receivedSessionIds ?? [];
    for (const s of Object.values(allSessions)) {
      if (createdIds.includes(s.id) || receivedIds.includes(s.id)) {
        list.push(s);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const token = await getInitiatorToken();
  if (!token) return [];
  const session = await getLocalSessionByToken(token);
  return session ? [session] : [];
}

export function buildInviteLink(inviteCode: string, inviteSecret?: string): string {
  if (inviteSecret) {
    return `compatikink://guest/${inviteCode}#k=${inviteSecret}`;
  }
  return `compatikink://guest/${inviteCode}`;
}

export function buildInviteMessage(inviteCode: string, inviteSecret?: string): string {
  const linkHint = inviteSecret
    ? `\nEnlace (incluye secreto de cifrado):\ncompatikink://guest/${inviteCode}#k=${inviteSecret}\n`
    : '';
  return (
    `Hola, me gustaría explorar compatibilidad de preferencias de forma privada.\n\n` +
    `1. Entra a Compatikink\n` +
    `2. Introduce el código de invitación: ${inviteCode}\n` +
    linkHint +
    `\nTus respuestas viajan cifradas; el servidor solo ve ciphertext.`
  );
}

const GUEST_PROFILE_PREFIX = 'guest_profile_';

export async function saveGuestProfile(sessionId: string, profile: GuestProfile): Promise<void> {
  await writeJsonStorage(`${GUEST_PROFILE_PREFIX}${sessionId}`, profile);
}

export async function getGuestProfile(sessionId: string): Promise<GuestProfile | null> {
  return readJsonStorage<GuestProfile | null>(`${GUEST_PROFILE_PREFIX}${sessionId}`, null);
}

const PROFILES_KEY = 'local_user_profiles';
const CURRENT_PROFILE_NICKNAME_KEY = 'current_profile_nickname';

interface ProfileSecrets {
  notes?: string;
  baseResponses?: ActivityResponse[];
  createdSessionIds?: string[];
  receivedSessionIds?: string[];
  hardLimits?: string[];
  softLimits?: string[];
  bio?: string;
  fetlifeHandle?: string;
}

/** Public / non-response fields kept readable while vault is locked. */
function publicMetaFromProfile(profile: UserProfile): UserProfile {
  return {
    nickname: profile.nickname,
    pinSalt: profile.pinSalt,
    pinVerifier: profile.pinVerifier,
    vaultVersion: profile.vaultVersion,
    isLocalAdmin: profile.isLocalAdmin,
    pronouns: profile.pronouns,
    experienceLevel: profile.experienceLevel,
    role: profile.role,
    safetyProtocols: profile.safetyProtocols,
    safewords: profile.safewords,
    fetishBadges: profile.fetishBadges,
    verificationBadges: profile.verificationBadges,
    location: profile.location,
    avatarUrl: profile.avatarUrl,
    supabaseUserId: profile.supabaseUserId,
    autoLockTimeout: profile.autoLockTimeout,
    duressMeta: profile.duressMeta,
    secretsCipher: profile.secretsCipher,
  };
}

/** Persist sensitive profile fields as ck1 when vault unlocked; keep public meta readable. */
async function sealProfileSecrets(profile: UserProfile): Promise<UserProfile> {
  const publicProfile: UserProfile = publicMetaFromProfile(profile);
  delete publicProfile.secretsCipher;

  const secrets: ProfileSecrets = {
    notes: profile.notes,
    baseResponses: profile.baseResponses,
    createdSessionIds: profile.createdSessionIds,
    receivedSessionIds: profile.receivedSessionIds,
    hardLimits: profile.hardLimits,
    softLimits: profile.softLimits,
    bio: profile.bio,
    fetlifeHandle: profile.fetlifeHandle,
  };

  const key = VaultSession.getKeyOrNull();
  if (key) {
    publicProfile.secretsCipher = await sealWithKey(secrets, key);
  } else {
    // Pre-vault / locked write: keep secrets inline (legacy) until next unlock migrates
    Object.assign(publicProfile, secrets);
  }
  return publicProfile;
}

async function openProfileSecrets(profile: UserProfile): Promise<UserProfile> {
  if (profile.secretsCipher && isSealedBlob(profile.secretsCipher)) {
    const key = VaultSession.getKeyOrNull();
    if (!key) {
      // Locked: return public meta only
      return publicMetaFromProfile(profile);
    }
    try {
      const secrets = await openWithKey<ProfileSecrets>(profile.secretsCipher, key);
      return {
        ...profile,
        notes: secrets.notes,
        baseResponses: secrets.baseResponses,
        createdSessionIds: secrets.createdSessionIds,
        receivedSessionIds: secrets.receivedSessionIds,
        hardLimits: secrets.hardLimits,
        softLimits: secrets.softLimits,
        bio: secrets.bio,
        fetlifeHandle: secrets.fetlifeHandle,
      };
    } catch {
      return profile;
    }
  }
  return profile;
}

async function loadAllProfiles(): Promise<Record<string, UserProfile>> {
  // Profiles index is never whole-blob sealed (login list while locked).
  const raw = await AsyncStorage.getItem(PROFILES_KEY);
  if (!raw) return {};
  if (isSealedBlob(raw)) {
    // Migrated accidentally in an earlier build — open if possible
    try {
      const opened = await readJsonStorage<Record<string, UserProfile>>(PROFILES_KEY, {});
      return opened;
    } catch {
      return {};
    }
  }
  try {
    return JSON.parse(raw) as Record<string, UserProfile>;
  } catch {
    return {};
  }
}

async function saveAllProfiles(profiles: Record<string, UserProfile>): Promise<void> {
  await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

/** Strip plaintext PIN before persist; keep verifier fields only. */
function sanitizeProfileForPersist(profile: UserProfile): UserProfile {
  const { pin: _pin, ...rest } = profile;
  return rest;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const profiles = await loadAllProfiles();
  const sealed = await sealProfileSecrets(sanitizeProfileForPersist(profile));
  profiles[profile.nickname.toLowerCase()] = sealed;
  await saveAllProfiles(profiles);
}

export async function getProfile(nickname: string): Promise<UserProfile | null> {
  const profiles = await loadAllProfiles();
  const p = profiles[nickname.toLowerCase()];
  if (!p) return null;
  return openProfileSecrets(p);
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const nickname = await AsyncStorage.getItem(CURRENT_PROFILE_NICKNAME_KEY);
  if (!nickname) return null;
  return getProfile(nickname);
}

export async function setCurrentProfile(nickname: string | null): Promise<void> {
  if (nickname) {
    await AsyncStorage.setItem(CURRENT_PROFILE_NICKNAME_KEY, nickname);
  } else {
    await AsyncStorage.removeItem(CURRENT_PROFILE_NICKNAME_KEY);
  }
}

export async function listAllProfiles(): Promise<UserProfile[]> {
  const profiles = await loadAllProfiles();
  // Public meta for picker; secrets only if vault unlocked
  const out: UserProfile[] = [];
  for (const p of Object.values(profiles)) {
    out.push(await openProfileSecrets(p));
  }
  return out;
}

export async function registerProfile(profile: UserProfile): Promise<UserProfile> {
  const existing = await getProfile(profile.nickname);
  if (existing) {
    throw new Error('El perfil ya existe');
  }

  const pin = profile.pin?.trim();
  if (!pin || pin.length < 4) {
    throw new Error('Se requiere un PIN de al menos 4 dígitos para la bóveda.');
  }

  const meta = await setupVaultForNewProfile(profile.nickname, pin);

  const cleanProfile: UserProfile = sanitizeProfileForPersist({
    ...profile,
    pin: undefined,
    pinSalt: meta.saltB64,
    pinVerifier: meta.verifierB64,
    vaultVersion: VAULT_VERSION,
    baseResponses: profile.baseResponses ?? [],
    createdSessionIds: profile.createdSessionIds ?? [],
    receivedSessionIds: profile.receivedSessionIds ?? [],
  });

  await saveProfile(cleanProfile);
  await setCurrentProfile(cleanProfile.nickname);
  return cleanProfile;
}

export interface SecurityAuditLogItem {
  id: string;
  timestamp: string;
  event: 'unlock_success' | 'unlock_failed' | 'duress_triggered' | 'pin_changed' | 'autolock_changed';
  details?: string;
  userAgent?: string;
}

const AUDIT_LOG_PREFIX = 'ck_security_audit_';

export async function addSecurityAuditLog(
  nickname: string,
  event: SecurityAuditLogItem['event'],
  details?: string
): Promise<void> {
  try {
    const key = AUDIT_LOG_PREFIX + nickname.toLowerCase();
    const existing = await readJsonStorage<SecurityAuditLogItem[]>(key, []);
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Mobile App';
    const newItem: SecurityAuditLogItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: ua.slice(0, 60),
    };
    const updated = [newItem, ...existing].slice(0, 50); // Keep last 50 events
    await writeJsonStorage(key, updated);
  } catch (err) {
    console.warn('Could not write security audit log:', err);
  }
}

export async function getSecurityAuditLogs(nickname: string): Promise<SecurityAuditLogItem[]> {
  try {
    const key = AUDIT_LOG_PREFIX + nickname.toLowerCase();
    return await readJsonStorage<SecurityAuditLogItem[]>(key, []);
  } catch {
    return [];
  }
}

export async function loginProfile(nickname: string, pin: string): Promise<UserProfile | null> {
  const profile = await getProfile(nickname);
  if (!profile) return null;

  const hasVault =
    Boolean(profile.pinSalt && profile.pinVerifier) || Boolean(profile.pin);

  if (!hasVault) {
    // Legacy profile without PIN — allow device-local access, no vault key
    await setCurrentProfile(profile.nickname);
    await addSecurityAuditLog(nickname, 'unlock_success', 'Sin PIN (Perfil local)');
    return profile;
  }

  try {
    const res = await unlockVaultForProfile(nickname, pin, profile);
    
    // Check if Duress PIN triggered
    if (res.isDuress) {
      await addSecurityAuditLog(nickname, 'duress_triggered', `Acción de coacción: ${res.duressAction}`);
      if (res.duressAction === 'wipe') {
        // Silent Panic Wipe
        await panicWipeData();
        return null;
      }
      // Decoy Profile Mode: return clean dummy profile
      const decoyProfile: UserProfile = {
        nickname: profile.nickname,
        notes: 'Espacio personal señuelo',
        baseResponses: [],
        experienceLevel: 'beginner',
      };
      await setCurrentProfile(decoyProfile.nickname);
      return decoyProfile;
    }

    let updated = profile;
    if (!profile.pinSalt) {
      updated = sanitizeProfileForPersist({
        ...profile,
        pin: undefined,
        pinSalt: res.meta.saltB64,
        pinVerifier: res.meta.verifierB64,
        vaultVersion: VAULT_VERSION,
      });
      await saveProfile(updated);
    }
    await setCurrentProfile(updated.nickname);
    await saveProfile(updated);
    await addSecurityAuditLog(nickname, 'unlock_success', 'Desbloqueo con PIN de Bóveda');
    return updated;
  } catch (err: any) {
    await addSecurityAuditLog(nickname, 'unlock_failed', err?.message || 'PIN incorrecto');
    throw err;
  }
}

export async function logoutProfile(): Promise<void> {
  VaultSession.lock();
  await setCurrentProfile(null);
}

export async function convertSessionToProfile(
  session: Session,
  pin: string,
  profileData: Partial<UserProfile>,
  isGuest: boolean
): Promise<UserProfile> {
  const baseResponses = isGuest ? (session.guestResponses ?? []) : session.initiatorResponses;
  const nickname = isGuest
    ? (session.guestNickname ?? session.guestProfile?.nickname ?? 'Invitado')
    : (session.initiatorNickname ?? session.initiatorProfile?.nickname ?? 'Iniciador');

  const profile: UserProfile = {
    nickname,
    pin,
    pronouns: profileData.pronouns || (isGuest ? session.guestProfile?.pronouns : session.initiatorProfile?.pronouns),
    experienceLevel:
      profileData.experienceLevel ||
      (isGuest ? session.guestProfile?.experienceLevel : session.initiatorProfile?.experienceLevel),
    notes: profileData.notes || (isGuest ? session.guestProfile?.notes : session.initiatorProfile?.notes),
    baseResponses,
    createdSessionIds: !isGuest ? [session.id] : [],
    receivedSessionIds: isGuest ? [session.id] : [],
  };

  return registerProfile(profile);
}

/** True when vault is unlocked and the current profile has isLocalAdmin. */
export async function canAccessLocalAdmin(): Promise<boolean> {
  if (!VaultSession.isUnlocked()) return false;
  const current = await getCurrentProfile();
  return Boolean(current?.isLocalAdmin);
}

const SCENE_AGREEMENTS_PREFIX = 'scene_agreements_';

export async function saveSceneAgreement(agreement: SceneAgreement): Promise<void> {
  const existing = await getSceneAgreements(agreement.sessionId);
  const updated = existing.filter((a) => a.activityId !== agreement.activityId);
  updated.push(agreement);
  await writeJsonStorage(`${SCENE_AGREEMENTS_PREFIX}${agreement.sessionId}`, updated);
}

export async function getSceneAgreements(sessionId: string): Promise<SceneAgreement[]> {
  return readJsonStorage<SceneAgreement[]>(`${SCENE_AGREEMENTS_PREFIX}${sessionId}`, []);
}

export async function getSceneAgreementByActivity(
  sessionId: string,
  activityId: string
): Promise<SceneAgreement | null> {
  const list = await getSceneAgreements(sessionId);
  return list.find((a) => a.activityId === activityId) ?? null;
}

const CUSTOM_ACTIVITIES_KEY = 'custom_activities_list';

export async function getCustomActivities(): Promise<Activity[]> {
  return readJsonStorage<Activity[]>(CUSTOM_ACTIVITIES_KEY, []);
}

export async function saveCustomActivity(activity: Activity): Promise<Activity[]> {
  const existing = await getCustomActivities();
  if (!existing.some((a) => a.id === activity.id)) {
    existing.push(activity);
    await writeJsonStorage(CUSTOM_ACTIVITIES_KEY, existing);
  }
  const { registerCustomActivity } = await import('@/data/activities');
  registerCustomActivity(activity);
  return existing;
}

export async function getAllSceneAgreements(): Promise<
  { sessionId: string; agreements: SceneAgreement[] }[]
> {
  const sessions = await loadLocalSessions();
  const result: { sessionId: string; agreements: SceneAgreement[] }[] = [];
  for (const session of Object.values(sessions)) {
    const agreements = await getSceneAgreements(session.id);
    if (agreements.length > 0) {
      result.push({ sessionId: session.id, agreements });
    }
  }
  return result;
}

/** Panic wipe: every sensitive key + vault RAM + initiator token (native SecureStore too). */
export async function panicWipeData(): Promise<void> {
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
  if (keysToRemove.length > 0) {
    await AsyncStorage.multiRemove(keysToRemove);
  }

  // Also clear any leftover keys that look like app data
  const remaining = await AsyncStorage.getAllKeys();
  const extra = remaining.filter(
    (k) =>
      k.startsWith('ck_') ||
      k === TOKEN_KEY ||
      k === CURRENT_PROFILE_NICKNAME_KEY ||
      k === PROFILES_KEY ||
      k === SESSIONS_KEY
  );
  if (extra.length > 0) {
    await AsyncStorage.multiRemove(extra);
  }

  if (Platform.OS !== 'web') {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  }

  await setCurrentProfile(null);
}

export interface SceneDebrief {
  id: string;
  sessionId: string;
  activityId: string;
  activityName: string;
  ratingStars: number;
  safewordsRespected: boolean;
  aftercareRating: number;
  notes?: string;
  emotions?: string[];
  wouldRepeat?: 'yes' | 'maybe' | 'no';
  createdAt: string;
}

const SCENE_DEBRIEFS_PREFIX = 'scene_debriefs_';

export async function saveSceneDebrief(debrief: SceneDebrief): Promise<void> {
  const existing = await getSceneDebriefs(debrief.sessionId);
  const updated = existing.filter((d) => d.id !== debrief.id);
  updated.push(debrief);
  await writeJsonStorage(`${SCENE_DEBRIEFS_PREFIX}${debrief.sessionId}`, updated);
}

export async function getSceneDebriefs(sessionId: string): Promise<SceneDebrief[]> {
  return readJsonStorage<SceneDebrief[]>(`${SCENE_DEBRIEFS_PREFIX}${sessionId}`, []);
}

export interface WishlistItem {
  activityId: string;
  activityName: string;
  category: string;
  addedAt: string;
  note?: string;
}

const WISHLIST_KEY = 'user_wishlist_items';

export async function getWishlist(): Promise<WishlistItem[]> {
  return readJsonStorage<WishlistItem[]>(WISHLIST_KEY, []);
}

export async function toggleWishlist(item: {
  activityId: string;
  activityName: string;
  category: string;
}): Promise<boolean> {
  const existing = await getWishlist();
  const index = existing.findIndex((w) => w.activityId === item.activityId);
  if (index >= 0) {
    existing.splice(index, 1);
    await writeJsonStorage(WISHLIST_KEY, existing);
    return false;
  }
  existing.push({
    ...item,
    addedAt: new Date().toISOString(),
  });
  await writeJsonStorage(WISHLIST_KEY, existing);
  return true;
}

export interface DatingMessage {
  id: string;
  targetProfileId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

const DATING_MESSAGES_KEY = 'dating_direct_messages';

export async function getDatingMessages(targetProfileId?: string): Promise<DatingMessage[]> {
  const list = await readJsonStorage<DatingMessage[]>(DATING_MESSAGES_KEY, []);
  if (!targetProfileId) return list;
  return list.filter((m) => m.targetProfileId === targetProfileId);
}

export async function sendDatingMessage(msg: {
  targetProfileId: string;
  senderName: string;
  text: string;
}): Promise<DatingMessage> {
  const list = await getDatingMessages();
  const newMsg: DatingMessage = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    targetProfileId: msg.targetProfileId,
    senderName: msg.senderName,
    text: msg.text.trim(),
    timestamp: new Date().toISOString(),
  };
  list.push(newMsg);
  await writeJsonStorage(DATING_MESSAGES_KEY, list);
  return newMsg;
}

/** Gear inventory (used by achievements); sealed at rest via wishlist-style key. */
const GEAR_ITEMS_KEY = 'user_gear_inventory';

export interface GearItem {
  id: string;
  name: string;
  category?: string;
  addedAt: string;
}

export async function getGearItems(): Promise<GearItem[]> {
  return readJsonStorage<GearItem[]>(GEAR_ITEMS_KEY, []);
}

export async function saveGearItems(items: GearItem[]): Promise<void> {
  await writeJsonStorage(GEAR_ITEMS_KEY, items);
}

/**
 * Encrypted portable export. Passphrase required — output is a ck1 sealed JSON backup.
 * Without passphrase throws (no plaintext dumps).
 */
export async function exportUserDataJSON(passphrase?: string): Promise<string> {
  if (!passphrase || passphrase.length < 4) {
    throw new Error('Se requiere una contraseña de exportación (mín. 4 caracteres) para el backup cifrado.');
  }

  const keys = await AsyncStorage.getAllKeys();
  const data: Record<string, string | null> = {};
  for (const key of keys) {
    data[key] = await AsyncStorage.getItem(key);
  }
  const bundle = {
    version: '2.0-encrypted',
    kdf: 'PBKDF2-SHA-256',
    exportedAt: new Date().toISOString(),
    storageData: data,
  };
  return encryptPayload(bundle, passphrase);
}

export async function importUserDataJSON(jsonString: string, passphrase?: string): Promise<number> {
  let parsed: { storageData?: Record<string, string | null> };

  if (isSealedBlob(jsonString)) {
    if (!passphrase) {
      throw new Error('Este backup está cifrado. Indica la contraseña de exportación.');
    }
    parsed = await decryptPayload(jsonString, passphrase);
  } else {
    parsed = JSON.parse(jsonString);
  }

  if (!parsed || !parsed.storageData) {
    throw new Error('Formato de backup no válido.');
  }
  const entries = Object.entries(parsed.storageData as Record<string, string | null>);
  let count = 0;
  for (const [key, val] of entries) {
    if (val !== null) {
      await AsyncStorage.setItem(key, val);
      count++;
    }
  }
  return count;
}

/**
 * P0.4 — Borrado Real de Datos ("Derecho al Olvido")
 * Elimina irrecuperablemente todos los datos locales de AsyncStorage/SecureStore
 * y notifica a Supabase para eliminar registros remotos asociados al token.
 */
export async function purgeAllUserData(): Promise<void> {
  try {
    const token = await getInitiatorToken();
    if (token) {
      const { supabase, isSupabaseConfigured } = await import('./supabase');
      if (isSupabaseConfigured && supabase) {
        await supabase.rpc('purge_user_session_by_token', { p_token: token });
      }
    }
  } catch {
    // Best-effort remote wipe ignore
  }

  // Clear SecureStore
  if (Platform.OS !== 'web') {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {}
  }

  // Clear all local storage keys
  await AsyncStorage.clear();

  // Reset RAM vault session
  const { VaultLockGateAPI } = await import('./cryptoVault');
  VaultLockGateAPI.lock();
}

