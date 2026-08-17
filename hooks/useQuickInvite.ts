import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { createSession } from '@/lib/sessions';
import { UserProfile } from '@/types';
import { useHomeStore } from '@/stores/homeStore';
import { VaultLockGateAPI } from '@/lib/cryptoVault';
import { notify } from '@/lib/notify';

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
      if (!profile?.nickname) {
        notify('Perfil requerido', 'Crea o desbloquea tu perfil cifrado antes de invitar.');
        return;
      }

      const responses = profile.baseResponses ?? [];
      if (!responses.length) {
        if (profile.secretsCipher && !VaultLockGateAPI.isUnlocked()) {
          notify(
            'Bóveda bloqueada',
            'Tus respuestas están en la bóveda. Desbloquéala con tu PIN (barra de perfil) y vuelve a intentar.'
          );
          return;
        }
        notify(
          'Sin respuestas',
          'Completa el cuestionario o el perfil rápido primero para tener respuestas base.'
        );
        return;
      }
      if (!guestNick.trim()) {
        notify('Nombre requerido', 'Ingresa el nombre de la otra persona.');
        return;
      }

      setCreatingInvite(true);
      try {
        // Chip expiry applies to local sessions (and remote→local fallback).
        // Remote create_zk_session still uses server 48h TTL when it succeeds.
        let expiresAt: string | undefined;
        if (expiry === '48h') {
          expiresAt = new Date(Date.now() + 48 * 3600_000).toISOString();
        } else if (expiry === '7d') {
          expiresAt = new Date(Date.now() + 7 * 86400_000).toISOString();
        }

        const session = await createSession(
          profile.nickname,
          responses,
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
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : 'No se pudo crear la sesión de invitación.';
        notify('Error', message);
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
