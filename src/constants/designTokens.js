/**
 * Kaizen brand design tokens — single source of truth.
 *
 * Sourced from original GREEN_PALETTE (git 5dbc867c: src/themes/palettes.js)
 * and GREEN theme CSS variables (git 5dbc867c: src/styles/themes.css).
 */
export const KZ = {
  /** Chartreuse highlight — gold, lightMint, accentVibrant (#D7FF31) */
  brand: "#D7FF31",
  /** goldDark, lightMintDark */
  brandHover: "#B8D628",
  /** goldLight, lightMintLight */
  brandLight: "#E8FF6B",
  /** cyan, accentMuted — sage tint */
  brandMuted: "#C8D1C1",
  /** darkTeal, surfaceDark — charcoal chrome */
  chrome: "#2C2C2C",
  chromeHover: "#1A1A1A",
  /** 2026 SaaS neutrals */
  background: "#F8FAFC",
  backgroundEnd: "#F1F5F9",
  backgroundAlt: "#FFFFFF",
  border: "#E5E7EB",
  borderStrong: "#CBD5E1",
  text: "#0F172A",
  textMuted: "#64748B",
  white: "#FFFFFF",
  danger: "#FF3B30",
  dangerDark: "#D42F26",
  success: "#2E7D32",
  warning: "#EA580C",
  info: "#2563EB",
  activeBg: "rgba(215, 255, 49, 0.22)",
  hoverBg: "rgba(200, 209, 193, 0.35)",
  rowHoverBg: "rgba(215, 255, 49, 0.08)",
  focusRing: "rgba(215, 255, 49, 0.45)",
  shadowAccent: "rgba(215, 255, 49, 0.35)",
  btnText: "#1A1A1A",
  /** Backward-compatible aliases used by Phase 2 components */
  primary: "#D7FF31",
  primaryHover: "#B8D628",
  light: "#C8D1C1",
};

export const KZ_RGB = {
  brand: "215, 255, 49",
  chrome: "44, 44, 44",
  sage: "200, 209, 193",
};

export const KZ_SHADOW =
  "0 1px 3px rgba(44, 44, 44, 0.1), 0 4px 12px rgba(215, 255, 49, 0.12)";
