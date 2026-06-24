import React, { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import {
  createActionItem,
  updateActionItem,
} from "../../services/momApi";
import { useToast } from "../../contexts/ToastContext";
import { useSession } from "../../contexts/SessionContext";
import { THEME_COLORS } from "../../constants/colors";
import { ACTION_STATUSES, ACTION_PRIORITIES } from "./MomChips";
import CommentsDrawer from "./CommentsDrawer";
import ActionItemAssigneePicker from "./ActionItemAssigneePicker";
import { usePermissions } from "../../hooks/usePermissions";
import CustomSelect from "../ui/Select";

const DEBOUNCE_MS = 600;

function useDebouncedSave(callback, delay = DEBOUNCE_MS) {
  const timer = useRef(null);
  const pending = useRef(new Map());

  const flush = useCallback(
    (id, data) => {
      if (timer.current) clearTimeout(timer.current);
      const prev = pending.current.get(id) || {};
      pending.current.set(id, { ...prev, ...data });
      timer.current = setTimeout(async () => {
        const entries = Array.from(pending.current.entries());
        pending.current.clear();
        for (const [itemId, payload] of entries) {
          await callback(itemId, payload);
        }
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return flush;
}

const cellInputClass =
  "w-full text-sm bg-transparent border-0 border-b border-transparent text-[color:var(--text-primary,var(--kz-text-primary))] hover:border-[color:var(--border-color,var(--kz-border))] focus:border-[color:var(--accent-color,var(--kz-accent-vibrant))] focus:outline-none px-1 py-1.5 transition-colors";

const titleTextareaClass =
  "w-full text-sm bg-[color:var(--surface-secondary,var(--kz-surface-secondary))]/80 border border-[color:var(--border-color,var(--kz-border))] hover:border-[color:var(--border-color,var(--kz-border-strong))] focus:border-[color:var(--accent-color,var(--kz-accent-vibrant))] focus:bg-[color:var(--surface-primary,var(--kz-surface))] text-[color:var(--text-primary,var(--kz-text-primary))] focus:outline-none focus:ring-1 focus:ring-[color:var(--kz-focus-ring)] rounded-lg px-2.5 py-2 leading-relaxed resize-none transition-colors";

const TITLE_MIN_HEIGHT_PX = 72;
const TITLE_MAX_HEIGHT_PX = 200;

const selectClass =
  "w-full text-xs bg-transparent border border-transparent text-[color:var(--text-primary,var(--kz-text-primary))] hover:border-[color:var(--border-color,var(--kz-border))] focus:border-[color:var(--accent-color,var(--kz-accent-vibrant))] focus:outline-none rounded px-1 py-1 cursor-pointer";

function ActionItemTitleField({
  value,
  onChange,
  disabled,
  readOnly,
  placeholder = "Describe the action item…",
  onEscape,
}) {
  const ref = useRef(null);

  const syncHeight = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const contentHeight = el.scrollHeight;
    const next = Math.min(
      Math.max(contentHeight, TITLE_MIN_HEIGHT_PX),
      TITLE_MAX_HEIGHT_PX
    );
    el.style.height = `${next}px`;
    el.style.overflowY = contentHeight > TITLE_MAX_HEIGHT_PX ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    syncHeight();
  }, [value, syncHeight]);

  if (readOnly || disabled) {
    return (
      <div
        className="text-sm whitespace-pre-wrap break-words px-2 py-2 min-h-[72px] rounded-lg bg-[color:var(--surface-secondary,var(--kz-surface-secondary))]/50 text-[color:var(--text-secondary,var(--kz-text-secondary))] border border-[color:var(--border-color,var(--kz-border))]"
      >
        {value || "—"}
      </div>
    );
  }

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={syncHeight}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onEscape?.();
        }
      }}
      placeholder={placeholder}
      rows={3}
      className={titleTextareaClass}
      style={{ minHeight: TITLE_MIN_HEIGHT_PX, maxHeight: TITLE_MAX_HEIGHT_PX }}
    />
  );
}

