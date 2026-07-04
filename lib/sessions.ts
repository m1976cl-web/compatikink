import { createSession as createRemoteSession, isSupabaseConfigured } from '@/lib/supabase';
import {
  createLocalSession,
  getLocalSessionByCode,
  getLocalSessionByToken,
  submitLocalGuestResponses,
} from '@/lib/storage';
import { ActivityResponse, Session, GuestProfile } from '@/types';

export async function createSession(
  nickname: string,
  responses: ActivityResponse[],
  guestProfile?: GuestProfile
): Promise<Session> {
  let session: Session;
  if (isSupabaseConfigured) {
    const { generateInviteCode, generateToken } = await import('@/lib/utils');
    const inviteCode = generateInviteCode();
    const token = generateToken();
    session = await createRemoteSession(inviteCode, token, nickname, responses);
    const { saveInitiatorToken } = await import('@/lib/storage');
    await saveInitiatorToken(token);
  } else {
    session = await createLocalSession(nickname, responses);
  }

  if (guestProfile) {
    const { saveGuestProfile } = await import('@/lib/storage');
    await saveGuestProfile(session.id, guestProfile);
  }

  return session;
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  if (isSupabaseConfigured) {
    const { getSessionByToken: remote } = await import('@/lib/supabase');
    const session = await remote(token);
    if (session) return session;
  }
  return getLocalSessionByToken(token);
}

export async function getSessionByInviteCode(code: string): Promise<Session | null> {
  if (isSupabaseConfigured) {
    const { getSessionByInviteCode: remote } = await import('@/lib/supabase');
    const session = await remote(code);
    if (session) return session;
  }
  return getLocalSessionByCode(code);
}

export async function submitGuestResponses(
  inviteCode: string,
  guestNickname: string,
  guestResponses: ActivityResponse[]
): Promise<Session> {
  if (isSupabaseConfigured) {
    const { submitGuestResponses: remote } = await import('@/lib/supabase');
    return remote(inviteCode, guestNickname, guestResponses);
  }
  const session = await submitLocalGuestResponses(inviteCode, guestNickname, guestResponses);
  if (!session) throw new Error('Sesión no encontrada o ya completada');
  return session;
}

export async function refreshSession(session: Session): Promise<Session | null> {
  if (isSupabaseConfigured) {
    const { refreshSession: remote } = await import('@/lib/supabase');
    return remote(session.id);
  }
  return getSessionByToken(session.initiatorToken);
}
