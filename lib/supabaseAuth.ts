import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Platform } from 'react-native';

export interface UserAuthSession {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
      name?: string;
    };
  } | null;
  provider?: string;
}

export async function signInWithGoogle(): Promise<{ url?: string; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: 'Supabase no está configurado. Revisa tus variables EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.' };
  }

  const redirectTo = Platform.OS === 'web'
    ? window.location.origin
    : 'compatikink://auth/callback';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { url: data.url };
}

export async function signOutSupabase(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
}

export async function getSupabaseUser(): Promise<UserAuthSession['user'] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function subscribeToAuthChanges(callback: (user: UserAuthSession['user'] | null) => void) {
  if (!isSupabaseConfigured || !supabase) {
    callback(null);
    return () => {};
  }

  const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => {
    subscription.subscription.unsubscribe();
  };
}
