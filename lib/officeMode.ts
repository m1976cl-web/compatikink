import { useState, useEffect } from 'react';

type Listener = (active: boolean) => void;
const listeners: Set<Listener> = new Set();
let globalActive = false;

export const OfficeModeAPI = {
  isActive: () => globalActive,
  toggle: (force?: boolean) => {
    globalActive = typeof force === 'boolean' ? force : !globalActive;
    listeners.forEach((fn) => fn(globalActive));
  },
  subscribe: (fn: Listener) => {
    listeners.add(fn);
    fn(globalActive);
    return () => {
      listeners.delete(fn);
    };
  },
};

export function useOfficeMode() {
  const [active, setActive] = useState(globalActive);

  useEffect(() => {
    return OfficeModeAPI.subscribe(setActive);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey shortcut: Alt + Shift + X  OR  Ctrl + Shift + O  OR  Escape when active
      if ((e.altKey && e.shiftKey && e.key.toLowerCase() === 'x') ||
          (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'o')) {
        e.preventDefault();
        OfficeModeAPI.toggle();
      } else if (e.key === 'Escape' && globalActive) {
        e.preventDefault();
        OfficeModeAPI.toggle(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    active,
    toggle: OfficeModeAPI.toggle,
  };
}
