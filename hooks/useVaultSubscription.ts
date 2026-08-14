import { useEffect } from 'react';
import { useHomeStore } from '@/stores/homeStore';
import { VaultLockGateAPI } from '@/lib/cryptoVault';

/** Keep home vault flag + profile secrets in sync when PIN unlocks/locks. */
export function useVaultSubscription() {
  const setVaultOpen = useHomeStore((s) => s.setVaultOpen);
  const loadHomeData = useHomeStore((s) => s.loadHomeData);

  useEffect(() => {
    const unsub = VaultLockGateAPI.subscribe((snap) => {
      setVaultOpen(snap.unlocked);
      // Re-open sealed baseResponses after unlock so Quick Invite works.
      void loadHomeData();
    });
    return unsub;
  }, [setVaultOpen, loadHomeData]);
}
