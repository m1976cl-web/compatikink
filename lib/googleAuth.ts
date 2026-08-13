/**
 * Google OAuth via Supabase Auth.
 * Identity only — vault DEK still derives from the local PIN (ZK).
 */

import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { getAuthRedirectUrl } from '@/lib/authRedirect';
import { listAllProfiles, getProfile } from '@/lib/storage';
import type { UserProfile } from '@/types';

export function suggestedNicknameFromUser(user: User): string {
  const meta = user.user_metadata || {};
  const fromName =
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta.name === 'string' && meta.name.trim()) ||
    '';
  if (fromName) {
    return fromName.split(/\s+/)[0].slice(0, 24);
  }
  const email = user.email || '';
  return (email.split('@')[0] || 'usuario').slice(0, 24);
}

export async function findProfileBySupabaseUserId(
  userId: string
): Promise<UserProfile | null> {
  const all = await listAllProfiles();
  const hit = all.find((p) => p.supabaseUserId === userId);
  if (hit) return hit;
  return null;
}

/** Prefer linked profile; otherwise current profile if already logged locally. */
export async function resolveVaultProfileForUser(user: User): Promise<UserProfile | null> {
  const linked = await findProfileBySupabaseUserId(user.id);
  if (linked) return linked;
  return null;
}

export async function startGoogleOAuth(): Promise<{ error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: 'Supabase no está configurado (falta EXPO_PUBLIC_SUPABASE_URL / ANON_KEY).' };
  }

  const redirectTo = getAuthRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
      skipBrowserRedirect: true,
    },
  });

  if (error) return { error: error.message };
  if (data?.url && typeof window !== 'undefined') {
    window.location.assign(data.url);
  } else if (!data?.url) {
    return { error: 'No se pudo obtener la URL de Google OAuth.' };
  }
  return {};
}

export async function getGoogleAuthUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

export async function signOutGoogle(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function linkSupabaseUserToProfile(
  nickname: string,
  userId: string
): Promise<UserProfile | null> {
  const profile = await getProfile(nickname);
  if (!profile) return null;
  const { saveProfile } = await import('@/lib/storage');
  const next = { ...profile, supabaseUserId: userId };
  await saveProfile(next);
  return next;
}
