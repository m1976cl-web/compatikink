/**
 * useQuickInvite.ts
 * Extrae la lógica de creación de invitaciones rápidas del HomeScreen.
 * Antes estaba inlined en app/index.tsx (líneas 229-268).
 */
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createLocalSession } from '@/lib/storage';
import { UserProfile } from '@/types';

export function useQuickInvite(
  profile: UserProfile | null,
  onSuccess: () => Promise<void>
) {
  const router = useRouter();
  const [showQuickInvite, setShowQuickInvite] = useState(false);
  const [quickGuestNick, setQuickGuestNick] = useState('');
  const [quickGuestNotes, setQuickGuestNotes] = useState('');
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [expiryOption, setExpiryOption] = useState<'24h' | '7d' | 'none'>('24h');

  const handleQuickInvite = useCallback(async () => {
    if (!profile || !profile.baseResponses || profile.baseResponses.length === 0) {
      Alert.alert('Sin respuestas', 'Responde tu cuestionario base primero.');
      return;
    }
    if (!quickGuestNick.trim()) {
      Alert.alert('Nombre requerido', 'Ingresa el nombre de la otra persona.');
      return;
    }
    setCreatingInvite(true);
    try {
      const guestNotesObj = { nickname: quickGuestNick.trim(), notes: quickGuestNotes.trim() };
      let expiresAt: string | undefined;
      if (expiryOption === '24h') {
        expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (expiryOption === '7d') {
        expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }
      const session = await createLocalSession(
        profile.nickname,
        profile.baseResponses,
        profile,
        expiresAt
      );
      const { saveGuestProfile } = await import('@/lib/storage');
      await saveGuestProfile(session.id, guestNotesObj);
      Alert.alert('Invitación creada', 'Envía el código a tu pareja.');
      setShowQuickInvite(false);
      setQuickGuestNick('');
      setQuickGuestNotes('');
      await onSuccess();
      router.push({ pathname: '/invite', params: { token: session.initiatorToken } });
    } catch {
      Alert.alert('Error', 'No se pudo crear la sesión de invitación.');
    } finally {
      setCreatingInvite(false);
    }
  }, [profile, quickGuestNick, quickGuestNotes, expiryOption, onSuccess, router]);

  const reset = useCallback(() => {
    setShowQuickInvite(false);
    setQuickGuestNick('');
    setQuickGuestNotes('');
  }, []);

  return {
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
