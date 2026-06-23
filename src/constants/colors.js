/**
 * Theme-aware color palette — synced with html[data-theme] via applyThemePalette.
 */
import { GREEN_PALETTE } from '../themes/palettes';

/** @type {Record<string, string>} */
const activePalette = { ...GREEN_PALETTE };

/**
 * Apply palette for JS inline styles (THEME_COLORS proxy).
 * @param {Record<string, string>} palette
 */
export function applyThemePalette(palette) {
  Object.keys(activePalette).forEach((key) => {
    if (!(key in palette)) delete activePalette[key];
  });
  Object.assign(activePalette, palette);
}

export const THEME_COLORS = new Proxy(
  {},
  {
    get(_target, prop) {
      if (typeof prop === 'string' && prop in activePalette) {
        return activePalette[prop];
      }
      return undefined;
    },
  },
);

// Initialize green theme on module load
applyThemePalette(GREEN_PALETTE);
