import React from "react";
import { resolveWorkflowStatusDisplay } from "../../utils/workflowStatus";

const STATUS_STYLES = {
  OPEN: { className: "kz-chip kz-chip--status-open", label: "Open" },
  IN_PROGRESS: { className: "kz-chip kz-chip--status-in_progress", label: "In Progress" },
  BLOCKED: { className: "kz-chip kz-chip--status-blocked", label: "Blocked" },
  DONE: { className: "kz-chip kz-chip--status-done", label: "Resolved" },
  CANCELLED: { className: "kz-chip kz-chip--status-cancelled", label: "Closed" },
};

const PRIORITY_STYLES = {
  P1: {
    className: "kz-chip kz-chip--priority-p1",
    label: "P1 High",
    bg: "#FEF2F2",
    color: "#B91C1C",
  },
  P2: {
    className: "kz-chip kz-chip--priority-p2",
    label: "P2 Medium",
    bg: "#FFFBEB",
    color: "#B45309",
  },
  P3: {
    className: "kz-chip kz-chip--priority-p3",
    label: "P3 Low",
    bg: "#EFF6FF",
    color: "#1D4ED8",
  },
};

export function KaizenStatusChip({ status }) {
  const key = (status || "OPEN").toUpperCase();
  const s = STATUS_STYLES[key] || STATUS_STYLES.OPEN;
  return <span className={s.className}>{s.label}</span>;
}

export function KaizenPriorityChip({ priority }) {
  const key = (priority || "P3").toUpperCase();
  const s = PRIORITY_STYLES[key] || PRIORITY_STYLES.P3;
  return <span className={s.className}>{s.label}</span>;
}

export function KaizenWorkflowStatusChip({ task, workflowState, className = "" }) {
  const { variant, label } = resolveWorkflowStatusDisplay({ task, workflowState });

  if (variant === "none") {
    return <span className={`text-xs text-neutral-400 ${className}`.trim()}>—</span>;
  }

  return (
    <span
      className={`kz-chip kz-chip--wf-${variant} ${className}`.trim()}
      title={label}
    >
      {label}
    </span>
  );
}

export const KAIZEN_STATUSES = Object.keys(STATUS_STYLES);
export const KAIZEN_PRIORITIES = Object.keys(PRIORITY_STYLES);
export { PRIORITY_STYLES };
