import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { ActivityResponse, Session, SessionStatus } from '@/types';

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

export interface DbSession {
  id: string;
  invite_code: string;
  initiator_token: string;
  initiator_nickname: string | null;
  guest_nickname: string | null;
  initiator_responses: ActivityResponse[];
  guest_responses: ActivityResponse[] | null;
  status: SessionStatus;
  created_at: string;
  completed_at: string | null;
}

function mapSession(row: DbSession): Session {
  return {
    id: row.id,
    inviteCode: row.invite_code,
    initiatorToken: row.initiator_token,
    initiatorNickname: row.initiator_nickname ?? undefined,
    guestNickname: row.guest_nickname ?? undefined,
    initiatorResponses: row.initiator_responses,
    guestResponses: row.guest_responses,
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
  };
}

export async function createSession(
  inviteCode: string,
  initiatorToken: string,
  initiatorNickname: string,
  initiatorResponses: ActivityResponse[]
): Promise<Session> {
  if (!supabase) throw new Error('Supabase no configurado');

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      invite_code: inviteCode,
      initiator_token: initiatorToken,
      initiator_nickname: initiatorNickname,
      initiator_responses: initiatorResponses,
      status: 'waiting',
    })
    .select()
    .single();

  if (error) throw error;
  return mapSession(data as DbSession);
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('initiator_token', token)
    .single();

  if (error || !data) return null;
  return mapSession(data as DbSession);
}

export async function getSessionByInviteCode(code: string): Promise<Session | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('invite_code', code.toUpperCase())
    .single();

  if (error || !data) return null;
  return mapSession(data as DbSession);
}

export async function submitGuestResponses(
  inviteCode: string,
  guestNickname: string,
  guestResponses: ActivityResponse[]
): Promise<Session> {
  if (!supabase) throw new Error('Supabase no configurado');

  const { data, error } = await supabase
    .from('sessions')
    .update({
      guest_nickname: guestNickname,
      guest_responses: guestResponses,
      status: 'complete',
      completed_at: new Date().toISOString(),
    })
    .eq('invite_code', inviteCode.toUpperCase())
    .eq('status', 'waiting')
    .select()
    .single();

  if (error) throw error;
  return mapSession(data as DbSession);
}

export async function refreshSession(sessionId: string): Promise<Session | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !data) return null;
  return mapSession(data as DbSession);
}
