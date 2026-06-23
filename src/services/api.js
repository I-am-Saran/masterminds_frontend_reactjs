// api.js — single, hardened API client
// RULES:
// 1. BASE_URL is the FULL API ROOT (no guessing, no auto-rewrite)
// 2. Callers NEVER access `res` — only returned data or thrown errors
// 3. Errors always throw with { message, status, data }

import { extractApiErrorMessage } from "../utils/apiErrors";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

/**
 * Production proxy (e.g. nginx) often strips the first /api and forwards the rest.
 * So backend receives /security-controls when we send /api/security-controls → Not Found.
 * Backend receives /api/security-controls when we send /api/api/security-controls → OK.
 * When base does NOT end with /api, we must send path as /api/api/... so after strip we get /api/...
 */
function buildUrl(path) {
  if (!path) throw new Error("API path is required");
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  let p = path.startsWith("/") ? path : `/${path}`;

  // All backend routes live under /api — required for Vite dev proxy (/api → :8000)
  if (!p.startsWith("/api/") && p !== "/api") {
    p = `/api${p}`;
  }

  const base = BASE_URL;

  if (base && base.endsWith("/api")) {
    // Base already has /api (e.g. .../api); path should not duplicate
    if (p.startsWith("/api/")) {
      p = p.slice(4);
    } else if (p === "/api") {
      p = "";
    }
    const sep = p && !p.startsWith("/") ? "/" : "";
    return base ? `${base}${sep}${p}` : p;
  }

  if (base && p.startsWith("/api/")) {
    // Production: proxy strips first /api, so send /api/api/... so backend gets /api/...
    // p = "/api" + p;
  }
  return base ? `${base}${p}` : p;
}

/** Use for manual fetch() calls so prod double-/api is applied. */
export function getApiUrl(path) {
  return buildUrl(path);
}

function getAuthToken() {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("auth_token") || null;
  }
  return null;
}

async function request(path, options = {}) {
  const url = buildUrl(path);

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    credentials: "include",
    ...options,
    headers
  });

  // Try to parse JSON safely
  let data = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch (_) {
      data = null;
    }
  } else {
    // If not JSON, maybe text? But usually we expect JSON.
    // Let's leave data as null or try text if needed.
    // For now, keep it null to match previous behavior partially.
  }

  if (!res.ok) {
    if (res.status === 401) {
      // Handle expired or invalid token globally
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("auth_token");
        sessionStorage.removeItem("user_data");
        localStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login?expired=1";
          return new Promise(() => {});
        }
      }
    }

    const err = new Error(extractApiErrorMessage({ data, message: data?.message }, "Request failed"));
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data ?? {};
}

// ---- HTTP helpers ----
// Support both (path, headers) and (path, options) signatures for backward compatibility
// Ideally callers should use (path, options) where options includes headers if needed.

export function get(path, options = {}) {
  // If options is just headers (legacy/incorrect usage from previous refactor), handle it?
  // But standard usage is options.
  // We'll assume options is the options object.
  return request(path, { method: "GET", ...options });
}

export function post(path, body, options = {}) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
    ...options
  });
}

export function put(path, body, options = {}) {
  return request(path, {
    method: "PUT",
    body: JSON.stringify(body ?? {}),
    ...options
  });
}

export function patch(path, body, options = {}) {
  return request(path, {
    method: "PATCH",
    body: JSON.stringify(body ?? {}),
    ...options
  });
}

export function del(path, options = {}) {
  return request(path, { method: "DELETE", ...options });
}

// ---- Auth helpers (optional, but explicit) ----
export function login(payload) {
  return post("/api/auth/login", payload)
}

export function ssoLogin(accessToken) {
  return post("/api/auth/sso/login", { access_token: accessToken });
}

export function logout() {
  return post("/auth/logout", {});
}

export function checkPasswordChange() {
  return get("/auth/check-password-change");
}
