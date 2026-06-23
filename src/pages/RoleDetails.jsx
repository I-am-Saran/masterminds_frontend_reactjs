import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSession } from "../contexts/SessionContext";
import { useToast } from "../contexts/ToastContext";
import { get, put } from "../services/api.js";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  CheckSquare,
  ArrowLeft,
  Shield,
} from "lucide-react";
import Loader from "../components/Loader";
import {
  ModernPageShell,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SectionCard,
  StatusChip,
} from "../components/layout/ModernPageUI";

const ACTION_META = {
  create: { key: "can_create", label: "Create", icon: Plus },
  retrieve: { key: "can_retrieve", label: "Retrieve", icon: Eye },
  update: { key: "can_update", label: "Update", icon: Edit },
  delete: { key: "can_delete", label: "Delete", icon: Trash2 },
  comment: { key: "can_comment", label: "Comment", icon: MessageSquare },
  create_task: { key: "can_create_task", label: "Create Task", icon: CheckSquare },
};

const EMPTY_PERMISSIONS = {
  can_create: false,
  can_retrieve: false,
  can_update: false,
  can_delete: false,
  can_comment: false,
  can_create_task: false,
};

function normalizeModuleCatalog(rawModules) {
  if (!Array.isArray(rawModules)) return [];
  return rawModules
    .map((item) => {
      if (typeof item === "string") {
        return {
          module_name: item,
          display_name: item.replace(/_/g, " "),
          description: "",
          actions: Object.keys(ACTION_META),
        };
      }
      return {
        module_name: item.module_name,
        display_name: item.display_name || item.module_name?.replace(/_/g, " "),
        description: item.description || "",
        actions: Array.isArray(item.actions) ? item.actions : Object.keys(ACTION_META),
      };
    })
    .filter((item) => item.module_name);
}

