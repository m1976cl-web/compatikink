import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, GuestProfile, ActivityResponse, Session } from '@/types';
import {
  VaultSession,
  setupVaultForNewProfile,
  unlockVaultForProfile,
  isSealedBlob,
  readJsonStorage,
  writeJsonStorage,
  sealWithKey,
  openWithKey,
  VAULT_VERSION,
} from '@/lib/cryptoVault';
import { panicWipeData } from '@/lib/storage/backupStorage';

export const PROFILES_KEY = 'local_user_profiles';
export const CURRENT_PROFILE_NICKNAME_KEY = 'current_profile_nickname';
export const GUEST_PROFILE_PREFIX = 'guest_profile_';

interface ProfileSecrets {
  notes?: string;
  baseResponses?: ActivityResponse[];
  createdSessionIds?: string[];
  receivedSessionIds?: string[];
}

/** Persist sensitive profile fields as ck1 when vault unlocked; keep public meta readable. */
async function sealProfileSecrets(profile: UserProfile): Promise<UserProfile> {
  const publicProfile: UserProfile = {
    nickname: profile.nickname,
    pinSalt: profile.pinSalt,
    pinVerifier: profile.pinVerifier,
    vaultVersion: profile.vaultVersion,
    isLocalAdmin: profile.isLocalAdmin,
    pronouns: profile.pronouns,
    experienceLevel: profile.experienceLevel,
  };

  const secrets: ProfileSecrets = {
    notes: profile.notes,
    baseResponses: profile.baseResponses,
    createdSessionIds: profile.createdSessionIds,
    receivedSessionIds: profile.receivedSessionIds,
  };

  const key = VaultSession.getKeyOrNull();
  if (key) {
    publicProfile.secretsCipher = await sealWithKey(secrets, key);
  } else {
    Object.assign(publicProfile, secrets);
  }
  return publicProfile;
}

async function openProfileSecrets(profile: UserProfile): Promise<UserProfile> {
  if (profile.secretsCipher && isSealedBlob(profile.secretsCipher)) {
    const key = VaultSession.getKeyOrNull();
    if (!key) {
      return {
        nickname: profile.nickname,
        pinSalt: profile.pinSalt,
        pinVerifier: profile.pinVerifier,
        vaultVersion: profile.vaultVersion,
        isLocalAdmin: profile.isLocalAdmin,
        pronouns: profile.pronouns,
        experienceLevel: profile.experienceLevel,
        secretsCipher: profile.secretsCipher,
      };
    }
    try {
      const secrets = await openWithKey<ProfileSecrets>(profile.secretsCipher, key);
      return {
        ...profile,
        notes: secrets.notes,
        baseResponses: secrets.baseResponses,
        createdSessionIds: secrets.createdSessionIds,
        receivedSessionIds: secrets.receivedSessionIds,
      };
    } catch {
      return profile;
    }
  }
  return profile;
}

async function loadAllProfiles(): Promise<Record<string, UserProfile>> {
  const raw = await AsyncStorage.getItem(PROFILES_KEY);
  if (!raw) return {};
  if (isSealedBlob(raw)) {
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
    const updated = [newItem, ...existing].slice(0, 50);
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
    await setCurrentProfile(profile.nickname);
    await addSecurityAuditLog(nickname, 'unlock_success', 'Sin PIN (Perfil local)');
    return profile;
  }

  try {
    const res = await unlockVaultForProfile(nickname, pin, profile);
    
    if (res.isDuress) {
      await addSecurityAuditLog(nickname, 'duress_triggered', `Acción de coacción: ${res.duressAction}`);
      if (res.duressAction === 'wipe') {
        await panicWipeData();
        return null;
      }
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

export async function canAccessLocalAdmin(): Promise<boolean> {
  if (!VaultSession.isUnlocked()) return false;
  const current = await getCurrentProfile();
  return Boolean(current?.isLocalAdmin);
}

export async function saveGuestProfile(sessionId: string, profile: GuestProfile): Promise<void> {
  await writeJsonStorage(`${GUEST_PROFILE_PREFIX}${sessionId}`, profile);
}

export async function getGuestProfile(sessionId: string): Promise<GuestProfile | null> {
  return readJsonStorage<GuestProfile | null>(`${GUEST_PROFILE_PREFIX}${sessionId}`, null);
}
