import { useState, useEffect } from 'react';

type Listener = (active: boolean) => void;
const listeners: Set<Listener> = new Set();
let globalActive = false;

export const GlobalSearchAPI = {
  isActive: () => globalActive,
  open: () => {
    globalActive = true;
    listeners.forEach((fn) => fn(true));
  },
  close: () => {
    globalActive = false;
    listeners.forEach((fn) => fn(false));
  },
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

export function useGlobalSearch() {
  const [active, setActive] = useState(globalActive);

  useEffect(() => {
    return GlobalSearchAPI.subscribe(setActive);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey: Cmd+K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        GlobalSearchAPI.toggle();
      } else if (e.key === 'Escape' && globalActive) {
        e.preventDefault();
        GlobalSearchAPI.close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    active,
    open: GlobalSearchAPI.open,
    close: GlobalSearchAPI.close,
    toggle: GlobalSearchAPI.toggle,
  };
}
