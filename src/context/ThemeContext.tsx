import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type AppTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: AppTheme;
  isDark: boolean;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'nexora_app_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
      // Migrate legacy 'bw' or 'default'
      if (stored === 'bw') return 'dark';
      if (stored === 'default') return 'light';

      // Check system preference if available
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      // fallback
    }
    return 'light';
  });

  const applyThemeToDOM = useCallback((t: AppTheme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;

      // Remove legacy classes
      root.classList.remove('theme-bw');
      body.classList.remove('theme-bw');

      if (t === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        body.classList.add('dark');
        body.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
        body.classList.add('light');
        body.classList.remove('dark');
        root.style.colorScheme = 'light';
      }

      // Update mobile browser status bar theme color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', t === 'dark' ? '#090D16' : '#000000');
      }
    }
  }, []);

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme, applyThemeToDOM]);

  const setTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
