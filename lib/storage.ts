import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ActivityResponse, Session, GuestProfile } from '@/types';

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
  initiatorResponses: ActivityResponse[]
): Promise<Session> {
  const token = generateToken();
  const session: Session = {
    id: token,
    inviteCode: generateCode(),
    initiatorToken: token,
    initiatorNickname,
    initiatorResponses,
    guestResponses: null,
    status: 'waiting',
    createdAt: new Date().toISOString(),
  };

  const sessions = await loadLocalSessions();
  sessions[token] = session;
  await saveLocalSessions(sessions);
  await saveInitiatorToken(token);
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
  guestResponses: ActivityResponse[]
): Promise<Session | null> {
  const sessions = await loadLocalSessions();
  const session = Object.values(sessions).find((s) => s.inviteCode === inviteCode.toUpperCase());
  if (!session || session.status !== 'waiting') return null;

  const updated: Session = {
    ...session,
    guestNickname,
    guestResponses,
    status: 'complete',
    completedAt: new Date().toISOString(),
  };

  sessions[session.initiatorToken] = updated;
  await saveLocalSessions(sessions);
  return updated;
}

export async function listMyLocalSessions(): Promise<Session[]> {
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
