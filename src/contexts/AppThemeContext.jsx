import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { applyThemePalette } from '../constants/colors';
import {
  THEME_IDS,
  THEME_LABELS,
  THEME_PALETTES,
  VALID_THEME_IDS,
} from '../themes/palettes';
import { readStoredThemeId, THEME_STORAGE_KEY } from '../themes/initTheme';

const STORAGE_KEY = THEME_STORAGE_KEY;

const AppThemeContext = createContext(null);

function applyDomTheme(themeId) {
  const root = document.documentElement;
  root.setAttribute('data-theme', themeId);
  applyThemePalette(THEME_PALETTES[themeId]);
}

export function AppThemeProvider({ children }) {
  const [themeId, setThemeIdState] = useState(readStoredThemeId);

  const setThemeId = useCallback((nextId) => {
    if (!VALID_THEME_IDS.has(nextId)) return;
    applyDomTheme(nextId);
    setThemeIdState(nextId);
    try {
      localStorage.setItem(STORAGE_KEY, nextId);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    document.documentElement.classList.add('kz-theme-switching');
    const nextId = themeId === THEME_IDS.DARK ? THEME_IDS.GREEN : THEME_IDS.DARK;
    setThemeId(nextId);
    window.setTimeout(() => {
      document.documentElement.classList.remove('kz-theme-switching');
    }, 300);
  }, [themeId, setThemeId]);

  useEffect(() => {
    applyDomTheme(themeId);
  }, [themeId]);

  const value = useMemo(
    () => ({
      themeId,
      themeLabel: THEME_LABELS[themeId] ?? themeId,
      colors: THEME_PALETTES[themeId],
      setThemeId,
      toggleTheme,
      themes: [
        { id: THEME_IDS.GREEN, label: THEME_LABELS[THEME_IDS.GREEN] },
        { id: THEME_IDS.DARK, label: THEME_LABELS[THEME_IDS.DARK] },
      ],
      isGreenTheme: themeId === THEME_IDS.GREEN,
      isLightTheme: themeId === THEME_IDS.GREEN,
      isDarkTheme: themeId === THEME_IDS.DARK,
    }),
    [themeId, setThemeId, toggleTheme],
  );

  return (
    <AppThemeContext.Provider value={value}>
      <div className="kaizen-theme-root min-h-full w-full">
        {children}
      </div>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(AppThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return ctx;
}

export function useAppThemeOptional() {
  return useContext(AppThemeContext);
}

export function useThemeColors() {
  return useAppTheme().colors;
}
