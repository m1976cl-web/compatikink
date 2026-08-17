import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Session, SessionStatus } from '@/types';

const DEFAULT_SUPABASE_URL = 'https://piegesepycvipfzjbraz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_giY3oB4qdYQIDKKYQMrjhg_pPbGFLIE';

const rawUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  Constants.expoConfig?.extra?.supabaseUrl ||
  DEFAULT_SUPABASE_URL;

const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
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
  expires_at?: string | null;
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
    expiresAt: row.expires_at ?? extras?.expiresAt,
    inviteSecret: extras?.inviteSecret,
    sessionDekB64: extras?.sessionDekB64,
  };
}

function handleSupabaseRpcError(error: any): never {
  const msg = error?.message || String(error);
  if (msg.includes('rate_limit_exceeded') || msg.includes('429') || msg.includes('Too Many Requests')) {
    throw new Error('Demasiados intentos. Por favor espera 1 minuto antes de reintentar (Rate Limit).');
  }
  if (msg.includes('session_expired') || msg.includes('expirada')) {
    throw new Error('La sesión de invitación ha expirado.');
  }
  throw new Error(msg);
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

  if (error) handleSupabaseRpcError(error);
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

  if (error) handleSupabaseRpcError(error);
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
