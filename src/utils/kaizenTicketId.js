/** User-facing ticket ID prefix (display layer over kaizen_tasks.id UUID). */
export const KZN_TICKET_PREFIX = "KZN-";

export const TICKET_ID_PENDING_LABEL = "Will be generated on save";

/** Min width (px) for data-table Ticket ID column — fits icon + full KZN-XXXXXXXX */
export const TICKET_ID_TABLE_COLUMN_WIDTH = 152;

/**
 * Format kaizen_tasks.id UUID as KZN-XXXXXXXX (first 8 chars, uppercase).
 * @param {string | null | undefined} id
 */
export function formatKaizenTicketId(id) {
  if (id == null || id === "") return "—";
  const raw = String(id);
  if (raw.length < 8) return `${KZN_TICKET_PREFIX}${raw.toUpperCase()}`;
  return `${KZN_TICKET_PREFIX}${raw.substring(0, 8).toUpperCase()}`;
}

/**
 * Parse search input for friendly ticket IDs (KZN-6C67F3F0) or 8-char UUID prefix.
 * @returns {{ apiSearch: string | undefined, uuidPrefix: string | null }}
 */
export function parseTicketSearchQuery(input) {
  const trimmed = (input || "").trim();
  if (!trimmed) {
    return { apiSearch: undefined, uuidPrefix: null };
  }

  const withoutPrefix = trimmed.replace(/^KZN[-\s]?/i, "");
  const hexCandidate = withoutPrefix.replace(/-/g, "");

  if (/^[0-9a-fA-F]{8}$/.test(hexCandidate)) {
    return { apiSearch: undefined, uuidPrefix: hexCandidate.slice(0, 8).toLowerCase() };
  }

  if (/^[0-9a-fA-F]{8,32}$/.test(hexCandidate)) {
    return { apiSearch: undefined, uuidPrefix: hexCandidate.slice(0, 8).toLowerCase() };
  }

  return { apiSearch: trimmed, uuidPrefix: null };
}

/**
 * Match a task row against a normalized 8-char UUID prefix from ticket ID search.
 */
export function taskMatchesUuidPrefix(task, uuidPrefix) {
  if (!uuidPrefix || !task?.id) return false;
  return String(task.id).toLowerCase().startsWith(uuidPrefix.toLowerCase());
}
