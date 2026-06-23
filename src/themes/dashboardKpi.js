import { THEME_COLORS } from '../constants/colors';

/** Theme-aware KPI accent colors for Home and Access module cards. */
export function getKpiGlowPalette() {
  return [
    THEME_COLORS.deepBlue,
    THEME_COLORS.deepBlueLight,
    THEME_COLORS.mediumTeal,
    THEME_COLORS.mediumTealLight,
    THEME_COLORS.copper,
    THEME_COLORS.errorRed,
    THEME_COLORS.gold,
    THEME_COLORS.copperDark,
  ];
}

export function kpiGlowAt(index) {
  const palette = getKpiGlowPalette();
  return palette[index % palette.length];
}

export function getKpiCardStyle(_glow, hovered = false) {
  return {
    background: 'var(--kz-surface)',
    boxShadow: hovered
      ? '0 2px 8px rgba(44, 44, 44, 0.08)'
      : '0 1px 3px rgba(44, 44, 44, 0.06)',
    border: `1px solid ${hovered ? 'var(--kz-border-strong)' : 'var(--kz-border)'}`,
  };
}
