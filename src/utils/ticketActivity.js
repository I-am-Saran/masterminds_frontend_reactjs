const FIELD_LABELS = {
  status: "Status",
  due_date: "Due date",
  owner_email: "Assignee",
  priority: "Priority",
  title: "Title",
  category: "Category",
  description: "Description",
  is_blocked: "Blocked",
  blocked_reason: "Blocked reason",
  activity: "Workflow",
};

export function formatActivityFieldValue(fieldName, value) {
  if (value === null || value === undefined || value === "") return "—";
  if (fieldName === "due_date") {
    try {
      return new Date(String(value).slice(0, 10)).toLocaleDateString();
    } catch {
      return String(value);
    }
  }
  return String(value);
}

/** Human-readable description of a ticket history entry. */
export function formatTicketActivityChange(entry) {
  const field = entry?.field_name || "field";

  if (field === "activity") {
    const event = parseActivityEvent(entry);
    return event?.message || "Ticket updated";
  }

  const label = FIELD_LABELS[field] || field.replace(/_/g, " ");
  const oldVal = formatActivityFieldValue(field, entry?.old_value);
  const newVal = formatActivityFieldValue(field, entry?.new_value);

  if (oldVal === "—" && newVal !== "—") {
    return `${label} set to ${newVal}`;
  }
  return `${label}: ${oldVal} → ${newVal}`;
}

/** Display name for who performed the change. */
export function formatTicketActivityActor(entry) {
  const email = entry?.changed_by_email;
  if (!email) return "System";
  const local = email.split("@")[0] || email;
  return local.includes(".") ? local.replace(/\./g, " ") : local;
}

