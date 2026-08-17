import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ActivityResponse, Session, UserProfile } from '@/types';
import {
  isSealedBlob,
  readJsonStorage,
  writeJsonStorage,
  generateInviteSecret,
  generateDataEncryptionKeyBytes,
  bytesToBase64,
  wrapDek,
  sealWithDek,
} from '@/lib/cryptoVault';
import { generateInviteCode, generateToken } from '@/lib/utils';
import { getCurrentProfile, saveProfile } from '@/lib/storage/profileStorage';
import { createInviteWebUrl, createInviteSchemeUrl } from '@/lib/linking';

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

export async function loadLocalSessions(): Promise<Record<string, Session>> {
  return readJsonStorage<Record<string, Session>>(SESSIONS_KEY, {});
}

export async function saveLocalSessions(sessions: Record<string, Session>): Promise<void> {
  await writeJsonStorage(SESSIONS_KEY, sessions);
}

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
  return createInviteWebUrl(inviteCode, inviteSecret);
}

export function buildInviteMessage(inviteCode: string, inviteSecret?: string): string {
  const httpsUrl = createInviteWebUrl(inviteCode, inviteSecret);
  const schemeUrl = createInviteSchemeUrl(inviteCode, inviteSecret);
  return (
    `Hola, te invito a comparar nuestras preferencias de forma privada e íntima en CompatKink:\n\n` +
    `🔗 Enlace directo HTTPS:\n${httpsUrl}\n\n` +
    `🔑 Código de invitación manual: ${inviteCode}\n` +
    (inviteSecret ? `📱 Abre directamente en la App: ${schemeUrl}\n` : '') +
    `\n🔒 Cifrado Zero-Knowledge: tus respuestas viajan cifradas E2EE y solo tú y yo podemos ver las coincidencias.`
  );
}