export default function RoleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const { showToast } = useToast();
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const tenantId = session?.tenant_id || "00000000-0000-0000-0000-000000000001";

  const matrixActions = useMemo(() => {
    const seen = new Set();
    const actions = [];
    modules.forEach((module) => {
      (module.actions || []).forEach((action) => {
        if (!seen.has(action) && ACTION_META[action]) {
          seen.add(action);
          actions.push(action);
        }
      });
    });
    return actions.map((action) => ({ action, ...ACTION_META[action] }));
  }, [modules]);

  useEffect(() => {
    const fetchRoleAndModules = async () => {
      if (!session) return;
      try {
        setLoading(true);

        const modulesJson = await get(`/permissions/modules`);
        if (modulesJson.error) throw new Error(modulesJson.error);

        const catalog = normalizeModuleCatalog(modulesJson.data || []);
        setModules(catalog);

        const json = await get(`/roles/${id}?tenant_id=${tenantId}`);
        if (json.error) throw new Error(json.error);

        setRole(json.data);

        const permsByModule = {};
        catalog.forEach((module) => {
          permsByModule[module.module_name] = { ...EMPTY_PERMISSIONS };
        });
        (json.data.permissions || []).forEach((perm) => {
          if (!permsByModule[perm.module_name]) return;
          permsByModule[perm.module_name] = {
            can_create: perm.can_create || false,
            can_retrieve: perm.can_retrieve || false,
            can_update: perm.can_update || false,
            can_delete: perm.can_delete || false,
            can_comment: perm.can_comment || false,
            can_create_task: perm.can_create_task || false,
          };
        });
        setPermissions(permsByModule);
      } catch (err) {
        showToast(`Failed to load role: ${err.message}`, "error");
        navigate("/roles");
      } finally {
        setLoading(false);
      }
    };

    fetchRoleAndModules();
  }, [id, session, tenantId, navigate, showToast]);

  const moduleSupportsAction = (module, actionKey) =>
    (module.actions || []).includes(actionKey);

  const buildPayloadForModule = (module) => {
    const modulePerms = permissions[module.module_name] || { ...EMPTY_PERMISSIONS };
    const payload = { ...EMPTY_PERMISSIONS };
    (module.actions || []).forEach((action) => {
      const column = ACTION_META[action]?.key;
      if (column) payload[column] = Boolean(modulePerms[column]);
    });
    return payload;
  };

  const handlePermissionChange = (moduleName, actionKey, value) => {
    const column = ACTION_META[actionKey]?.key;
    if (!column) return;
    setPermissions((prev) => ({
      ...prev,
      [moduleName]: {
        ...(prev[moduleName] || { ...EMPTY_PERMISSIONS }),
        [column]: value,
      },
    }));
  };

  const handleSelectAllRow = (module) => {
    const applicableActions = matrixActions.filter((action) =>
      moduleSupportsAction(module, action.action)
    );
    const modulePerms = permissions[module.module_name] || { ...EMPTY_PERMISSIONS };
    const allChecked = applicableActions.every(
      (action) => modulePerms[action.key] === true
    );

    setPermissions((prev) => ({
      ...prev,
      [module.module_name]: {
        ...(prev[module.module_name] || { ...EMPTY_PERMISSIONS }),
        ...Object.fromEntries(
          applicableActions.map((action) => [action.key, !allChecked])
        ),
      },
    }));
  };

  const handleSelectAllColumn = (actionKey) => {
    const column = ACTION_META[actionKey]?.key;
    if (!column) return;
    const applicableModules = modules.filter((module) =>
      moduleSupportsAction(module, actionKey)
    );
    const allChecked = applicableModules.every(
      (module) => permissions[module.module_name]?.[column] === true
    );

    setPermissions((prev) => {
      const newPerms = { ...prev };
      applicableModules.forEach((module) => {
        newPerms[module.module_name] = {
          ...(newPerms[module.module_name] || { ...EMPTY_PERMISSIONS }),
          [column]: !allChecked,
        };
      });
      return newPerms;
    });
  };

  const handleSelectAllTable = () => {
    const allChecked = modules.every((module) =>
      matrixActions
        .filter((action) => moduleSupportsAction(module, action.action))
        .every((action) => permissions[module.module_name]?.[action.key] === true)
    );

    setPermissions((prev) => {
      const newPerms = { ...prev };
      modules.forEach((module) => {
        const next = { ...(newPerms[module.module_name] || { ...EMPTY_PERMISSIONS }) };
        matrixActions
          .filter((action) => moduleSupportsAction(module, action.action))
          .forEach((action) => {
            next[action.key] = !allChecked;
          });
        newPerms[module.module_name] = next;
      });
      return newPerms;
    });
  };

  const handleSavePermissions = async () => {
    if (!role) return;

    setSaving(true);
    try {
      for (const module of modules) {
        await put(`/roles/${id}/permissions`, {
          tenant_id: tenantId,
          module_name: module.module_name,
          permissions: buildPayloadForModule(module),
        });
      }

      showToast("Permissions updated successfully", "success");
    } catch (err) {
      showToast(`Failed to save permissions: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader skeleton="detail" message="Loading role details..." />;
  }

  if (!role) {
    return (
      <ModernPageShell>
        <p className="text-red-600 text-sm">Role not found.</p>
      </ModernPageShell>
    );
  }

  return (
    <ModernPageShell>
      <PageHeader
        title={role.role_name}
        subtitle={role.role_description || "Configure module-level permissions"}
        badge={
          <StatusChip status={role.is_active ? "Active" : "Inactive"} />
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <SecondaryButton onClick={() => navigate("/roles")}>
              <ArrowLeft size={14} />
              Back
            </SecondaryButton>
            <PrimaryButton onClick={handleSavePermissions} disabled={saving} icon={Shield}>
              {saving ? "Saving…" : "Save permissions"}
            </PrimaryButton>
          </div>
        }
      />

      <SectionCard
        title="Permission matrix"
        subtitle="Grant access per Masterminds module. Only actions relevant to each module are shown."
      >
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="admin-permissions-table min-w-[720px]">
            <thead>
              <tr>
                <th className="w-12">#</th>
                <th className="min-w-[220px]">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={modules.every((module) =>
                        matrixActions
                          .filter((action) => moduleSupportsAction(module, action.action))
                          .every((action) => permissions[module.module_name]?.[action.key] === true)
                      )}
                      onChange={handleSelectAllTable}
                      title="Select all modules and actions"
                    />
                    <span>Module</span>
                  </div>
                </th>
                {matrixActions.map((action) => {
                  const applicableModules = modules.filter((module) =>
                    moduleSupportsAction(module, action.action)
                  );
                  const allChecked = applicableModules.every(
                    (module) => permissions[module.module_name]?.[action.key] === true
                  );
                  const IconComponent = action.icon;
                  return (
                    <th key={action.action}>
                      <div className="flex flex-col items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={allChecked}
                          onChange={() => handleSelectAllColumn(action.action)}
                          title={`Select all: ${action.label}`}
                        />
                        <span className="inline-flex items-center gap-1">
                          <IconComponent size={13} className="text-slate-500" />
                          {action.label}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {modules.map((module, index) => {
                const applicableActions = matrixActions.filter((action) =>
                  moduleSupportsAction(module, action.action)
                );
                const rowAllChecked = applicableActions.every(
                  (action) => permissions[module.module_name]?.[action.key] === true
                );
                return (
                  <tr key={module.module_name}>
                    <td className="text-slate-500 text-xs tabular-nums">{index + 1}</td>
                    <td>
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={rowAllChecked}
                          onChange={() => handleSelectAllRow(module)}
                          title={`Select all for ${module.display_name}`}
                          className="mt-1"
                        />
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-slate-800 block">
                            {module.display_name}
                          </span>
                          {module.description ? (
                            <span className="text-xs text-slate-500 block mt-0.5">
                              {module.description}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    {matrixActions.map((action) => (
                      <td key={action.action} className="text-center">
                        {moduleSupportsAction(module, action.action) ? (
                          <input
                            type="checkbox"
                            checked={permissions[module.module_name]?.[action.key] || false}
                            onChange={(e) =>
                              handlePermissionChange(
                                module.module_name,
                                action.action,
                                e.target.checked
                              )
                            }
                          />
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </ModernPageShell>
  );
}
