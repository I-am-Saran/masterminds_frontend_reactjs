/**
 * Shared ticket KPI filter logic — count and drill-down table must use the same rules.
 * Status values match backend (app/tasks/repository.py) and KaizenChips.
 */

export const TERMINAL_STATUSES = ["DONE", "CANCELLED"];

export const KPI_STATUS = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "DONE",
  CLOSED: "CANCELLED",
};

export function normalizeStatus(status) {
  return (status || "").toUpperCase().replace(/\s+/g, "_");
}

export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.includes(normalizeStatus(status));
}

/** Active / open queue — not resolved or closed (matches Home "Open Tickets"). */
export function matchesActiveTicket(task) {
  return !isTerminalStatus(task?.status);
}

export function matchesOpenStatus(task) {
  return normalizeStatus(task?.status) === KPI_STATUS.OPEN;
}

export function matchesInProgressStatus(task) {
  return normalizeStatus(task?.status) === KPI_STATUS.IN_PROGRESS;
}

export function matchesResolvedStatus(task) {
  return normalizeStatus(task?.status) === KPI_STATUS.RESOLVED;
}

export function matchesClosedStatus(task) {
  return normalizeStatus(task?.status) === KPI_STATUS.CLOSED;
}

export function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(String(dateStr).slice(0, 10));
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function matchesOverdueTicket(task) {
  if (!task?.due_date) return false;
  const due = new Date(String(task.due_date).slice(0, 10));
  const today = new Date(new Date().toDateString());
  return due < today && !isTerminalStatus(task.status);
}

export function matchesDueTodayTicket(task) {
  const status = normalizeStatus(task?.status);
  return isToday(task?.due_date) && !TERMINAL_STATUSES.includes(status);
}

/** Recently assigned — active tickets sorted by latest activity, top N. */
export function buildRecentlyAssignedList(tasks, limit = 6) {
  return [...tasks]
    .filter(matchesActiveTicket)
    .sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at || 0) -
        new Date(a.updated_at || a.created_at || 0)
    )
    .slice(0, limit);
}

export const MY_TASKS_SEGMENT_FILTERS = {
  all: () => true,
  active: matchesActiveTicket,
  open: matchesOpenStatus,
  in_progress: matchesInProgressStatus,
  closed: (task) => TERMINAL_STATUSES.includes(normalizeStatus(task?.status)),
  due_today: matchesDueTodayTicket,
  overdue: matchesOverdueTicket,
};

export function filterMyTasksBySegment(tasks, segment) {
  const predicate = MY_TASKS_SEGMENT_FILTERS[segment] || MY_TASKS_SEGMENT_FILTERS.all;
  return tasks.filter(predicate);
}

/** Temporary debug logging for KPI drill-down validation. */
export function logKpiDrillDown({ kpiName, cardCount, tableRowCount, filters }) {
  const card = cardCount == null ? "—" : Number(cardCount);
  const rows = tableRowCount == null ? "—" : Number(tableRowCount);
  const match = cardCount != null && tableRowCount != null && card === rows;

  console.log(
    `[KPI Drill-down] ${kpiName}\n` +
      `  Card Count: ${card}\n` +
      `  Table Rows: ${rows}\n` +
      `  Match: ${match ? "YES" : "NO"}\n` +
      `  Filters: ${JSON.stringify(filters)}`
  );
}

export function buildMyTasksDrillDownUrl(segment, { kpi, cardCount } = {}) {
  const params = new URLSearchParams();
  if (segment && segment !== "all") params.set("segment", segment);
  if (kpi) params.set("kpi", kpi);
  if (cardCount != null) params.set("kpiCount", String(cardCount));
  const query = params.toString();
  return `/tasks/my${query ? `?${query}` : ""}`;
}

export function parseOverdueParam(value) {
  return value === "true" || value === "1";
}

export function buildAllTasksDrillDownUrl({ status, overdue, category, kpi, cardCount } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (overdue) params.set("overdue", "true");
  if (category) params.set("category", category);
  if (kpi) params.set("kpi", kpi);
  if (cardCount != null) params.set("kpiCount", String(cardCount));
  const query = params.toString();
  return `/tasks${query ? `?${query}` : ""}`;
}

/** @deprecated Use buildAllTasksDrillDownUrl({ overdue: true }) — keeps /tasks/overdue bookmarks working */
export function buildOverdueDrillDownUrl({ kpi, cardCount } = {}) {
  return buildAllTasksDrillDownUrl({ overdue: true, kpi, cardCount });
}
