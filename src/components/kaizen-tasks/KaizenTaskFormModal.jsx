import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  Calendar,
  FileText,
  Layers,
  Tag,
  X,
} from "lucide-react";
import { KAIZEN_PRIORITIES, PRIORITY_STYLES } from "./KaizenChips";
import {
  NO_ACTIVE_WORKFLOWS_MSG,
  buildCreateTicketCategoryOptions,
} from "../../constants/workflowConstants";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useActiveTicketCategories } from "../../hooks/useActiveTicketCategories";
import { getOriginalDueDate } from "../../utils/taskDueDates";
import CustomSelect from "../ui/Select";

const emptyForm = {
  title: "",
  description: "",
  priority: "P3",
  due_date: "",
  revised_due_date: "",
  category: "",
  tags: "",
  comments: "",
};

const EMPTY_HISTORY = [];
const EXIT_MS = 220;

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="kz-field-error-row" role="alert">
      <AlertCircle size={12} aria-hidden />
      {message}
    </p>
  );
}

export default function KaizenTaskFormModal({
  open,
  onClose,
  onSubmit,
  saving,
  initial,
  history,
  title = "Create Ticket",
}) {
  const isEdit = Boolean(initial?.id);
  const historyEntries = history ?? EMPTY_HISTORY;
  const previousOverflowRef = useRef("");
  const prefersReducedMotion = usePrefersReducedMotion();
  const [form, setForm] = useState(() => ({ ...emptyForm }));
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState(open ? "enter" : "exit");
  const { mappings, isLoading: categoriesLoading } = useActiveTicketCategories();
  const exitDuration = prefersReducedMotion ? 0 : EXIT_MS;
  const categoryOptions = useMemo(
    () => (isEdit ? [] : buildCreateTicketCategoryOptions(mappings)),
    [isEdit, mappings]
  );
  const lockedCategory = isEdit ? (initial?.category || form.category || "").trim() : "";
  const createBlocked = !isEdit && !categoriesLoading && categoryOptions.length === 0;
  const originalDueDate = useMemo(
    () => (isEdit ? getOriginalDueDate(initial, historyEntries) : null),
    [isEdit, initial, historyEntries]
  );

  useEffect(() => {
    if (open) {
      previousOverflowRef.current = document.body.style.overflow;
      setMounted(true);
      setPhase("enter");
      document.body.style.overflow = "hidden";
      return undefined;
    }

    if (mounted) {
      setPhase("exit");
      const timer = setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = previousOverflowRef.current;
      }, exitDuration);
      return () => clearTimeout(timer);
    }

    document.body.style.overflow = previousOverflowRef.current;
    return () => {
      document.body.style.overflow = previousOverflowRef.current;
    };
  }, [open, mounted, exitDuration]);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      const currentDue = initial.due_date ? String(initial.due_date).slice(0, 10) : "";
      const original = getOriginalDueDate(initial, historyEntries);
      setForm({
        title: initial.title || "",
        description: initial.description || "",
        priority: initial.priority || "P3",
        due_date: original || currentDue,
        revised_due_date:
          original && currentDue && original !== currentDue ? currentDue : currentDue,
        category: initial.category || "",
        tags: Array.isArray(initial.tags) ? initial.tags.join(", ") : "",
        comments: initial.comments || "",
      });
    } else {
      setForm({ ...emptyForm });
    }
    setErrors({});
  }, [open, initial, historyEntries]);

  if (!mounted) return null;

  const backdropClass = phase === "exit" ? "kz-modal-backdrop--exit" : "kz-modal-backdrop--enter";
  const panelClass = phase === "exit" ? "kz-modal-panel--exit" : "kz-modal-panel--enter";

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.description.trim()) next.description = "Description is required.";
    if (!isEdit) {
      if (!form.category) next.category = "Category is required.";
    } else if (!lockedCategory) {
      next.category = "Category is missing on this ticket.";
    }
    if (!form.priority) next.priority = "Priority is required.";

    if (!isEdit) {
      if (!form.due_date) next.due_date = "Due date is required.";
      if (form.due_date) {
        const today = new Date(new Date().toDateString());
        const due = new Date(form.due_date);
        if (due < today) next.due_date = "Due date cannot be in the past.";
      }
    }

    if (isEdit && form.revised_due_date && originalDueDate) {
      const revised = new Date(form.revised_due_date);
      const original = new Date(originalDueDate);
      if (revised < original) {
        next.revised_due_date = "Revised due date cannot be before the original due date.";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (createBlocked) return;
    if (!validate()) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
    };

    if (!isEdit) {
      payload.category = form.category || null;
    }

    if (isEdit) {
      if (
        form.revised_due_date &&
        form.revised_due_date !== String(initial?.due_date || "").slice(0, 10)
      ) {
        payload.due_date = form.revised_due_date;
      }
      if (initial?.owner_email) {
        payload.owner_email = initial.owner_email;
      }
    } else {
      payload.due_date = form.due_date || null;
    }

    onSubmit(payload);
  };

  const inputClass = (field) =>
    `kz-input${errors[field] ? " kz-input--error" : ""}`;

  return createPortal(
    <div
      className={`kz-modal-overlay ${backdropClass}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`kz-modal-panel kz-modal-panel--ticket-form ${panelClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-form-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="kz-modal-header kz-modal-header--accent">
          <div className="kz-modal-title-wrap">
            <h2 id="ticket-form-title" className="kz-modal-title">
              {title}
            </h2>
            <p className="kz-modal-subtitle">
              {isEdit
                ? "Update ticket details and SLA information."
                : "Fill in the details below to submit a new ticket."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="kz-modal-close" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="kz-ticket-form">
          <div className="kz-modal-body space-y-3">
            {createBlocked ? (
              <div
                className="rounded-lg px-3 py-2.5 text-sm"
                role="alert"
                style={{
                  background: "rgba(249, 115, 22, 0.1)",
                  border: "1px solid rgba(249, 115, 22, 0.25)",
                  color: "#9a3412",
                }}
              >
                {NO_ACTIVE_WORKFLOWS_MSG}
              </div>
            ) : null}
            <section className="kz-form-section kz-form-section--elevated">
              <h3 className="kz-form-section-title">
                <span className="kz-form-section-title-icon">
                  <FileText size={15} />
                </span>
                Ticket Information
              </h3>
              <div className="kz-form-grid kz-form-grid--2">
                <div className="kz-form-field">
                  <label htmlFor="ticket-category" className="kz-field-label kz-field-required">
                    Category
                  </label>
                  {isEdit ? (
                    <input
                      id="ticket-category"
                      type="text"
                      className="kz-input kz-input--readonly"
                      value={lockedCategory || "—"}
                      readOnly
                      aria-readonly="true"
                    />
                  ) : (
                    <CustomSelect
                      id="ticket-category"
                      className={inputClass("category")}
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      disabled={createBlocked || categoriesLoading}
                      placeholder={categoriesLoading ? "Loading categories…" : "Select category"}
                      options={[
                        {
                          value: "",
                          label: categoriesLoading ? "Loading categories…" : "Select category",
                        },
                        ...categoryOptions.map((c) => ({ value: c, label: c })),
                      ]}
                    />
                  )}
                  <FieldError message={errors.category} />
                </div>
                {!isEdit ? (
                  <div className="kz-form-field">
                    <label htmlFor="ticket-due-date" className="kz-field-label kz-field-required">
                      Due Date
                    </label>
                    <input
                      id="ticket-due-date"
                      type="date"
                      className={inputClass("due_date")}
                      value={form.due_date}
                      onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                    />
                    <FieldError message={errors.due_date} />
                  </div>
                ) : null}
                <div className="kz-form-field kz-form-field--full">
                  <label htmlFor="ticket-title" className="kz-field-label kz-field-required">
                    Title
                  </label>
                  <input
                    id="ticket-title"
                    className={inputClass("title")}
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    maxLength={1000}
                    placeholder="Brief summary of the issue or request"
                  />
                  <FieldError message={errors.title} />
                </div>
                <div className="kz-form-field kz-form-field--full">
                  <label htmlFor="ticket-description" className="kz-field-label kz-field-required">
                    Description
                  </label>
                  <textarea
                    id="ticket-description"
                    className={inputClass("description")}
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Provide context, steps to reproduce, or expected outcome"
                  />
                  <FieldError message={errors.description} />
                </div>
              </div>
            </section>

            <section className="kz-form-section kz-form-section--elevated">
              <h3 className="kz-form-section-title">
                <span className="kz-form-section-title-icon">
                  <Layers size={15} />
                </span>
                Priority &amp; Impact
              </h3>
              <div className="kz-form-field">
                <span className="kz-field-label kz-field-required">Priority</span>
                <div className="kz-priority-picker" role="radiogroup" aria-label="Priority">
                  {KAIZEN_PRIORITIES.map((p) => {
                    const style = PRIORITY_STYLES[p];
                    const active = form.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        className={`kz-priority-option${active ? " kz-priority-option--active" : ""}`}
                        style={
                          active
                            ? { background: style.bg, color: style.color, borderColor: style.color }
                            : undefined
                        }
                        onClick={() => setForm((f) => ({ ...f, priority: p }))}
                      >
                        {style.label}
                      </button>
                    );
                  })}
                </div>
                <FieldError message={errors.priority} />
              </div>
            </section>

            {isEdit ? (
              <section className="kz-form-section kz-form-section--elevated">
                <h3 className="kz-form-section-title">
                  <span className="kz-form-section-title-icon">
                    <Calendar size={15} />
                  </span>
                  SLA
                </h3>
                <div className="kz-form-grid kz-form-grid--2">
                  <div className="kz-form-field">
                    <label htmlFor="ticket-due-date" className="kz-field-label">
                      Due Date
                    </label>
                    <input
                      id="ticket-due-date"
                      type="date"
                      className="kz-input kz-input--readonly"
                      value={form.due_date}
                      readOnly
                    />
                  </div>
                  <div className="kz-form-field">
                    <label htmlFor="ticket-revised-due-date" className="kz-field-label">
                      Revised Due Date
                    </label>
                    <input
                      id="ticket-revised-due-date"
                      type="date"
                      className={inputClass("revised_due_date")}
                      value={form.revised_due_date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, revised_due_date: e.target.value }))
                      }
                    />
                    <FieldError message={errors.revised_due_date} />
                  </div>
                </div>
              </section>
            ) : null}

            {/* TODO: Attachments will be enabled in future release.
            <section className="kz-form-section kz-form-section--elevated">
              <h3 className="kz-form-section-title">
                <span className="kz-form-section-title-icon">
                  <Paperclip size={15} />
                </span>
                Attachments
              </h3>
              ...
            </section>
            */}

            <section className="kz-form-section kz-form-section--elevated">
              <h3 className="kz-form-section-title">
                <span className="kz-form-section-title-icon">
                  <Tag size={15} />
                </span>
                Additional Details
              </h3>
              <div className="kz-form-grid kz-form-grid--2">
                <div className="kz-form-field kz-form-field--full">
                  <label htmlFor="ticket-tags" className="kz-field-label">
                    Tags
                  </label>
                  <input
                    id="ticket-tags"
                    className="kz-input"
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="e.g. billing, urgent"
                  />
                </div>
                <div className="kz-form-field kz-form-field--full">
                  <label htmlFor="ticket-comments" className="kz-field-label">
                    Internal Notes
                  </label>
                  <textarea
                    id="ticket-comments"
                    className="kz-input"
                    rows={2}
                    value={form.comments}
                    onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
                    placeholder="Optional notes for reviewers"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="kz-modal-footer kz-modal-footer--sticky">
            <button type="button" onClick={onClose} className="kz-btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || createBlocked || (!isEdit && categoriesLoading)}
              className="kz-btn-primary"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
