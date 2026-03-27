import { useSyncExternalStore, useCallback } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'lime-theme';
const listeners = new Set<() => void>();

function getSnapshot(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem(STORAGE_KEY) as Theme) ??
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function getServerSnapshot(): Theme {
  return 'dark';
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  localStorage.setItem(STORAGE_KEY, theme);
  listeners.forEach((fn) => fn());
}

// Apply initial theme immediately (no useEffect needed)
if (typeof window !== 'undefined') {
  const initial = getSnapshot();
  document.documentElement.classList.add(initial);
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t);
  }, []);

  return { theme, setTheme, toggle };
}
