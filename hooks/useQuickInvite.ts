import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createLocalSession } from '@/lib/storage';
import { UserProfile } from '@/types';
import { useHomeStore } from '@/lib/stores/useHomeStore';

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
  const [expiryOption, setExpiryOption] = useState<'24h' | '7d' | 'none'>('24h');

  const createInvite = useCallback(
    async (
      guestNick: string,
      guestNotes: string,
      expiry: '24h' | '7d' | 'none'
    ) => {
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
        let expiresAt: string | undefined;
        if (expiry === '24h') {
          expiresAt = new Date(Date.now() + 86400000).toISOString();
        } else if (expiry === '7d') {
          expiresAt = new Date(Date.now() + 604800000).toISOString();
        }

        const session = await createLocalSession(
          profile.nickname,
          profile.baseResponses,
          profile,
          expiresAt
        );

        const { saveGuestProfile } = await import('@/lib/storage');
        await saveGuestProfile(session.id, {
          nickname: guestNick.trim(),
          notes: guestNotes.trim(),
        });

        setShowQuickInvite(false);
        setQuickGuestNick('');
        setQuickGuestNotes('');

        await loadHomeData();
        router.push({
          pathname: '/invite',
          params: { token: session.initiatorToken },
        });
      } catch {
        Alert.alert('Error', 'No se pudo crear la sesión de invitación.');
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
