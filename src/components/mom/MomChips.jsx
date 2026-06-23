import React from "react";
import { THEME_COLORS } from "../../constants/colors";

const STATUS_STYLES = {
  OPEN: { bg: "rgba(45, 90, 143, 0.1)", color: THEME_COLORS.deepBlue, label: "Open" },
  IN_PROGRESS: { bg: "rgba(90, 155, 168, 0.15)", color: THEME_COLORS.mediumTeal, label: "In Progress" },
  BLOCKED: { bg: "rgba(239, 68, 68, 0.12)", color: THEME_COLORS.errorRed, label: "Blocked" },
  DONE: { bg: "rgba(34, 197, 94, 0.12)", color: "#15803d", label: "Done" },
};

const PRIORITY_STYLES = {
  P1: { bg: "rgba(239, 68, 68, 0.12)", color: THEME_COLORS.errorRed, label: "P1" },
  P2: { bg: "rgba(184, 148, 90, 0.15)", color: THEME_COLORS.gold, label: "P2" },
  P3: { bg: "rgba(45, 90, 143, 0.08)", color: THEME_COLORS.deepBlue, label: "P3" },
};

const chipStyle = (bg, color) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.02em",
  background: bg,
  color,
  whiteSpace: "nowrap",
});

export function StatusChip({ status }) {
  const key = (status || "OPEN").toUpperCase();
  const s = STATUS_STYLES[key] || STATUS_STYLES.OPEN;
  return <span style={chipStyle(s.bg, s.color)}>{s.label}</span>;
}

export function PriorityChip({ priority }) {
  const key = (priority || "P3").toUpperCase();
  const s = PRIORITY_STYLES[key] || PRIORITY_STYLES.P3;
  return <span style={chipStyle(s.bg, s.color)}>{s.label}</span>;
}

export const ACTION_STATUSES = Object.keys(STATUS_STYLES);
export const ACTION_PRIORITIES = Object.keys(PRIORITY_STYLES);
