/** Kaizen ticket categories — alphabetically sorted, single source of truth (mirrors backend). */
export const TICKET_CATEGORIES = [
  "Application",
  "Automation",
  "CKPL Functional Agent",
  "CKPL Generic Agent",
  "Data",
  "External",
  "Functional Agent",
  "HEPL Functional Agent",
  "HEPL Generic Agent",
  "Immersive Technology",
  "IOT - Hardware",
  "Mobile Application",
  "One MIS",
  "POC - Research",
  "Process Re-engineering",
  "SAP",
  "Technology",
  "Vending Machine",
  "Web Portal/Automation",
  "Website",
];

/** Dropdown options for create/edit; preserves a historical value not in the current list. */
export function buildTicketCategoryOptions(historicalValue) {
  if (!historicalValue || TICKET_CATEGORIES.includes(historicalValue)) {
    return TICKET_CATEGORIES;
  }
  return [...TICKET_CATEGORIES, historicalValue].sort((a, b) => a.localeCompare(b));
}

const NO_ACTIVE_WORKFLOWS_MSG =
  "No active workflows are configured. Please contact the administrator.";

/** Categories with an ACTIVE workflow mapping (excludes draft/inactive/unmapped). */
export function getActiveMappedCategories(mappings = []) {
  const seen = new Set();
  const categories = [];
  for (const mapping of mappings) {
    const status = String(mapping?.workflow_status || "").toUpperCase();
    const category = (mapping?.ticket_category || "").trim();
    if (status !== "ACTIVE" || !category || seen.has(category)) continue;
    seen.add(category);
    categories.push(category);
  }
  return categories.sort((a, b) => a.localeCompare(b));
}

/** Create-ticket dropdown: active mapped categories only. */
export function buildCreateTicketCategoryOptions(mappings = []) {
  return getActiveMappedCategories(mappings);
}

/** Edit-ticket dropdown: active mapped categories + current ticket category if retained. */
export function buildEditTicketCategoryOptions(mappings = [], historicalValue) {
  const active = getActiveMappedCategories(mappings);
  const current = (historicalValue || "").trim();
  if (!current || active.includes(current)) {
    return active;
  }
  return [...active, current].sort((a, b) => a.localeCompare(b));
}

export { NO_ACTIVE_WORKFLOWS_MSG };

export const WORKFLOW_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export function normalizeWorkflowStatus(status) {
  const upper = String(status || "DRAFT").trim().toUpperCase();
  return WORKFLOW_STATUSES.some((item) => item.value === upper) ? upper : "DRAFT";
}

export function displayWorkflowStatus(row) {
  if (row?.workflow_status) return normalizeWorkflowStatus(row.workflow_status);
  if (row?.is_active) return "ACTIVE";
  return "INACTIVE";
}

export function statusLabel(status) {
  const s = WORKFLOW_STATUSES.find((x) => x.value === status);
  return s?.label || status || "Draft";
}

export const ASSIGNMENT_TYPES = [
  { value: "TEAM", label: "Team" },
  { value: "ROLE", label: "Role" },
  { value: "USER", label: "User" },
];

export function emptyLevel(sequence = 1) {
  return {
    clientId: `lvl-${Date.now()}-${sequence}`,
    level_sequence: sequence,
    level_name: `Level ${sequence}`,
    assignment_type: "TEAM",
    assignment_value: "",
    sla_hours: "",
    escalation_enabled: false,
    escalation_type: "TEAM",
    escalation_value: "",
    escalation_label: "",
    mandatory_comments: false,
    mandatory_attachments: false,
    can_reject: false,
    can_reassign: false,
    allow_skip: false,
  };
}

export function normalizeLevelsForApi(levels) {
  return levels.map((l, idx) => ({
    level_sequence: l.level_sequence ?? idx + 1,
    level_name: l.level_name,
    assignment_type: l.assignment_type,
    assignment_value: l.assignment_value || null,
    sla_hours: l.sla_hours === "" || l.sla_hours == null ? null : Number(l.sla_hours),
    escalation_enabled: Boolean(l.escalation_enabled),
    escalation_type: l.escalation_enabled ? l.escalation_type : null,
    escalation_value: l.escalation_enabled ? l.escalation_value || null : null,
    mandatory_comments: Boolean(l.mandatory_comments),
    mandatory_attachments: Boolean(l.mandatory_attachments),
    can_reject: Boolean(l.can_reject),
    can_reassign: Boolean(l.can_reassign),
    allow_skip: Boolean(l.allow_skip),
  }));
}

export function levelsFromApi(levels = []) {
  return levels.map((l) => ({
    clientId: l.id || `lvl-${l.level_sequence}`,
    ...l,
    sla_hours: l.sla_hours ?? "",
    escalation_type: l.escalation_type || "TEAM",
    escalation_value: l.escalation_value || "",
    escalation_label: l.escalation_label || "",
  }));
}
