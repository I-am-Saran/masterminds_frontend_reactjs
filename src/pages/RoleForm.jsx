import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSession } from "../contexts/SessionContext";
import { useToast } from "../contexts/ToastContext";
import { get, post, put } from "../services/api.js";
import Loader from "../components/Loader";
import {
  ModernPageShell,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SectionCard,
  AdminFormLabel,
  adminInputClass,
  adminTextareaClass,
} from "../components/layout/ModernPageUI";
import { ArrowLeft, Shield } from "lucide-react";

export default function RoleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const tenantId = session?.tenant_id || "00000000-0000-0000-0000-000000000001";

  const [formData, setFormData] = useState({
    role_name: "",
    role_description: "",
    is_active: true,
  });

  useEffect(() => {
    if (!id) return;
    const fetchRole = async () => {
      try {
        setLoading(true);
        const json = await get(`/roles/${id}?tenant_id=${tenantId}`);
        if (json.error) throw new Error(json.error);

        setFormData({
          role_name: json.data.role_name || "",
          role_description: json.data.role_description || "",
          is_active: json.data.is_active !== false,
        });
      } catch (err) {
        showToast(`Failed to load role: ${err.message}`, "error");
        navigate("/roles");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [id, tenantId, navigate, showToast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.role_name.trim()) {
      showToast("Role name is required", "error");
      return;
    }

    setSaving(true);
    try {
      if (id) {
        const json = await put(`/roles/${id}`, {
          tenant_id: tenantId,
          ...formData,
        });
        if (json.error) throw new Error(json.error);
        showToast("Role updated successfully", "success");
        navigate("/roles");
      } else {
        const json = await post("/roles", {
          tenant_id: tenantId,
          ...formData,
        });
        if (json.error) throw new Error(json.error);
        showToast("Role created successfully", "success");
        navigate(`/roles/${json.data.id}`);
      }
    } catch (err) {
      showToast(`Failed to ${id ? "update" : "create"} role: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader skeleton="default" message="Loading role form..." />;
  }

  return (
    <ModernPageShell>
      <PageHeader
        title={id ? "Edit role" : "Create role"}
        subtitle={
          id ? "Update role name, description, and status" : "Define a new role, then configure permissions"
        }
        action={
          <SecondaryButton onClick={() => navigate("/roles")}>
            <ArrowLeft size={14} />
            Back to roles
          </SecondaryButton>
        }
      />

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <SectionCard title="Role details" subtitle="Basic information for this role">
          <div className="space-y-4">
            <div>
              <AdminFormLabel required>Role name</AdminFormLabel>
              <input
                type="text"
                id="role_name"
                name="role_name"
                value={formData.role_name}
                onChange={handleChange}
                required
                className={adminInputClass}
                placeholder="e.g. Manager, Developer, Viewer"
              />
            </div>

            <div>
              <AdminFormLabel>Description</AdminFormLabel>
              <textarea
                id="role_description"
                name="role_description"
                value={formData.role_description}
                onChange={handleChange}
                rows={4}
                className={adminTextareaClass}
                placeholder="Describe responsibilities and access scope for this role…"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 accent-[#2d5a8f]"
              />
              <span>
                <span className="text-sm font-medium text-slate-800">Active role</span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  Inactive roles cannot be assigned to users
                </span>
              </span>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            <SecondaryButton type="button" onClick={() => navigate("/roles")}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={saving} icon={Shield}>
              {saving ? "Saving…" : id ? "Update role" : "Create role"}
            </PrimaryButton>
          </div>
        </SectionCard>

        {!id && (
          <p className="text-xs text-slate-500 mt-3 px-1">
            After creating the role, you will be taken to the permissions screen to configure module access.
          </p>
        )}
      </form>
    </ModernPageShell>
  );
}
