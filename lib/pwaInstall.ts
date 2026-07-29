import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

let deferredPrompt: any = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      setIsIOS(isIOSDevice);

      if (deferredPrompt) {
        setCanInstall(true);
      }

      const handler = (e: any) => {
        e.preventDefault();
        deferredPrompt = e;
        setCanInstall(true);
      };

      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstall(false);
      }
      deferredPrompt = null;
    }
  };

  return { canInstall, isIOS, promptInstall };
}
