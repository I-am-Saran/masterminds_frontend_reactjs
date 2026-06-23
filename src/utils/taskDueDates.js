/** Original due date from history (first due_date set) or current task value. */
export function getOriginalDueDate(task, history = []) {
  const entries = history
    .filter((h) => h.field_name === "due_date")
    .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));

  if (entries.length > 0) {
    const first = entries[0].new_value;
    return first ? String(first).slice(0, 10) : null;
  }

  return task?.due_date ? String(task.due_date).slice(0, 10) : null;
}

/** Effective revised due date when it differs from the original. */
export function getRevisedDueDate(task, history = []) {
  const original = getOriginalDueDate(task, history);
  const current = task?.due_date ? String(task.due_date).slice(0, 10) : null;
  if (!current || !original || current === original) return null;
  return current;
}

export function formatDateLabel(value) {
  if (!value) return "—";
  const d = new Date(String(value).slice(0, 10));
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}
