import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const resetWasOffline = () => setWasOffline(false);

  return { isOnline, wasOffline, resetWasOffline };
}
