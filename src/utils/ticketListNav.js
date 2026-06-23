import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const RETURN_KEY = "masterminds.ticketListReturn";
const ORIGIN_KEY = "masterminds.ticketListOrigin";

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

/** Sidebar paths that may stay active while viewing /tasks/{id}. */
const TICKET_NAV_ORIGINS = new Set([
  "/",
  "/tasks",
  "/tasks/my",
  "/tasks/raised-by-me",
  "/tasks/dashboard",
]);

function navOriginFromPathname(pathname) {
  const normalized = normalizePath(pathname);
  if (normalized === "/tasks/overdue") return "/tasks/my";
  if (TICKET_NAV_ORIGINS.has(normalized)) return normalized;
  if (normalized.startsWith("/tasks/my")) return "/tasks/my";
  return "/tasks";
}

export function setTicketListNav(pathname, search = "") {
  const pathOnly = normalizePath(pathname);
  const full = search ? `${pathOnly}${search.startsWith("?") ? search : `?${search}`}` : pathOnly;
  try {
    sessionStorage.setItem(RETURN_KEY, full);
    sessionStorage.setItem(ORIGIN_KEY, navOriginFromPathname(pathOnly));
  } catch {
    /* ignore quota / private mode */
  }
}

export function getTicketListReturn() {
  try {
    return sessionStorage.getItem(RETURN_KEY) || "/tasks";
  } catch {
    return "/tasks";
  }
}

export function getTicketListOrigin() {
  try {
    const stored = sessionStorage.getItem(ORIGIN_KEY);
    return navOriginFromPathname(stored || "/tasks");
  } catch {
    return "/tasks";
  }
}

/** Keep sidebar + back link aligned with the current ticket list route. */
export function useSyncTicketListNav() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    setTicketListNav(pathname, search);
  }, [pathname, search]);
}

export function openTicketDetail(navigate, taskId, fromPath) {
  if (fromPath) setTicketListNav(fromPath);
  navigate(`/tasks/${taskId}`);
}
