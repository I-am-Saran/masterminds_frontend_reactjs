function formatValidationItem(item) {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return null;

  const msg = item.msg || item.message;
  if (!msg) return null;

  if (Array.isArray(item.loc) && item.loc.length) {
    const path = item.loc
      .filter((part) => part !== "body")
      .map((part) => (typeof part === "number" ? `step ${part + 1}` : String(part)))
      .join(" → ");
    return path ? `${path}: ${msg}` : msg;
  }

  return msg;
}

/**
 * Normalize API / fetch errors into a user-readable string.
 * Handles FastAPI `detail` strings, validation arrays, and nested error payloads.
 */
export function extractApiErrorMessage(err, fallback = "Request failed") {
  if (!err) return fallback;
  if (typeof err === "string") return err;

  const detail = err?.data?.detail ?? err?.detail ?? err?.data?.error ?? err?.error;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const messages = detail.map(formatValidationItem).filter(Boolean);
    if (messages.length) return messages.join("; ");
  }

  if (detail && typeof detail === "object") {
    const nested = detail.message || detail.error || detail.detail;
    if (typeof nested === "string") return nested;
  }

  const message = err?.message;
  if (typeof message === "string" && message && message !== "[object Object]") {
    return message;
  }

  return fallback;
}
