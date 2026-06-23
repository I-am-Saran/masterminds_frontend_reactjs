/**
 * Master Minds theme palettes — light (green brand) and dark enterprise SaaS.
 */

export const THEME_IDS = {
  GREEN: "green",
  DARK: "dark",
};

/** @type {Record<string, string>} */
export const GREEN_PALETTE = {
  deepBlue: "#1A1A1A",
  cyan: "#C8D1C1",
  gold: "#D7FF31",
  copper: "#757575",
  offWhite: "#E9EAE3",
  whiteSmoke: "#FFFFFF",
  darkTeal: "#2C2C2C",
  mediumTeal: "#C8D1C1",
  lightBlue: "#C8D1C1",
  lightMint: "#D7FF31",
  darkGoldenrod: "#D7FF31",
  tan: "#E9EAE3",
  dustStorm: "#C8D1C1",
  vanDykeBrown: "#757575",
  deepBlueLight: "#3d3d3d",
  deepBlueDark: "#0f0f0f",
  cyanLight: "#dce3d6",
  cyanDark: "#a8b5a0",
  goldLight: "#e8ff6b",
  goldDark: "#b8d628",
  copperLight: "#9a9a9a",
  copperDark: "#5a5a5a",
  errorRed: "#FF3B30",
  errorRedDark: "#d42f26",
  darkTealLight: "#3d3d3d",
  darkTealDark: "#1a1a1a",
  mediumTealLight: "#dce3d6",
  mediumTealDark: "#a8b5a0",
  lightBlueLight: "#dce3d6",
  lightBlueDark: "#a8b5a0",
  lightMintLight: "#e8ff6b",
  lightMintDark: "#b8d628",
  darkGoldenrodLight: "#e8ff6b",
  darkGoldenrodDark: "#b8d628",
  tanLight: "#FFFFFF",
  tanDark: "#dde0d8",
  dustStormLight: "#dce3d6",
  dustStormDark: "#a8b5a0",
  vanDykeBrownLight: "#9a9a9a",
  vanDykeBrownDark: "#5a5a5a",
  textPrimary: "#1A1A1A",
  textSecondary: "#757575",
  textInverse: "#FFFFFF",
  accentVibrant: "#D7FF31",
  accentMuted: "#C8D1C1",
  surfaceDark: "#2C2C2C",
  alert: "#FF3B30",
};

/** @type {Record<string, string>} */
export const DARK_PALETTE = {
  ...GREEN_PALETTE,
  deepBlue: "#FFFFFF",
  whiteSmoke: "#1C212D",
  offWhite: "#232937",
  tan: "#1C212D",
  textPrimary: "#FFFFFF",
  textSecondary: "#B8C0CC",
  textInverse: "#111111",
  copper: "#8A93A6",
  vanDykeBrown: "#8A93A6",
  darkTeal: "#161A23",
  surfaceDark: "#161A23",
  lightBlue: "#2E3647",
  mediumTeal: "#2E3647",
  cyan: "#2E3647",
  dustStorm: "#2E3647",
};

export const THEME_PALETTES = {
  [THEME_IDS.GREEN]: GREEN_PALETTE,
  [THEME_IDS.DARK]: DARK_PALETTE,
};

export const THEME_LABELS = {
  [THEME_IDS.GREEN]: "Light",
  [THEME_IDS.DARK]: "Dark",
};

export const VALID_THEME_IDS = new Set(Object.values(THEME_IDS));
