import { applyThemePalette } from '../constants/colors';
import { THEME_IDS, THEME_PALETTES, VALID_THEME_IDS } from './palettes';

const STORAGE_KEY = 'kaizen_app_theme';

function readStoredThemeId() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID_THEME_IDS.has(stored)) {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return THEME_IDS.GREEN;
}

/** Apply stored theme before React paint. */
export function initThemeFromStorage() {
  const themeId = readStoredThemeId();
  document.documentElement.setAttribute('data-theme', themeId);
  applyThemePalette(THEME_PALETTES[themeId]);
  return themeId;
}

export { STORAGE_KEY as THEME_STORAGE_KEY, readStoredThemeId };
