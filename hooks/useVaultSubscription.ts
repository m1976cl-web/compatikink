import { useEffect } from 'react';
import { useHomeStore } from '@/lib/stores/useHomeStore';
import { VaultLockGateAPI } from '@/lib/cryptoVault';

/**
 * useVaultSubscription.ts
 *
 * Hook que sincroniza automáticamente los eventos de bloqueo/desbloqueo
 * de la Bóveda Zero-Knowledge con el store global de Zustand (useHomeStore).
 */
export function useVaultSubscription() {
  const setVaultOpen = useHomeStore((s) => s.setVaultOpen);

  useEffect(() => {
    const unsub = VaultLockGateAPI.subscribe((snap) => {
      setVaultOpen(snap.unlocked);
    });
    return unsub;
  }, [setVaultOpen]);
}
