import React, { useEffect, useMemo, useRef, useState } from "react";
import FormField from "../../components/FormField";
import Loader from "../../components/Loader";
import ModernModal from "../../components/ModernModal";
import {
  ActionIconButton,
  ModernPageShell,
  PageHeader,
  PrimaryButton,
  SearchField,
  SecondaryButton,
  TableCard,
  ToolbarCard,
  ModernDataTable,
} from "../../components/layout/ModernPageUI";
import { useToast } from "../../contexts/ToastContext";
import { useConfirm } from "../../contexts/ConfirmContext";
import {
  createEmailTemplate,
  deleteEmailTemplate,
  fetchEmailEvents,
  fetchEmailTemplates,
  fetchDefaultCreateTicketTemplate,
  fetchTemplateVariables,
  updateEmailTemplate,
} from "../../services/emailApi";
import { FileEdit, FileText, Plus, Trash } from "lucide-react";

const EMPTY_FORM = {
  template_name: "",
  event_code: "",
  subject: "",
  body: "",
  is_active: true,
};

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-[color:var(--border-color,var(--kz-border))] bg-[color:var(--surface-secondary,var(--kz-surface-secondary))] text-[color:var(--text-secondary,var(--kz-text-secondary))]"
      }`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: active ? "#10b981" : "var(--text-muted, var(--kz-placeholder))" }}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function VariablesPanel({ variables, onInsert }) {
  if (!variables) return null;
  const sections = [
    { key: "ticket", title: "Ticket Variables" },
    { key: "user", title: "User Variables" },
    { key: "system", title: "System Variables" },
    { key: "branding", title: "Branding (Inline)" },
  ];
  return (
    <div className="rounded-xl border border-[color:var(--border-color,var(--kz-border))] bg-[color:var(--surface-secondary,var(--kz-surface-secondary))] p-3 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-secondary,var(--kz-text-secondary))]">Available Variables</p>
      {sections.map(({ key, title }) => (
        <div key={key}>
          <p className="text-sm font-medium text-[color:var(--text-primary,var(--kz-text-primary))] mb-1.5">{title}</p>
          <div className="flex flex-wrap gap-1.5">
            {(variables[key] || []).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onInsert(v)}
                className="rounded-md border border-[color:var(--border-color,var(--kz-border))] bg-[color:var(--surface-primary,var(--kz-surface))] px-2 py-1 text-xs font-mono text-[color:var(--accent-color,var(--kz-accent-vibrant))] hover:bg-[color:var(--surface-hover,var(--kz-hover-bg))]"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EmailTemplatesPage() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [templates, setTemplates] = useState([]);
  const [events, setEvents] = useState([]);
  const [variables, setVariables] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [activeField, setActiveField] = useState("body");
  const subjectRef = useRef(null);
  const bodyRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tplRes, evRes, varRes] = await Promise.all([
        fetchEmailTemplates(),
        fetchEmailEvents(),
        fetchTemplateVariables(),
      ]);
      if (!tplRes.error) setTemplates(tplRes.data || []);
      if (!evRes.error) setEvents(evRes.data || []);
      if (!varRes.error) setVariables(varRes.data || null);
    } catch {
      showToast("Failed to load email templates", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const eventOptions = useMemo(
    () => events.map((e) => ({ value: e.event_code, label: e.event_name })),
    [events]
  );

  const eventLabel = (code) => events.find((e) => e.event_code === code)?.event_name || code;

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      event_code: events[0]?.event_code || "",
    });
    setActiveField("body");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      template_name: row.template_name || "",
      event_code: row.event_code || "",
      subject: row.subject || "",
      body: row.body || "",
      is_active: row.is_active !== false,
    });
    setActiveField("body");
    setModalOpen(true);
  };

  const loadDefaultHtmlTemplate = async () => {
    try {
      const res = await fetchDefaultCreateTicketTemplate();
      if (res.error || !res.data?.body) {
        showToast("Failed to load default HTML template", "error");
        return;
      }
      setForm((prev) => ({
        ...prev,
        template_name: prev.template_name || res.data.template_name || "Ticket Created Notification",
        event_code: prev.event_code || res.data.event_code || "CREATE_TICKET",
        subject: res.data.subject || prev.subject,
        body: res.data.body,
      }));
      setActiveField("body");
      showToast("Default HTML template loaded", "success");
    } catch {
      showToast("Failed to load default HTML template", "error");
    }
  };

  const insertVariable = (token) => {
    const field = activeField;
    const current = form[field] || "";
    const el = field === "subject" ? subjectRef.current : bodyRef.current;
    if (el && typeof el.selectionStart === "number") {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = current.slice(0, start) + token + current.slice(end);
      setForm({ ...form, [field]: next });
      requestAnimationFrame(() => {
        el.focus();
        const pos = start + token.length;
        el.setSelectionRange(pos, pos);
      });
      return;
    }
    setForm({ ...form, [field]: current + token });
  };

  const handleSave = async () => {
    if (!form.template_name?.trim() || !form.event_code || !form.subject?.trim() || !form.body?.trim()) {
      showToast("All template fields are required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateEmailTemplate(editing.id, form);
        showToast("Template updated", "success");
      } else {
        await createEmailTemplate(form);
        showToast("Template created", "success");
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err?.message || "Failed to save template", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, templateName) => {
    const ok = await confirm({
      title: "Delete template",
      message: templateName
        ? `Are you sure you want to delete "${templateName}"?`
        : "Are you sure you want to delete this email template?",
    });
    if (!ok) return;
    try {
      await deleteEmailTemplate(id);
      showToast("Template deleted", "success");
      loadData();
    } catch {
      showToast("Failed to delete template", "error");
    }
  };

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) =>
        (t.template_name || "").toLowerCase().includes(q) ||
        (t.event_code || "").toLowerCase().includes(q) ||
        (t.subject || "").toLowerCase().includes(q)
    );
  }, [templates, searchText]);

  const columns = [
    {
      name: "Template",
      grow: 2,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--surface-secondary, var(--kz-surface-secondary))", color: "var(--accent-color, var(--kz-accent-vibrant))" }}>
            <FileText size={16} />
          </div>
          <div>
            <div className="font-medium text-[color:var(--text-primary,var(--kz-text-primary))]">{row.template_name}</div>
            <div className="text-xs text-[color:var(--text-secondary,var(--kz-text-secondary))] truncate max-w-xs">{row.subject}</div>
          </div>
        </div>
      ),
    },
    {
      name: "Event",
      selector: (row) => eventLabel(row.event_code),
      grow: 1,
    },
    {
      name: "Status",
      cell: (row) => <StatusBadge active={row.is_active} />,
      grow: 1,
    },
    {
      name: "Actions",
      center: true,
      cell: (row) => (
        <div className="flex gap-1 justify-center">
          <ActionIconButton onClick={() => openEdit(row)} title="Edit" variant="edit">
            <FileEdit size={16} />
          </ActionIconButton>
          <ActionIconButton onClick={() => handleDelete(row.id, row.template_name)} title="Delete" variant="delete">
            <Trash size={16} />
          </ActionIconButton>
        </div>
      ),
    },
  ];

  if (loading) return <Loader skeleton="table" message="Loading email templates..." />;

  return (
    <ModernPageShell>
      <PageHeader
        title="Email Templates"
        subtitle="Create and manage notification templates with dynamic variables"
        action={
          <PrimaryButton onClick={openCreate} icon={Plus}>
            Create Template
          </PrimaryButton>
        }
      />

      <ToolbarCard>
        <SearchField
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search templates..."
        />
      </ToolbarCard>

      <TableCard>
        <ModernDataTable
          columns={columns}
          data={filtered}
          pagination
          highlightOnHover
        />
      </TableCard>

      <ModernModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Email Template" : "Create Email Template"}
        size="lg"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 max-h-[75vh] overflow-y-auto">
          <div className="lg:col-span-3 space-y-3">
            <FormField
              label="Template Name"
              value={form.template_name}
              onChange={(e) => setForm({ ...form, template_name: e.target.value })}
              required
            />
            <FormField
              label="Event"
              type="select"
              value={form.event_code}
              onChange={(v) => setForm({ ...form, event_code: v })}
              options={eventOptions}
              placeholder="Select event"
            />
            <div>
              <label className="text-sm text-[color:var(--text-secondary,var(--kz-text-secondary))] mb-1 block">Subject</label>
              <input
                ref={subjectRef}
                type="text"
                value={form.subject}
                onFocus={() => setActiveField("subject")}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-xl bg-[color:var(--input-bg,var(--kz-input-bg))] border border-[color:var(--border-color,var(--kz-border))] px-3 py-2 text-[color:var(--text-primary,var(--kz-text-primary))] focus:outline-none focus:ring-2 focus:ring-[color:var(--kz-focus-ring)]"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <label className="text-sm text-[color:var(--text-secondary,var(--kz-text-secondary))] block">HTML Email Body</label>
                <SecondaryButton onClick={loadDefaultHtmlTemplate}>
                  Load Default HTML Template
                </SecondaryButton>
              </div>
              <textarea
                ref={bodyRef}
                value={form.body}
                onFocus={() => setActiveField("body")}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={14}
                placeholder="Paste responsive HTML with inline CSS. Use {{variables}} for dynamic content."
                className="w-full rounded-xl bg-[color:var(--input-bg,var(--kz-input-bg))] border border-[color:var(--border-color,var(--kz-border))] px-3 py-2 text-[color:var(--text-primary,var(--kz-text-primary))] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[color:var(--kz-focus-ring)]"
              />
              <p className="mt-1.5 text-xs text-[color:var(--text-secondary,var(--kz-text-secondary))]">
                Emails are sent as HTML when the body contains HTML markup. Use table-based layout and inline CSS for Outlook and Gmail compatibility.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-[color:var(--text-secondary,var(--kz-text-secondary))] cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="rounded border-[color:var(--border-color,var(--kz-border))]"
              />
              Active
            </label>
          </div>
          <div className="lg:col-span-2">
            <VariablesPanel variables={variables} onInsert={insertVariable} />
            <p className="mt-2 text-xs text-[color:var(--text-secondary,var(--kz-text-secondary))]">
              Click a variable to insert at the cursor in the focused field (Subject or Body).
              Logo: use <code className="text-[color:var(--accent-color,var(--kz-accent-vibrant))]">cid:masterminds_logo</code> in {"<img src>"} — embedded automatically when sending HTML email.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4 pt-2 border-t border-[color:var(--border-color,var(--kz-border))]">
          <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </PrimaryButton>
        </div>
      </ModernModal>
    </ModernPageShell>
  );
}
