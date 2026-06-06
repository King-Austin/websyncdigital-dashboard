'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ theme: 'light', toggle: () => {} });

export function useTheme() {
  return useContext(Ctx);
}

const STORAGE_KEY = 'ws-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start as 'light' on both server and first client render to avoid a
  // hydration mismatch; the stored preference is applied in useEffect.
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as Theme | null;
    if (stored === 'dark' || stored === 'light') setTheme(stored);
  }, []);

  const toggle = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      return next;
    });
  };

  return (
    <Ctx.Provider value={{ theme, toggle }}>
      <div data-theme={theme} style={{ display: 'contents' }}>
        {children}
      </div>
    </Ctx.Provider>
  );
}
