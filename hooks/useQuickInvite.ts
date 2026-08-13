import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createSession } from '@/lib/sessions';
import { UserProfile } from '@/types';
import { useHomeStore } from '@/lib/stores/useHomeStore';
import { isSupabaseConfigured } from '@/lib/supabase';

export type ExpiryOption = '48h' | '7d' | 'none';

export function useQuickInvite(
  overrideProfile?: UserProfile | null,
  overrideOnSuccess?: () => Promise<void>
) {
  const router = useRouter();
  const storeProfile = useHomeStore((s) => s.profile);
  const storeLoadHomeData = useHomeStore((s) => s.loadHomeData);

  const profile = overrideProfile !== undefined ? overrideProfile : storeProfile;
  const loadHomeData = overrideOnSuccess || storeLoadHomeData;

  const [showQuickInvite, setShowQuickInvite] = useState(false);
  const [quickGuestNick, setQuickGuestNick] = useState('');
  const [quickGuestNotes, setQuickGuestNotes] = useState('');
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [expiryOption, setExpiryOption] = useState<ExpiryOption>('48h');

  const createInvite = useCallback(
    async (guestNick: string, guestNotes: string, expiry: ExpiryOption) => {
      if (!profile?.baseResponses?.length) {
        Alert.alert('Sin respuestas', 'Responde tu cuestionario base primero.');
        return;
      }
      if (!guestNick.trim()) {
        Alert.alert('Nombre requerido', 'Ingresa el nombre de la otra persona.');
        return;
      }

      setCreatingInvite(true);
      try {
        // Remote create_zk_session always applies server 48h TTL.
        // Local-only sessions honor the chip selection.
        let expiresAt: string | undefined;
        if (!isSupabaseConfigured) {
          if (expiry === '48h') {
            expiresAt = new Date(Date.now() + 48 * 3600_000).toISOString();
          } else if (expiry === '7d') {
            expiresAt = new Date(Date.now() + 7 * 86400_000).toISOString();
          }
        }

        const session = await createSession(
          profile.nickname,
          profile.baseResponses,
          {
            nickname: guestNick.trim(),
            notes: guestNotes.trim(),
          },
          profile,
          expiresAt
        );

        setShowQuickInvite(false);
        setQuickGuestNick('');
        setQuickGuestNotes('');

        await loadHomeData();
        router.push({
          pathname: '/invite',
          params: { token: session.initiatorToken },
        });
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'No se pudo crear la sesión de invitación.');
      } finally {
        setCreatingInvite(false);
      }
    },
    [profile, loadHomeData, router]
  );

  const handleQuickInvite = useCallback(() => {
    return createInvite(quickGuestNick, quickGuestNotes, expiryOption);
  }, [createInvite, quickGuestNick, quickGuestNotes, expiryOption]);

  const reset = useCallback(() => {
    setShowQuickInvite(false);
    setQuickGuestNick('');
    setQuickGuestNotes('');
  }, []);

  return {
    createInvite,
    isCreating: creatingInvite,
    showQuickInvite,
    setShowQuickInvite,
    quickGuestNick,
    setQuickGuestNick,
    quickGuestNotes,
    setQuickGuestNotes,
    creatingInvite,
    expiryOption,
    setExpiryOption,
    handleQuickInvite,
    reset,
  };
}
