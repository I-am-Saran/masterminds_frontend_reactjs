import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import CustomSelect from "../ui/Select";
import { PRIORITY_STYLES } from "./KaizenChips";
import {
  NO_ACTIVE_WORKFLOWS_MSG,
  buildCreateTicketCategoryOptions,
} from "../../constants/workflowConstants";
import { useActiveTicketCategories } from "../../hooks/useActiveTicketCategories";
import { getOriginalDueDate } from "../../utils/taskDueDates";

const emptyForm = {
  title: "",
  description: "",
  priority: "P3",
  due_date: "",
  category: "",
};

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="kz-field-error-row" role="alert">
      <AlertCircle size={12} aria-hidden />
      {message}
    </p>
  );
}

const PRIORITY_OPTIONS = [
  { value: "P3", label: "Low" },
  { value: "P2", label: "Medium" },
  { value: "P1", label: "High" },
];

export default function KaizenTaskForm({
  mode = "create",
  variant = "modal",
  initial,
  history,
  saving,
  onSubmit,
  onCancel,
}) {
  const isEdit = mode === "edit";
  const historyEntries = history || [];
  const { mappings, isLoading: categoriesLoading } = useActiveTicketCategories();
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});

  const originalDueDate = useMemo(
    () => (isEdit ? getOriginalDueDate(initial, historyEntries) : null),
    [historyEntries, initial, isEdit]
  );

  const categoryOptions = useMemo(() => {
    const base = buildCreateTicketCategoryOptions(mappings);
    const seen = new Set();
    const next = [];

    [...base, initial?.category, form.category]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .forEach((value) => {
        if (seen.has(value)) return;
        seen.add(value);
        next.push(value);
      });

    return next;
  }, [form.category, initial?.category, mappings]);

  const createBlocked = !isEdit && !categoriesLoading && categoryOptions.length === 0;

  useEffect(() => {
    if (initial) {
      const currentDue = initial.due_date ? String(initial.due_date).slice(0, 10) : "";
      setForm({
        title: initial.title || "",
        description: initial.description || "",
        priority: initial.priority || "P3",
        due_date: currentDue,
        category: initial.category || "",
      });
    } else {
      setForm({ ...emptyForm });
    }
    setErrors({});
  }, [initial]);

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.description.trim()) next.description = "Description is required.";
    if (!String(form.category || "").trim()) next.category = "Category is required.";
    if (!form.priority) next.priority = "Priority is required.";

    if (!isEdit) {
      if (!form.due_date) {
        next.due_date = "Due date is required.";
      } else {
        const today = new Date(new Date().toDateString());
        const due = new Date(form.due_date);
        if (due < today) next.due_date = "Due date cannot be in the past.";
      }
    } else if (form.due_date && originalDueDate) {
      const revised = new Date(form.due_date);
      const original = new Date(originalDueDate);
      if (revised < original) {
        next.due_date = "Due date cannot be before the original due date.";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (createBlocked) return;
    if (!validate()) return;

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      due_date: form.due_date || null,
      category: form.category.trim() || null,
    });
  };

  const inputClass = (field) => `kz-input${errors[field] ? " kz-input--error" : ""}`;
  const selectClass = (field) => (errors[field] ? "kz-select--error" : "");

  return (
    <form onSubmit={handleSubmit} className={`kz-ticket-form kz-ticket-form--${variant}`}>
      <div className="kz-ticket-form__content">
        {createBlocked ? (
          <div className="kz-ticket-form__notice" role="alert">
            {NO_ACTIVE_WORKFLOWS_MSG}
          </div>
        ) : null}

        <div className="kz-ticket-form__row kz-ticket-form__row--split">
          <div className="kz-ticket-form__field">
            <label htmlFor={`ticket-category-${variant}`} className="kz-field-label kz-field-required">
              Category
            </label>
            {isEdit ? (
              <input
                id={`ticket-category-${variant}`}
                className="kz-input"
                value={form.category}
                readOnly
              />
            ) : (
              <CustomSelect
                id={`ticket-category-${variant}`}
                className={selectClass("category")}
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                disabled={createBlocked || categoriesLoading}
                placeholder={categoriesLoading ? "Loading categories…" : "Select category"}
                options={[
                  {
                    value: "",
                    label: categoriesLoading ? "Loading categories…" : "Select category",
                  },
                  ...categoryOptions.map((option) => ({ value: option, label: option })),
                ]}
              />
            )}
            <FieldError message={errors.category} />
          </div>

          <div className="kz-ticket-form__field">
            <label
              htmlFor={`ticket-due-date-${variant}`}
              className={`kz-field-label${isEdit ? "" : " kz-field-required"}`}
            >
              Due date
            </label>
            {isEdit ? (
              <input
                id={`ticket-due-date-${variant}`}
                type="date"
                className="kz-input"
                value={originalDueDate || ""}
                readOnly
              />
            ) : (
              <>
                <input
                  id={`ticket-due-date-${variant}`}
                  type="date"
                  className={inputClass("due_date")}
                  value={form.due_date}
                  onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))}
                />
                <FieldError message={errors.due_date} />
              </>
            )}
          </div>
        </div>

        {isEdit ? (
          <div className="kz-ticket-form__field">
            <label htmlFor={`ticket-revised-due-date-${variant}`} className="kz-field-label">
              Revised due date
            </label>
            <input
              id={`ticket-revised-due-date-${variant}`}
              type="date"
              className={inputClass("due_date")}
              value={form.due_date}
              min={originalDueDate || undefined}
              onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))}
            />
            <FieldError message={errors.due_date} />
          </div>
        ) : null}

        <div className="kz-ticket-form__field">
          <label htmlFor={`ticket-title-${variant}`} className="kz-field-label kz-field-required">
            Title
          </label>
          <input
            id={`ticket-title-${variant}`}
            className={inputClass("title")}
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            maxLength={1000}
            placeholder="Brief summary of the issue or request"
          />
          <FieldError message={errors.title} />
        </div>

        <div className="kz-ticket-form__field">
          <label htmlFor={`ticket-description-${variant}`} className="kz-field-label kz-field-required">
            Description
          </label>
          <textarea
            id={`ticket-description-${variant}`}
            className={`${inputClass("description")} kz-ticket-form__textarea`}
            rows={4}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Provide context, expected outcome, or anything the next person needs to act quickly."
          />
          <FieldError message={errors.description} />
        </div>

        <div className="kz-ticket-form__row">
          <div className="kz-ticket-form__field">
            <span className="kz-field-label kz-field-required">Priority</span>
            <div className="kz-ticket-form__priority" role="radiogroup" aria-label="Priority">
              {PRIORITY_OPTIONS.map((option) => {
                const style = PRIORITY_STYLES[option.value];
                const priority = option.value;
                const active = form.priority === priority;
                return (
                  <button
                    key={priority}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`kz-priority-option${active ? " kz-priority-option--active" : ""}`}
                    style={
                      active
                        ? { background: style.bg, color: style.color, borderColor: style.color }
                        : undefined
                    }
                    onClick={() => setForm((prev) => ({ ...prev, priority }))}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <FieldError message={errors.priority} />
          </div>
        </div>
      </div>

      <div className="kz-ticket-form__footer">
        <button type="button" onClick={onCancel} className="kz-btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving || createBlocked || (!isEdit && categoriesLoading)} className="kz-btn-primary">
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Ticket"}
        </button>
      </div>
    </form>
  );
}
