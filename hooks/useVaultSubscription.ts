import { useEffect } from 'react';
import { useHomeStore } from '@/stores/homeStore';
import { VaultLockGateAPI } from '@/lib/cryptoVault';

export function useVaultSubscription() {
  const setVaultOpen = useHomeStore((s) => s.setVaultOpen);

  useEffect(() => {
    const unsub = VaultLockGateAPI.subscribe((snap) => {
      setVaultOpen(snap.unlocked);
    });
    return unsub;
  }, [setVaultOpen]);
}
