import { useEffect, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { VaultSession } from '@/lib/cryptoVault';

/**
 * Custom hook to enforce OS-level & multitarea privacy protection.
 * When the app moves to background/inactive state or loses window focus on web:
 * 1. Activates full-screen obscure overlay to prevent recent apps preview / screenshot caching.
 * 2. Immediately locks the RAM vault key (VaultSession.lock()).
 */
export function useAppBackgroundProtection() {
  const [isProtectedBackground, setIsProtectedBackground] = useState(false);

  useEffect(() => {
    // 1. React Native AppState listener (Android / iOS)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setIsProtectedBackground(true);
        VaultSession.lock();
      } else if (nextAppState === 'active') {
        setIsProtectedBackground(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // 2. Web Window Focus & Visibility Listener
    let handleWebBlur: () => void;
    let handleWebFocus: () => void;
    let handleVisibilityChange: () => void;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      handleWebBlur = () => {
        setIsProtectedBackground(true);
        VaultSession.lock();
      };

      handleWebFocus = () => {
        setIsProtectedBackground(false);
      };

      handleVisibilityChange = () => {
        if (document.hidden) {
          setIsProtectedBackground(true);
          VaultSession.lock();
        } else {
          setIsProtectedBackground(false);
        }
      };

      window.addEventListener('blur', handleWebBlur);
      window.addEventListener('focus', handleWebFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      subscription.remove();
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('blur', handleWebBlur);
        window.removeEventListener('focus', handleWebFocus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, []);

  return { isProtectedBackground };
}
