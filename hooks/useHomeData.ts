/**
 * useHomeData.ts
 *
 * Facade que conecta con el store global de Zustand (lib/stores/useHomeStore.ts).
 * Mantiene 100% la firma retrocompatible para todas las pantallas del dashboard.
 */
import { useEffect } from 'react';
import { useHomeStore } from '@/lib/stores/useHomeStore';
import { useVaultSubscription } from './useVaultSubscription';

export function useHomeData() {
  const profile = useHomeStore((s) => s.profile);
  const profilesList = useHomeStore((s) => s.profilesList);
  const sessions = useHomeStore((s) => s.sessions);
  const sceneAgreements = useHomeStore((s) => s.sceneAgreements);
  const loadHomeData = useHomeStore((s) => s.loadHomeData);
  const handleLogin = useHomeStore((s) => s.handleLogin);
  const handleLogout = useHomeStore((s) => s.handleLogout);
  const handlePanicWipe = useHomeStore((s) => s.handlePanicWipe);

  // Sincronización automática en tiempo real de los eventos del Vault con Zustand
  useVaultSubscription();

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  return {
    profile,
    profilesList,
    sessions,
    sceneAgreements,
    loadHomeData,
    handleLogin,
    handleLogout,
    handlePanicWipe,
  };
}
