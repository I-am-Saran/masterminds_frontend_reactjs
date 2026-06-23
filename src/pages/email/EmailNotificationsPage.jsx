import React, { useEffect, useMemo, useState } from "react";
import Loader from "../../components/Loader";
import {
  ModernPageShell,
  PageHeader,
  PrimaryButton,
  SearchField,
  TableCard,
  ToolbarCard,
  ModernDataTable,
} from "../../components/layout/ModernPageUI";
import { useToast } from "../../contexts/ToastContext";
import { fetchEmailNotifications, saveEmailNotifications } from "../../services/emailApi";
import { Bell, Save } from "lucide-react";

export default function EmailNotificationsPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [dirty, setDirty] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchEmailNotifications();
      if (!res.error) {
        setNotifications(res.data || []);
        setDirty(false);
      }
    } catch {
      showToast("Failed to load email notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleEvent = (id, enabled) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, email_enabled: enabled } : n))
    );
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveEmailNotifications(
        notifications.map((n) => ({ id: n.id, email_enabled: Boolean(n.email_enabled) }))
      );
      showToast("Notification settings saved", "success");
      setDirty(false);
      loadData();
    } catch {
      showToast("Failed to save notification settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return notifications;
    return notifications.filter(
      (n) =>
        (n.event_name || "").toLowerCase().includes(q) ||
        (n.event_code || "").toLowerCase().includes(q)
    );
  }, [notifications, searchText]);

  const columns = [
    {
      name: "Event",
      grow: 2,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-700">
            <Bell size={16} />
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.event_name}</div>
            <div className="text-xs text-gray-500 font-mono">{row.event_code}</div>
          </div>
        </div>
      ),
    },
    {
      name: "Enable Email",
      center: true,
      grow: 1,
      cell: (row) => (
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(row.email_enabled)}
            onChange={(e) => toggleEvent(row.id, e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-sm text-gray-700">{row.email_enabled ? "Enabled" : "Disabled"}</span>
        </label>
      ),
    },
  ];

  if (loading) return <Loader skeleton="table" message="Loading email notifications..." />;

  return (
    <ModernPageShell>
      <PageHeader
        title="Email Notifications"
        subtitle="Choose which events trigger outbound email"
        action={
          <PrimaryButton onClick={handleSave} disabled={!dirty || saving} icon={Save}>
            {saving ? "Saving..." : "Save Changes"}
          </PrimaryButton>
        }
      />

      <ToolbarCard>
        <SearchField
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search events..."
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
    </ModernPageShell>
  );
}
