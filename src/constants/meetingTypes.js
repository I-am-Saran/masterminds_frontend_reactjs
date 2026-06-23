/**
 * Allowed MoM meeting types (stored as display strings in meeting_type).
 */
export const MeetingType = Object.freeze({
  DAILY_STANDUP: "Daily Standup",
  SPRINT_PLANNING: "Sprint Planning",
  SPRINT_REVIEW: "Sprint Review",
  BUG_TRIAGE: "Bug Triage",
  QA_REVIEW: "QA Review",
  UAT_DISCUSSION: "UAT Discussion",
  PROJECT_REVIEW: "Project Review",
  GOVERNANCE_REVIEW: "Governance Review",
  CLIENT_DISCUSSION: "Client Discussion",
  INCIDENT_REVIEW: "Incident Review",
  RCA_DISCUSSION: "RCA Discussion",
  INTERNAL_SYNC: "Internal Sync",
});

/** @type {readonly string[]} */
export const MEETING_TYPES = Object.freeze(Object.values(MeetingType));

export const MEETING_TYPE_OPTIONS = MEETING_TYPES.map((value) => ({
  value,
  label: value,
}));

export function isMeetingType(value) {
  return MEETING_TYPES.includes(value);
}