export function formatActivityActorInitials(entry) {
  const email = entry?.changed_by_email;
  if (!email) return "SY";
  const local = String(email).split("@")[0] || "?";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

export function formatRelativeActivityTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const ACTIVITY_FIELD_META = {
  status: { label: "Status", tone: "info" },
  priority: { label: "Priority", tone: "warning" },
  owner_email: { label: "Assignee", tone: "brand" },
  due_date: { label: "Due date", tone: "success" },
  title: { label: "Title", tone: "neutral" },
  category: { label: "Category", tone: "purple" },
  description: { label: "Description", tone: "neutral" },
  is_blocked: { label: "Blocked", tone: "danger" },
  blocked_reason: { label: "Blocked reason", tone: "danger" },
  activity: { label: "Workflow", tone: "purple" },
};

/** Human-readable workflow / system activity lines (field_name === "activity"). */
export function parseActivityEvent(entry) {
  if (entry?.field_name !== "activity") return null;

  const message = String(entry?.new_value || "").trim();
  if (!message) {
    return { label: "Update", message: "Ticket updated", tone: "neutral" };
  }

  const lower = message.toLowerCase();

  if (lower.includes("marked as resolved")) {
    return { label: "Resolved", message, tone: "success", status: "DONE" };
  }
  if (lower.includes("ticket cancelled") || lower.includes("rejected")) {
    return { label: "Cancelled", message, tone: "danger", status: "CANCELLED" };
  }
  if (lower.startsWith("work started")) {
    return { label: "Work started", message, tone: "info", status: "IN_PROGRESS" };
  }
  if (lower.includes("workflow") && lower.includes("completed")) {
    return { label: "Workflow completed", message, tone: "success", status: "DONE" };
  }
  if (lower.includes("workflow") && lower.includes("started")) {
    return { label: "Workflow started", message, tone: "brand" };
  }

  return { label: "Workflow", message, tone: "purple" };
}

export function getTicketActivityMeta(fieldName, entry) {
  const field = fieldName || "field";

  if (field === "activity" && entry) {
    const event = parseActivityEvent(entry);
    if (event) {
      return { field, label: event.label, tone: event.tone, event };
    }
  }

  const known = ACTIVITY_FIELD_META[field];
  if (known) return { field, ...known };
  return {
    field,
    label: FIELD_LABELS[field] || field.replace(/_/g, " "),
    tone: "neutral",
  };
}

/** Drop narrative activity rows when a status change was logged at the same moment. */
export function dedupeRedundantActivityEvents(items) {
  if (!Array.isArray(items) || !items.length) return [];

  return items.filter((entry) => {
    if (entry?.field_name !== "activity") return true;

    const entryTime = new Date(entry.created_at || 0).getTime();
    if (Number.isNaN(entryTime)) return true;

    return !items.some((other) => {
      if (other === entry || other?.field_name !== "status") return false;
      if (other.task_id !== entry.task_id) return false;
      const otherTime = new Date(other.created_at || 0).getTime();
      if (Number.isNaN(otherTime)) return false;
      return Math.abs(otherTime - entryTime) <= 2000;
    });
  });
}

/** Display actor for unified timeline rows (email or display name). */
export function formatTimelineActor(actor) {
  if (!actor) return "System";
  const value = String(actor).trim();
  if (!value.includes("@")) return value;
  const local = value.split("@")[0] || value;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(".");
}

/** Detail-page audit timestamp: 15-Jun-2026 09:51 AM */
export function formatTimelineTimestamp(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${day}-${month}-${year} ${time}`;
}

const STATUS_LABELS = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  DONE: "Resolved",
  CANCELLED: "Cancelled",
  BLOCKED: "Blocked",
};

function timeMs(at) {
  const t = new Date(at || 0).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function withinMs(atA, atB, ms) {
  return Math.abs(timeMs(atA) - timeMs(atB)) <= ms;
}

function statusLabel(value) {
  const key = String(value || "").toUpperCase();
  return STATUS_LABELS[key] || String(value || "—");
}

function formatDueDateValue(value) {
  if (!value) return "—";
  try {
    return new Date(String(value).slice(0, 10)).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
}

function mapWorkflowAction(action) {
  const key = String(action || "").toUpperCase();
  const map = {
    STARTED: "LEVEL_ENTERED",
    LEVEL_ENTERED: "LEVEL_ENTERED",
    COMPLETED: "LEVEL_COMPLETED",
    SKIPPED: "SKIPPED",
    REJECTED: "REJECTED",
    REASSIGNED: "REASSIGNED",
  };
  return map[key] || null;
}

function workflowDescription(entry) {
  const detail = String(entry?.comments || "").trim();
  if (detail) return detail;
  const action = String(entry?.action_taken || "").replace(/_/g, " ").trim();
  return action || "Workflow step recorded";
}

function mapHistoryToEvents(entry) {
  const field = entry?.field_name;
  const oldRaw = entry?.old_value;
  const newRaw = entry?.new_value;
  const at = entry.created_at;
  const actor = entry.changed_by_email;
  const id = `h-${entry.id}`;

  if (field === "status") {
    const oldKey = String(oldRaw || "").toUpperCase();
    const newKey = String(newRaw || "").toUpperCase();
    const oldEmpty = !oldRaw || oldRaw === "—";

    if (oldEmpty && newKey === "OPEN") {
      return {
        id,
        eventType: "TICKET_CREATED",
        description: "Ticket created",
        actor,
        at,
        dedupeGroup: "ticket-created",
      };
    }
    if (oldKey === "OPEN" && newKey === "IN_PROGRESS") {
      return {
        id,
        eventType: "WORK_STARTED",
        description: "Work started on ticket",
        actor,
        at,
        dedupeGroup: "work-started",
      };
    }
    if (newKey === "DONE") {
      return {
        id,
        eventType: "TICKET_CLOSED",
        description: `Ticket marked as ${statusLabel(newKey)}`,
        actor,
        at,
        dedupeGroup: "ticket-closed",
      };
    }
    if (newKey === "CANCELLED") {
      return {
        id,
        eventType: "TICKET_CLOSED",
        description: "Ticket cancelled",
        actor,
        at,
        dedupeGroup: "ticket-closed",
      };
    }
    if ((oldKey === "DONE" || oldKey === "CANCELLED") && (newKey === "OPEN" || newKey === "IN_PROGRESS")) {
      return {
        id,
        eventType: "TICKET_REOPENED",
        description: `Ticket reopened (${statusLabel(oldKey)} → ${statusLabel(newKey)})`,
        actor,
        at,
        dedupeGroup: `reopen-${timeMs(at)}`,
      };
    }
    return {
      id,
      eventType: "STATUS_CHANGED",
      description: `Status: ${statusLabel(oldRaw)} → ${statusLabel(newRaw)}`,
      actor,
      at,
      dedupeGroup: `status-${timeMs(at)}-${newKey}`,
    };
  }

  if (field === "activity") {
    const message = String(newRaw || "").trim();
    const lower = message.toLowerCase();
    if (lower.startsWith("work started")) {
      return {
        id,
        eventType: "WORK_STARTED",
        description: message,
        actor,
        at,
        dedupeGroup: "work-started",
      };
    }
    if (lower.includes("rejected") || lower.includes("cancelled")) {
      return {
        id,
        eventType: "REJECTED",
        description: message,
        actor,
        at,
        dedupeGroup: "workflow-rejected",
      };
    }
    if (lower.includes("marked as resolved") || (lower.includes("workflow") && lower.includes("completed"))) {
      return {
        id,
        eventType: "TICKET_CLOSED",
        description: message,
        actor,
        at,
        dedupeGroup: "ticket-closed",
      };
    }
    return {
      id,
      eventType: "ACTIVITY",
      description: message || "Ticket updated",
      actor,
      at,
      dedupeGroup: `activity-${timeMs(at)}`,
    };
  }

  if (field === "due_date") {
    const oldLabel = formatDueDateValue(oldRaw);
    const newLabel = formatDueDateValue(newRaw);
    return {
      id,
      eventType: "DUE_DATE_REVISED",
      description: `Due date revised: ${oldLabel} → ${newLabel}`,
      actor,
      at,
      dedupeGroup: `due-${timeMs(at)}`,
    };
  }

  if (field === "owner_email") {
    return {
      id,
      eventType: "REASSIGNED",
      description: `Assignee: ${oldRaw || "—"} → ${newRaw || "—"}`,
      actor,
      at,
      dedupeGroup: `assignee-${timeMs(at)}`,
    };
  }

  if (field === "attachment" || field === "attachments") {
    return {
      id,
      eventType: "ATTACHMENT_ADDED",
      description: newRaw || "Attachment added",
      actor,
      at,
      dedupeGroup: `attachment-${timeMs(at)}`,
    };
  }

  return {
    id,
    eventType: (FIELD_LABELS[field] || field || "UPDATE").toUpperCase().replace(/\s+/g, "_"),
    description: formatTicketActivityChange(entry),
    actor,
    at,
    dedupeGroup: `${field}-${timeMs(at)}`,
  };
}

function mapWorkflowToEvent(entry) {
  const eventType = mapWorkflowAction(entry?.action_taken);
  if (!eventType) return null;
  return {
    id: `w-${entry.id}`,
    eventType,
    description: workflowDescription(entry),
    actor: entry.performer_name || entry.performer_email,
    at: entry.performed_at,
    dedupeGroup: `${eventType}-${entry.level_id || ""}-${timeMs(entry.performed_at)}`,
  };
}

function mapCommentToEvent(comment) {
  return {
    id: `c-${comment.id}`,
    eventType: "COMMENT_ADDED",
    description: comment.comment || "Comment added",
    actor: comment.author_email,
    at: comment.created_at,
    dedupeGroup: `comment-${comment.id}`,
  };
}

function syntheticTicketCreated(task) {
  if (!task?.created_at) return null;
  return {
    id: `task-created-${task.id}`,
    eventType: "TICKET_CREATED",
    description: "Ticket created",
    actor: task.created_by_email,
    at: task.created_at,
    dedupeGroup: "ticket-created",
  };
}

/** Collapse overlapping audit rows from task history, workflow history, and comments. */
export function dedupeTimelineEvents(events) {
  const sorted = [...events].sort((a, b) => timeMs(b.at) - timeMs(a.at));
  const kept = [];

  for (const event of sorted) {
    const duplicate = kept.some((existing) => {
      if (existing.dedupeGroup && event.dedupeGroup && existing.dedupeGroup === event.dedupeGroup) {
        return true;
      }

      if (!withinMs(existing.at, event.at, 8000)) return false;

      if (
        (existing.eventType === "WORK_STARTED" && event.eventType === "WORK_STARTED") ||
        (existing.eventType === "WORK_STARTED" && event.eventType === "STATUS_CHANGED") ||
        (existing.eventType === "STATUS_CHANGED" && event.eventType === "WORK_STARTED")
      ) {
        return true;
      }

      if (existing.eventType === "TICKET_CLOSED" && event.eventType === "TICKET_CLOSED") {
        return true;
      }

      if (existing.eventType === "TICKET_CLOSED" && event.eventType === "ACTIVITY") {
        return true;
      }

      if (existing.eventType === "LEVEL_COMPLETED" && event.eventType === "ACTIVITY") {
        return true;
      }

      if (existing.eventType === "REJECTED" && event.eventType === "REJECTED") {
        return true;
      }

      if (existing.eventType === "LEVEL_ENTERED" && event.eventType === "LEVEL_ENTERED") {
        const a = existing.description.toLowerCase();
        const b = event.description.toLowerCase();
        return a.includes("advanced") && b.includes("started");
      }

      return false;
    });

    if (!duplicate) {
      kept.push(event);
    }
  }

  return kept.sort((a, b) => timeMs(b.at) - timeMs(a.at));
}

/**
 * Unified ticket detail audit trail.
 * @returns {Array<{ id: string, eventType: string, description: string, actor: string, at: string }>}
 */
export function buildTicketDetailTimeline({
  history = [],
  comments = [],
  workflowHistory = [],
  task = null,
} = {}) {
  const items = [];

  for (const entry of history) {
    const mapped = mapHistoryToEvents(entry);
    if (mapped) items.push(mapped);
  }

  for (const comment of comments) {
    items.push(mapCommentToEvent(comment));
  }

  for (const wh of workflowHistory) {
    const mapped = mapWorkflowToEvent(wh);
    if (mapped) items.push(mapped);
  }

  const hasCreated = items.some((e) => e.eventType === "TICKET_CREATED");
  if (!hasCreated) {
    const synthetic = syntheticTicketCreated(task);
    if (synthetic) items.push(synthetic);
  }

  return dedupeTimelineEvents(items).map(({ dedupeGroup, ...event }) => event);
}
