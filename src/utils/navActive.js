import { getTicketListOrigin } from "./ticketListNav";

/** Normalize pathname for consistent exact comparisons. */
export function normalizePathname(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

const TASK_LIST_SUB_ROUTES = new Set(["my", "raised-by-me", "overdue", "dashboard"]);

/** Ticket detail URLs: /tasks/{id} (not /tasks/my, /tasks/overdue, etc.) */
function isTicketDetailPath(pathname) {
  const normalized = normalizePathname(pathname);
  if (!normalized.startsWith("/tasks/")) return false;
  const segment = normalized.split("/")[2];
  return Boolean(segment) && !TASK_LIST_SUB_ROUTES.has(segment);
}

function matchesPathPrefix(pathname, basePath) {
  const normalized = normalizePathname(pathname);
  const base = normalizePathname(basePath);
  return normalized === base || normalized.startsWith(`${base}/`);
}

function isTicketDetailActiveFor(navPath, pathname) {
  if (!isTicketDetailPath(pathname)) return false;
  return normalizePathname(getTicketListOrigin()) === normalizePathname(navPath);
}

/** Whether a sidebar path should appear active — exact route match only. */
export function isNavItemActive(path, pathname) {
  if (!path || !String(path).trim()) return false;

  const normalized = normalizePathname(pathname);
  const normalizedPath = normalizePathname(path);

  if (normalizedPath === "/") {
    return normalized === "/" || isTicketDetailActiveFor("/", pathname);
  }

  if (normalizedPath === "/tasks/dashboard") {
    return normalized === "/tasks/dashboard" || isTicketDetailActiveFor("/tasks/dashboard", pathname);
  }

  if (normalizedPath === "/tasks/my") {
    return normalized === "/tasks/my" || isTicketDetailActiveFor("/tasks/my", pathname);
  }

  if (normalizedPath === "/tasks/raised-by-me") {
    return (
      normalized === "/tasks/raised-by-me" ||
      isTicketDetailActiveFor("/tasks/raised-by-me", pathname)
    );
  }

  if (normalizedPath === "/tasks") {
    return normalized === "/tasks" || isTicketDetailActiveFor("/tasks", pathname);
  }

  if (normalizedPath === "/workflows/definitions") {
    if (
      normalized === "/workflows" ||
      normalized === "/workflows/definitions" ||
      normalized === "/workflows/new"
    ) {
      return true;
    }
    if (normalized.startsWith("/workflows/")) return true;
    return false;
  }

  if (normalizedPath === "/roles") {
    return matchesPathPrefix(pathname, "/roles");
  }

  if (normalizedPath === "/users") {
    return matchesPathPrefix(pathname, "/users");
  }

  if (normalizedPath === "/teams") {
    return matchesPathPrefix(pathname, "/teams");
  }

  return normalized === normalizedPath;
}
