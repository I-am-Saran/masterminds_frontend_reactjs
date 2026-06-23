import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "../contexts/SessionContext";
import { useToast } from "../contexts/ToastContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { permissionsKeys } from "../hooks/usePermissions";
import { get, post, del } from "../services/api.js";
import Loader from "../components/Loader";
import {
  ModernPageShell,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SectionCard,
  AdminEmptyState,
  AdminListRow,
  KpiCard,
} from "../components/layout/ModernPageUI";
import { ArrowLeft, Shield, UserPlus, UserMinus, Users } from "lucide-react";

export default function UserRoles() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [userProfile, setUserProfile] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const tenantId = session?.tenant_id || "00000000-0000-0000-0000-000000000001";
  const currentUserId = session?.user?.id || session?.user_id;

  const refreshPermissionsCache = () => {
    if (userId && userId === currentUserId) {
      queryClient.invalidateQueries({ queryKey: permissionsKeys.user(userId, tenantId) });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;
      try {
        setLoading(true);

        const [rolesJson, allRolesJson, userJson] = await Promise.all([
          get(`/users/${userId}/roles?tenant_id=${tenantId}`),
          get(`/roles?tenant_id=${tenantId}`),
          get(`/users/${encodeURIComponent(userId)}`).catch(() => ({ data: null })),
        ]);

        if (rolesJson.error) throw new Error(rolesJson.error);
        setUserRoles(rolesJson.data || []);

        if (allRolesJson.error) throw new Error(allRolesJson.error);
        setAvailableRoles(allRolesJson.data || []);

        const u = userJson?.data ?? userJson;
        if (u && !u.error) {
          setUserProfile(u);
        } else {
          setUserProfile({ id: userId });
        }
      } catch (err) {
        showToast(`Failed to load data: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, session, tenantId, showToast]);

  const handleAssignRole = async (roleId) => {
    try {
      const json = await post(`/users/${userId}/roles`, {
        role_id: roleId,
        tenant_id: tenantId,
      });
      if (json.error) throw new Error(json.error);

      showToast("Role assigned successfully", "success");

      const rolesJson = await get(`/users/${userId}/roles?tenant_id=${tenantId}`);
      if (!rolesJson.error) {
        setUserRoles(rolesJson.data || []);
      }
      refreshPermissionsCache();
    } catch (err) {
      showToast(`Failed to assign role: ${err.message}`, "error");
    }
  };

  const handleRemoveRole = async (roleId, roleName, roleTenantId) => {
    const ok = await confirm({
      title: "Remove role",
      message: `Are you sure you want to remove "${roleName}" from this user?`,
    });
    if (!ok) return;
    const tid = roleTenantId ?? tenantId;

    try {
      const json = await del(`/users/${userId}/roles/${roleId}?tenant_id=${tid}`);
      if (json.error) throw new Error(json.error);

      showToast("Role removed successfully", "success");
      setUserRoles((prev) => prev.filter((ur) => ur.role_id !== roleId));
      refreshPermissionsCache();
    } catch (err) {
      showToast(`Failed to remove role: ${err.message}`, "error");
    }
  };

  const assignedRoleIds = userRoles.map((ur) => ur.role_id);
  const unassignedRoles = availableRoles.filter((r) => !assignedRoleIds.includes(r.id));

  const displayName = useMemo(() => {
    if (!userProfile) return "User";
    return (
      userProfile.name ||
      userProfile.full_name ||
      (userProfile.email ? userProfile.email.split("@")[0] : "User")
    );
  }, [userProfile]);

  const initial = (displayName.charAt(0) || "?").toUpperCase();

  if (loading) {
    return <Loader skeleton="table" message="Loading user roles..." />;
  }

  return (
    <ModernPageShell>
      <PageHeader
        title="Manage user roles"
        subtitle="Assign or remove roles for this account"
        action={
          <SecondaryButton onClick={() => navigate("/users")}>
            <ArrowLeft size={14} />
            Back to users
          </SecondaryButton>
        }
      />

      <div className="admin-user-hero">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="admin-user-hero-avatar" aria-hidden>
            {initial}
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900 truncate">{displayName}</h2>
            <p className="text-sm text-slate-600 truncate">{userProfile?.email || userId}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 shrink-0 w-full sm:w-auto">
          <KpiCard
            compact
            label="Assigned"
            value={userRoles.length}
            glow="#2d5a8f"
            accent="#2d5a8f"
            icon={Shield}
          />
          <KpiCard
            compact
            label="Available"
            value={unassignedRoles.length}
            glow="#4a7ba8"
            accent="#4a7ba8"
            icon={UserPlus}
          />
          <div className="col-span-2 sm:col-span-1 min-w-0">
            <KpiCard
              compact
              label="Total roles"
              value={availableRoles.length}
              glow="#5a9ba8"
              accent="#5a9ba8"
              icon={Users}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <SectionCard
          title="Assigned roles"
          subtitle={`${userRoles.length} role${userRoles.length === 1 ? "" : "s"} currently active`}
        >
          {userRoles.length === 0 ? (
            <AdminEmptyState
              icon={Shield}
              title="No roles assigned"
              description="Assign a role from the panel on the right."
            />
          ) : (
            <div className="admin-list-stack">
              {userRoles.map((userRole) => {
                const role = availableRoles.find((r) => r.id === userRole.role_id);
                const name = role?.role_name || "Unknown role";
                return (
                  <AdminListRow
                    key={userRole.id ?? userRole.role_id}
                    title={name}
                    description={role?.role_description}
                  >
                    <SecondaryButton
                      className="!text-red-600 !border-red-200 hover:!bg-red-50 h-8 px-3 text-xs"
                      onClick={() =>
                        handleRemoveRole(userRole.role_id, name, userRole.tenant_id)
                      }
                    >
                      <UserMinus size={14} />
                      Remove
                    </SecondaryButton>
                  </AdminListRow>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Available roles"
          subtitle={
            unassignedRoles.length === 0
              ? "All tenant roles are already assigned"
              : "Click assign to grant access"
          }
        >
          {unassignedRoles.length === 0 ? (
            <AdminEmptyState
              icon={UserPlus}
              title="All roles assigned"
              description="This user has every available role for this tenant."
            />
          ) : (
            <div className="admin-list-stack">
              {unassignedRoles.map((role) => (
                <AdminListRow
                  key={role.id}
                  title={role.role_name}
                  description={role.role_description}
                >
                  <PrimaryButton
                    className="h-8 px-3 text-xs"
                    onClick={() => handleAssignRole(role.id)}
                  >
                    <UserPlus size={14} />
                    Assign
                  </PrimaryButton>
                </AdminListRow>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </ModernPageShell>
  );
}
