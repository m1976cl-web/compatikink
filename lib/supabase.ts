import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Session, SessionStatus } from '@/types';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  Constants.expoConfig?.extra?.supabaseUrl ??
  '';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  Constants.expoConfig?.extra?.supabaseAnonKey ??
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/** Remote row shape — ciphertext only (no plaintext responses/profiles). */
export interface DbSession {
  id: string;
  invite_code: string;
  initiator_token: string;
  dek_wrap_invite: string;
  initiator_nickname: string | null;
  guest_nickname: string | null;
  initiator_ciphertext: string;
  guest_ciphertext: string | null;
  status: SessionStatus;
  created_at: string;
  completed_at: string | null;
}

function mapSession(row: DbSession, extras?: Partial<Session>): Session {
  return {
    id: row.id,
    inviteCode: row.invite_code,
    initiatorToken: row.initiator_token,
    dekWrapInvite: row.dek_wrap_invite,
    initiatorCiphertext: row.initiator_ciphertext,
    guestCiphertext: row.guest_ciphertext ?? undefined,
    initiatorNickname: row.initiator_nickname ?? undefined,
    guestNickname: row.guest_nickname ?? undefined,
    // Plaintext fields empty until client decrypts with DEK
    initiatorResponses: extras?.initiatorResponses ?? [],
    guestResponses: extras?.guestResponses ?? null,
    initiatorProfile: extras?.initiatorProfile,
    guestProfile: extras?.guestProfile,
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    inviteSecret: extras?.inviteSecret,
    sessionDekB64: extras?.sessionDekB64,
  };
}

export async function createSession(
  inviteCode: string,
  initiatorToken: string,
  dekWrapInvite: string,
  initiatorCiphertext: string,
  initiatorNickname?: string
): Promise<Session> {
  if (!supabase) throw new Error('Supabase no configurado');

  const { data, error } = await supabase.rpc('create_zk_session', {
    p_invite_code: inviteCode,
    p_initiator_token: initiatorToken,
    p_dek_wrap_invite: dekWrapInvite,
    p_initiator_ciphertext: initiatorCiphertext,
    p_initiator_nickname: initiatorNickname ?? null,
  });

  if (error) throw error;
  return mapSession(data as DbSession);
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.rpc('get_session_by_initiator_token', {
    p_token: token,
  });

  if (error || !data) return null;
  return mapSession(data as DbSession);
}

export async function getSessionByInviteCode(code: string): Promise<Session | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.rpc('get_session_by_invite', {
    p_invite_code: code.toUpperCase(),
  });

  if (error || !data) return null;
  return mapSession(data as DbSession);
}

export async function submitGuestCiphertext(
  inviteCode: string,
  guestCiphertext: string,
  guestNickname?: string
): Promise<Session> {
  if (!supabase) throw new Error('Supabase no configurado');

  const { data, error } = await supabase.rpc('submit_guest_ciphertext', {
    p_invite_code: inviteCode.toUpperCase(),
    p_guest_ciphertext: guestCiphertext,
    p_guest_nickname: guestNickname ?? null,
  });

  if (error) throw error;
  return mapSession(data as DbSession);
}

/** @deprecated Prefer submitGuestCiphertext — plaintext guest submit removed for ZK. */
export async function submitGuestResponses(
  _inviteCode: string,
  _guestNickname: string,
  _guestResponses: unknown,
  _guestProfile?: unknown
): Promise<Session> {
  throw new Error(
    'submitGuestResponses plaintext eliminado. Usa sessions.submitGuestResponses con inviteSecret.'
  );
}

export async function refreshSession(token: string): Promise<Session | null> {
  if (!supabase || !token) return null;
  return getSessionByToken(token);
}
