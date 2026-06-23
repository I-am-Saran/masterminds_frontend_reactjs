/** Capitalize first letter; rest lowercase (e.g. praveen → Praveen). */
function capitalizePart(part) {
  const s = String(part || "").trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Capitalize each segment separated by dots (e.g. praveen.a → Praveen.A). */
export function formatDottedLocalPart(localPart) {
  const raw = String(localPart || "").trim();
  if (!raw) return "";
  if (!raw.includes(".")) return capitalizePart(raw);
  return raw
    .split(".")
    .filter((seg) => seg.length > 0)
    .map(capitalizePart)
    .join(".");
}

/** Title-case words; dots inside a token get per-segment caps (praveen.a → Praveen.A). */
function formatNameString(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => formatDottedLocalPart(word))
    .join(" ");
}

/**
 * Display name for greetings and user chrome.
 * Prefers full_name / name; falls back to email local part with Praveen.A-style casing.
 */
export function resolveUserDisplayName(user, fallback = "there") {
  const fullName = user?.full_name?.trim();
  const name = user?.name?.trim();
  const fromProfile = fullName || name;
  if (fromProfile) return formatNameString(fromProfile);

  const emailLocal = user?.email?.split("@")[0]?.trim();
  if (emailLocal) return formatDottedLocalPart(emailLocal);

  return fallback;
}
