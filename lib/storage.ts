import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ActivityResponse, Session, GuestProfile, UserProfile, SceneAgreement, Activity } from '@/types';

const TOKEN_KEY = 'initiator_token';
const SESSIONS_KEY = 'local_sessions';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateToken(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export async function saveInitiatorToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function getInitiatorToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(TOKEN_KEY);
  } else {
    return SecureStore.getItemAsync(TOKEN_KEY);
  }
}

async function loadLocalSessions(): Promise<Record<string, Session>> {
  const raw = await AsyncStorage.getItem(SESSIONS_KEY);
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, Session>;
}

async function saveLocalSessions(sessions: Record<string, Session>): Promise<void> {
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export async function createLocalSession(
  initiatorNickname: string,
  initiatorResponses: ActivityResponse[],
  initiatorProfile?: UserProfile
): Promise<Session> {
  const token = generateToken();
  const session: Session = {
    id: token,
    inviteCode: generateCode(),
    initiatorToken: token,
    initiatorNickname,
    initiatorProfile: initiatorProfile ?? { nickname: initiatorNickname },
    initiatorResponses,
    guestResponses: null,
    status: 'waiting',
    createdAt: new Date().toISOString(),
  };

  const sessions = await loadLocalSessions();
  sessions[token] = session;
  await saveLocalSessions(sessions);
  await saveInitiatorToken(token);

  // Associate session with the active profile
  const current = await getCurrentProfile();
  if (current) {
    current.createdSessionIds = current.createdSessionIds ?? [];
    current.createdSessionIds.push(session.id);
    await saveProfile(current);
  }

  return session;
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
  guestProfile?: UserProfile
): Promise<Session | null> {
  const sessions = await loadLocalSessions();
  const session = Object.values(sessions).find((s) => s.inviteCode === inviteCode.toUpperCase());
  if (!session || session.status !== 'waiting') return null;

  const updated: Session = {
    ...session,
    guestNickname,
    guestProfile: guestProfile ?? { nickname: guestNickname },
    guestResponses,
    status: 'complete',
    completedAt: new Date().toISOString(),
  };

  sessions[session.initiatorToken] = updated;
  await saveLocalSessions(sessions);

  // Associate session with active profile of guest if logged in
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
    // Sort by date desc
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const token = await getInitiatorToken();
  if (!token) return [];
  const session = await getLocalSessionByToken(token);
  return session ? [session] : [];
}

export function buildInviteLink(inviteCode: string): string {
  return `compatikink://guest/${inviteCode}`;
}

export function buildInviteMessage(inviteCode: string): string {
  return (
    `Hola, me gustaría explorar compatibilidad de preferencias de forma privada.\n\n` +
    `1. Entra a Compatikink\n` +
    `2. Introduce el código de invitación: ${inviteCode}\n\n` +
    `Tus respuestas son privadas. Yo recibiré el análisis cuando termines.`
  );
}

const GUEST_PROFILE_PREFIX = 'guest_profile_';

export async function saveGuestProfile(sessionId: string, profile: GuestProfile): Promise<void> {
  await AsyncStorage.setItem(`${GUEST_PROFILE_PREFIX}${sessionId}`, JSON.stringify(profile));
}

export async function getGuestProfile(sessionId: string): Promise<GuestProfile | null> {
  const raw = await AsyncStorage.getItem(`${GUEST_PROFILE_PREFIX}${sessionId}`);
  if (!raw) return null;
  return JSON.parse(raw) as GuestProfile;
}

// User Profile PIN-protection management
const PROFILES_KEY = 'local_user_profiles';
const CURRENT_PROFILE_NICKNAME_KEY = 'current_profile_nickname';

async function loadAllProfiles(): Promise<Record<string, UserProfile>> {
  const raw = await AsyncStorage.getItem(PROFILES_KEY);
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, UserProfile>;
}

async function saveAllProfiles(profiles: Record<string, UserProfile>): Promise<void> {
  await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const profiles = await loadAllProfiles();
  profiles[profile.nickname.toLowerCase()] = profile;
  await saveAllProfiles(profiles);
}

export async function getProfile(nickname: string): Promise<UserProfile | null> {
  const profiles = await loadAllProfiles();
  return profiles[nickname.toLowerCase()] ?? null;
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
  return Object.values(profiles);
}

export async function registerProfile(profile: UserProfile): Promise<UserProfile> {
  const existing = await getProfile(profile.nickname);
  if (existing) {
    throw new Error('El perfil ya existe');
  }
  const cleanProfile: UserProfile = {
    ...profile,
    baseResponses: profile.baseResponses ?? [],
    createdSessionIds: profile.createdSessionIds ?? [],
    receivedSessionIds: profile.receivedSessionIds ?? [],
  };
  await saveProfile(cleanProfile);
  await setCurrentProfile(cleanProfile.nickname);
  return cleanProfile;
}

export async function loginProfile(nickname: string, pin: string): Promise<UserProfile | null> {
  const profile = await getProfile(nickname);
  if (!profile) return null;
  if (profile.pin === pin) {
    await setCurrentProfile(profile.nickname);
    return profile;
  }
  return null;
}

export async function logoutProfile(): Promise<void> {
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
    experienceLevel: profileData.experienceLevel || (isGuest ? session.guestProfile?.experienceLevel : session.initiatorProfile?.experienceLevel),
    notes: profileData.notes || (isGuest ? session.guestProfile?.notes : session.initiatorProfile?.notes),
    baseResponses,
    createdSessionIds: !isGuest ? [session.id] : [],
    receivedSessionIds: isGuest ? [session.id] : [],
  };

  await saveProfile(profile);
  await setCurrentProfile(profile.nickname);
  return profile;
}

// Scene Agreements Storage
const SCENE_AGREEMENTS_PREFIX = 'scene_agreements_';

export async function saveSceneAgreement(agreement: SceneAgreement): Promise<void> {
  const existing = await getSceneAgreements(agreement.sessionId);
  const updated = existing.filter((a) => a.activityId !== agreement.activityId);
  updated.push(agreement);
  await AsyncStorage.setItem(`${SCENE_AGREEMENTS_PREFIX}${agreement.sessionId}`, JSON.stringify(updated));
}

export async function getSceneAgreements(sessionId: string): Promise<SceneAgreement[]> {
  const raw = await AsyncStorage.getItem(`${SCENE_AGREEMENTS_PREFIX}${sessionId}`);
  if (!raw) return [];
  return JSON.parse(raw) as SceneAgreement[];
}

export async function getSceneAgreementByActivity(sessionId: string, activityId: string): Promise<SceneAgreement | null> {
  const list = await getSceneAgreements(sessionId);
  return list.find((a) => a.activityId === activityId) ?? null;
}

// Custom Activities Storage
const CUSTOM_ACTIVITIES_KEY = 'custom_activities_list';

export async function getCustomActivities(): Promise<Activity[]> {
  const raw = await AsyncStorage.getItem(CUSTOM_ACTIVITIES_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Activity[];
}

export async function saveCustomActivity(activity: Activity): Promise<Activity[]> {
  const existing = await getCustomActivities();
  if (!existing.some((a) => a.id === activity.id)) {
    existing.push(activity);
    await AsyncStorage.setItem(CUSTOM_ACTIVITIES_KEY, JSON.stringify(existing));
  }
  const { registerCustomActivity } = await import('@/data/activities');
  registerCustomActivity(activity);
  return existing;
}