export default function ActionItemsGrid({
  meetingId,
  items: initialItems = [],
  onItemsChange,
  showMeetingColumn = false,
  readOnly = false,
  highlightActionId = null,
}) {
  const { showToast } = useToast();
  const { session } = useSession();
  const { hasPermission } = usePermissions();
  const canEdit = !readOnly && hasPermission("mom", "update");
  const canCreate = !readOnly && hasPermission("mom", "create");
  const userEmail = session?.user?.email || "";

  const [items, setItems] = useState(initialItems);
  const [savingIds, setSavingIds] = useState(new Set());
  const [newRow, setNewRow] = useState(null);
  const [commentTarget, setCommentTarget] = useState(null);
  const [assigneeNames, setAssigneeNames] = useState({});
  const meetingIdRef = useRef(meetingId);

  // Reset when switching meetings; sync when parent loads items (detail page)
  useEffect(() => {
    if (meetingIdRef.current !== meetingId) {
      meetingIdRef.current = meetingId;
      setItems(initialItems);
      return;
    }
    if (initialItems.length > 0 && items.length === 0) {
      setItems(initialItems);
    }
  }, [meetingId, initialItems, items.length]);

  const highlightId = highlightActionId != null ? String(highlightActionId) : null;

  useEffect(() => {
    if (!highlightId || items.length === 0) return undefined;
    const timer = window.setTimeout(() => {
      const el = document.getElementById(`mom-action-item-${highlightId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [highlightId, items.length]);

  const persistUpdate = useCallback(
    async (id, payload) => {
      if (String(id).startsWith("new-")) return;
      setSavingIds((prev) => new Set(prev).add(id));
      try {
        const res = await updateActionItem(id, payload);
        if (res.success) {
          setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, ...res.data } : item))
          );
        }
      } catch {
        showToast("Failed to save changes", "error");
      } finally {
        setSavingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [showToast]
  );

  const debouncedSave = useDebouncedSave(persistUpdate);

  const handleFieldChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    debouncedSave(id, { [field]: value });
  };

  const rememberAssigneeName = (email, user) => {
    if (!email) return;
    const name = user?.full_name || user?.name;
    if (!name) return;
    setAssigneeNames((prev) => ({
      ...prev,
      [String(email).toLowerCase()]: name,
    }));
  };

  const handleAssigneeSelect = (id, email) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, assignee: email } : item))
    );
    debouncedSave(id, { assignee: email || null });
  };

  const handleAddRow = () => {
    if (!canCreate || !meetingId) return;
    setNewRow({
      id: `new-${Date.now()}`,
      title: "",
      assignee: userEmail,
      due_date: "",
      status: "OPEN",
      priority: "P3",
      comment_count: 0,
    });
  };

  const handleSaveNewRow = async () => {
    if (!newRow?.title?.trim()) {
      showToast("Action title is required", "error");
      return;
    }
    try {
      const res = await createActionItem({
        meeting_id: meetingId,
        title: newRow.title.trim(),
        assignee: newRow.assignee || null,
        due_date: newRow.due_date || null,
        status: newRow.status,
        priority: newRow.priority,
      });
      if (res.success) {
        setItems((prev) => [...prev, res.data]);
        setNewRow(null);
        onItemsChange?.();
        showToast("Action item added", "success");
      }
    } catch {
      showToast("Failed to create action item", "error");
    }
  };

  const handleCommentAdded = () => {
    if (commentTarget) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === commentTarget.id
            ? { ...item, comment_count: (item.comment_count || 0) + 1 }
            : item
        )
      );
    }
  };

  const renderRow = (item, isNew = false) => {
    const isHighlighted = !isNew && highlightId && String(item.id) === highlightId;
    return (
    <tr
      key={item.id}
      id={isNew ? undefined : `mom-action-item-${item.id}`}
      className={`group border-b border-[color:var(--border-color,var(--kz-border))] hover:bg-[color:var(--surface-hover,var(--kz-hover-bg))] transition-colors ${
        isHighlighted ? "bg-[#5a9ba8]/10 ring-2 ring-inset ring-[#5a9ba8]/40" : ""
      }`}
    >
      <td className="px-2 py-2 w-full min-w-0 align-top">
        <ActionItemTitleField
          value={item.title || ""}
          onChange={(text) =>
            isNew
              ? setNewRow((r) => ({ ...r, title: text }))
              : handleFieldChange(item.id, "title", text)
          }
          disabled={!canEdit && !isNew}
          readOnly={!canEdit && !isNew}
          onEscape={isNew ? () => setNewRow(null) : undefined}
        />
      </td>
      {showMeetingColumn && (
        <td className="px-2 py-2 text-xs text-[color:var(--text-secondary,var(--kz-text-secondary))] whitespace-nowrap align-top">
          {item.meeting_title || "—"}
        </td>
      )}
      <td className="px-2 py-2 align-top">
        <ActionItemAssigneePicker
          value={item.assignee || ""}
          actionTitle={item.title || ""}
          nameByEmail={assigneeNames}
          disabled={!canEdit && !isNew}
          onChange={(email, user) => {
            rememberAssigneeName(email, user);
            if (isNew) {
              setNewRow((r) => ({ ...r, assignee: email }));
            } else {
              handleAssigneeSelect(item.id, email, user);
            }
          }}
        />
      </td>
      <td className="px-2 py-2 align-top whitespace-nowrap">
        <input
          type="date"
          value={item.due_date ? item.due_date.slice(0, 10) : ""}
          onChange={(e) =>
            isNew
              ? setNewRow((r) => ({ ...r, due_date: e.target.value }))
              : handleFieldChange(item.id, "due_date", e.target.value || null)
          }
          className={cellInputClass}
          disabled={!canEdit && !isNew}
        />
      </td>
      <td className="px-2 py-2 align-top">
        <CustomSelect
          value={item.status || "OPEN"}
          onChange={(e) =>
            isNew
              ? setNewRow((r) => ({ ...r, status: e.target.value }))
              : handleFieldChange(item.id, "status", e.target.value)
          }
          className={selectClass}
          disabled={!canEdit && !isNew}
          options={ACTION_STATUSES.map((s) => ({
            value: s,
            label: s.replace("_", " "),
          }))}
        />
      </td>
      <td className="px-2 py-2 align-top">
        <CustomSelect
          value={item.priority || "P3"}
          onChange={(e) =>
            isNew
              ? setNewRow((r) => ({ ...r, priority: e.target.value }))
              : handleFieldChange(item.id, "priority", e.target.value)
          }
          className={selectClass}
          disabled={!canEdit && !isNew}
          options={ACTION_PRIORITIES.map((p) => ({ value: p, label: p }))}
        />
      </td>
      <td className="px-2 py-2 align-top whitespace-nowrap">
        <div className="flex items-center gap-1">
          {!isNew && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setCommentTarget(item); }}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md hover:bg-[color:var(--surface-hover,var(--kz-hover-bg))] transition-colors"
              style={{ color: THEME_COLORS.mediumTeal }}
            >
              <MessageSquare size={13} />
              {item.comment_count || 0}
            </button>
          )}
          {isNew ? (
            <>
              <button
                type="button"
                onClick={handleSaveNewRow}
                className="kz-btn-primary text-xs px-2 py-1"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setNewRow(null)}
                className="text-xs px-2 py-1 rounded text-[color:var(--text-secondary,var(--kz-text-secondary))] hover:bg-[color:var(--surface-hover,var(--kz-hover-bg))]"
              >
                Cancel
              </button>
            </>
          ) : null}
          {savingIds.has(item.id) && (
            <span className="text-[10px] text-[color:var(--text-muted,var(--kz-placeholder))]">Saving…</span>
          )}
        </div>
      </td>
    </tr>
    );
  };

  return (
    <>
      <div className="rounded-xl border border-[color:var(--border-color,var(--kz-border))] bg-[color:var(--surface-primary,var(--kz-surface))]">
        <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col />
              {showMeetingColumn && <col style={{ width: 140 }} />}
              <col style={{ width: 180 }} />
              <col style={{ width: 124 }} />
              <col style={{ width: 108 }} />
              <col style={{ width: 72 }} />
              <col style={{ width: 100 }} />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-[color:var(--table-header-bg,var(--kz-table-header-bg))] border-b border-[color:var(--border-color,var(--kz-border))]">
              <tr>
                <th className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--text-secondary,var(--kz-text-secondary))] w-auto">
                  Action Item
                </th>
                {showMeetingColumn && (
                  <th className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--text-secondary,var(--kz-text-secondary))]">
                    Meeting
                  </th>
                )}
                <th className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--text-secondary,var(--kz-text-secondary))]">
                  Assignee
                </th>
                <th className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--text-secondary,var(--kz-text-secondary))]">
                  Due Date
                </th>
                <th className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--text-secondary,var(--kz-text-secondary))]">
                  Status
                </th>
                <th className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--text-secondary,var(--kz-text-secondary))]">
                  Priority
                </th>
                <th className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--text-secondary,var(--kz-text-secondary))]">
                  Comments
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && !newRow && (
                <tr>
                  <td colSpan={showMeetingColumn ? 7 : 6} className="text-center py-8 text-sm text-[color:var(--text-muted,var(--kz-placeholder))]">
                    No action items yet
                  </td>
                </tr>
              )}
              {items.map((item) => renderRow(item))}
              {newRow && renderRow(newRow, true)}
            </tbody>
          </table>
        </div>
        {canCreate && meetingId && !newRow && (
          <button
            type="button"
            onClick={handleAddRow}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium border-t border-[color:var(--border-color,var(--kz-border))] hover:bg-[color:var(--surface-hover,var(--kz-hover-bg))] transition-colors"
            style={{ color: "var(--text-primary, var(--kz-text-primary))" }}
          >
            <Plus size={16} />
            Add action item
          </button>
        )}
      </div>

      <CommentsDrawer
        actionItem={commentTarget}
        open={!!commentTarget}
        onClose={() => setCommentTarget(null)}
        onCommentAdded={handleCommentAdded}
      />
    </>
  );
}
