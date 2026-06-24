import React, { useEffect, useMemo, useState } from "react";
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
  MASKED_PASSWORD,
  createEmailConfiguration,
  deleteEmailConfiguration,
  fetchEmailConfigurations,
  fetchEmailProviders,
  testEmailConfiguration,
  updateEmailConfiguration,
} from "../../services/emailApi";
import { FileEdit, Mail, Plus, Trash, Zap } from "lucide-react";

const EMPTY_FORM = {
  configuration_name: "",
  provider: "generic_smtp",
  smtp_host: "",
  smtp_port: "587",
  authentication_required: true,
  username: "",
  password: "",
  from_email: "",
  from_name: "",
  is_active: false,
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

export default function EmailConfigurationPage() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [configs, setConfigs] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cfgRes, provRes] = await Promise.all([
        fetchEmailConfigurations(),
        fetchEmailProviders(),
      ]);
      if (!cfgRes.error) setConfigs(cfgRes.data || []);
      if (!provRes.error) setProviders(provRes.data || []);
    } catch {
      showToast("Failed to load email configurations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setTestResult(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      configuration_name: row.configuration_name || "",
      provider: row.provider || "generic_smtp",
      smtp_host: row.smtp_host || "",
      smtp_port: String(row.smtp_port ?? "587"),
      authentication_required: row.authentication_required !== false,
      username: row.username || "",
      password: row.has_password ? MASKED_PASSWORD : "",
      from_email: row.from_email || "",
      from_name: row.from_name || "",
      is_active: Boolean(row.is_active),
    });
    setTestResult(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.configuration_name?.trim() || !form.smtp_host?.trim() || !form.from_email?.trim()) {
      showToast("Configuration name, SMTP host, and from email are required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        smtp_port: Number(form.smtp_port),
        password: form.password === MASKED_PASSWORD ? MASKED_PASSWORD : form.password,
      };
      if (editing) {
        await updateEmailConfiguration(editing.id, payload);
        showToast("Configuration updated", "success");
      } else {
        await createEmailConfiguration(payload);
        showToast("Configuration created", "success");
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err?.message || "Failed to save configuration", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, configName) => {
    const ok = await confirm({
      title: "Delete configuration",
      message: configName
        ? `Are you sure you want to delete "${configName}"?`
        : "Are you sure you want to delete this SMTP configuration?",
    });
    if (!ok) return;
    try {
      await deleteEmailConfiguration(id);
      showToast("Configuration deleted", "success");
      loadData();
    } catch {
      showToast("Failed to delete configuration", "error");
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const payload = {
        ...form,
        id: editing?.id,
        smtp_port: Number(form.smtp_port),
        password: form.password === MASKED_PASSWORD ? MASKED_PASSWORD : form.password,
      };
      const res = await testEmailConfiguration(payload);
      const result = res?.data || {};
      setTestResult(result);
      showToast(result.message || "Test completed", result.success ? "success" : "error");
    } catch (err) {
      const message = err?.message || "Connection test failed";
      setTestResult({ success: false, message });
      showToast(message, "error");
    } finally {
      setTesting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return configs;
    return configs.filter(
      (c) =>
        (c.configuration_name || "").toLowerCase().includes(q) ||
        (c.smtp_host || "").toLowerCase().includes(q) ||
        (c.from_email || "").toLowerCase().includes(q)
    );
  }, [configs, searchText]);

  const columns = [
    {
      name: "Configuration",
      grow: 2,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--surface-secondary, var(--kz-surface-secondary))", color: "var(--accent-color, var(--kz-accent-vibrant))" }}>
            <Mail size={16} />
          </div>
          <div>
            <div className="font-medium text-[color:var(--text-primary,var(--kz-text-primary))]">{row.configuration_name}</div>
            <div className="text-xs text-[color:var(--text-secondary,var(--kz-text-secondary))]">{row.smtp_host}:{row.smtp_port}</div>
          </div>
        </div>
      ),
    },
    {
      name: "Provider",
      selector: (row) => row.provider,
      grow: 1,
    },
    {
      name: "From",
      selector: (row) => row.from_email,
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
          <ActionIconButton onClick={() => handleDelete(row.id, row.configuration_name)} title="Delete" variant="delete">
            <Trash size={16} />
          </ActionIconButton>
        </div>
      ),
    },
  ];

  if (loading) return <Loader skeleton="default" message="Loading email configuration..." />;

  return (
    <ModernPageShell>
      <PageHeader
        title="Email Configuration"
        subtitle="Manage SMTP settings for outbound notifications"
        action={
          <PrimaryButton onClick={openCreate} icon={Plus}>
            Add Configuration
          </PrimaryButton>
        }
      />

      <ToolbarCard>
        <SearchField
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search configurations..."
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
        title={editing ? "Edit SMTP Configuration" : "New SMTP Configuration"}
        size="sm"
      >
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <FormField
            label="Configuration Name"
            value={form.configuration_name}
            onChange={(e) => setForm({ ...form, configuration_name: e.target.value })}
            required
          />
          <FormField
            label="Email Provider"
            type="select"
            value={form.provider}
            onChange={(v) => setForm({ ...form, provider: v })}
            options={providers}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="SMTP Host"
              value={form.smtp_host}
              onChange={(e) => setForm({ ...form, smtp_host: e.target.value })}
              required
            />
            <FormField
              label="SMTP Port"
              value={form.smtp_port}
              onChange={(e) => setForm({ ...form, smtp_port: e.target.value })}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-[color:var(--text-secondary,var(--kz-text-secondary))] cursor-pointer">
            <input
              type="checkbox"
              checked={form.authentication_required}
              onChange={(e) => setForm({ ...form, authentication_required: e.target.checked })}
              className="rounded border-[color:var(--border-color,var(--kz-border))]"
            />
            Authentication Required
          </label>
          {form.authentication_required && (
            <>
              <FormField
                label="Username / Email"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              <FormField
                label="Password / App Key"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editing?.has_password ? "Leave masked to keep current password" : ""}
              />
            </>
          )}
          <FormField
            label="From Email Address"
            value={form.from_email}
            onChange={(e) => setForm({ ...form, from_email: e.target.value })}
            required
          />
          <FormField
            label="From Name"
            value={form.from_name}
            onChange={(e) => setForm({ ...form, from_name: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm text-[color:var(--text-secondary,var(--kz-text-secondary))] cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded border-[color:var(--border-color,var(--kz-border))]"
            />
            Active (only one configuration can be active)
          </label>

          {testResult && (
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                testResult.success
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {testResult.message}
            </div>
          )}

          <div className="flex justify-between gap-3 pt-2">
            <SecondaryButton onClick={handleTest} disabled={testing}>
              <Zap size={16} />
              {testing ? "Testing..." : "Test Connection"}
            </SecondaryButton>
            <div className="flex gap-2">
              <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </ModernModal>
    </ModernPageShell>
  );
}
