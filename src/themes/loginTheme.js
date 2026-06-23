import { THEME_IDS } from './palettes';

/** @typedef {typeof LIGHT_LOGIN_THEME} LoginThemeTokens */

export const LIGHT_LOGIN_THEME = {
  bg: '#f4f7fb',
  card: 'rgba(255, 255, 255, 0.82)',
  input: '#ffffff',
  blue: '#2d5a8f',
  blueDark: '#1d4a6f',
  cyan: '#00C0E8',
  glow: 'rgba(45, 90, 143, 0.18)',
  cyanGlow: 'rgba(0, 192, 232, 0.22)',
  text: '#1e293b',
  muted: '#64748b',
  border: 'rgba(45, 90, 143, 0.14)',
  heroPanel: '#eef4fb',
  btnText: '#ffffff',
  cardBorder: 'rgba(255, 255, 255, 0.9)',
  gridRgb: '45, 90, 143',
  orbAccent: '0, 192, 232',
  orbPrimary: '45, 90, 143',
  gradientBase: '#fafbfd',
  gradientMid: '#eef4fb',
  gradientEnd: '#f0f7ff',
};

export const GREEN_LOGIN_THEME = {
  bg: '#E9EAE3',
  card: 'rgba(255, 255, 255, 0.88)',
  input: '#ffffff',
  blue: '#2C2C2C',
  blueDark: '#1a1a1a',
  cyan: '#D7FF31',
  glow: 'rgba(44, 44, 44, 0.14)',
  cyanGlow: 'rgba(215, 255, 49, 0.38)',
  text: '#1A1A1A',
  muted: '#757575',
  border: 'rgba(44, 44, 44, 0.12)',
  heroPanel: '#dde0d8',
  btnText: '#1A1A1A',
  cardBorder: 'rgba(255, 255, 255, 0.95)',
  gridRgb: '44, 44, 44',
  orbAccent: '215, 255, 49',
  orbPrimary: '44, 44, 44',
  gradientBase: '#f2f3ec',
  gradientMid: '#E9EAE3',
  gradientEnd: '#dde0d8',
};

/**
 * @param {string} themeId
 * @returns {LoginThemeTokens}
 */
export function getLoginTheme(themeId) {
  void themeId;
  return GREEN_LOGIN_THEME;
}
