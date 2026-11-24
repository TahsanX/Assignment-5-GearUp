'use client';

import { useCallback, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'gearup_theme';

/**
 * The `dark` class on <html> is the single source of truth. An inline script in
 * the root layout sets it before first paint, so reading it here avoids both a
 * flash of the wrong theme and a setState-in-effect hydration pass.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

// The server cannot know the visitor's preference; the inline script corrects
// the class before hydration, and light matches the default token set.
function getServerSnapshot(): Theme {
  return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next: Theme = getSnapshot() === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private browsing can reject writes; the toggle still applies visually.
    }
    listeners.forEach((listener) => listener());
  }, []);

  return { theme, toggle };
}
