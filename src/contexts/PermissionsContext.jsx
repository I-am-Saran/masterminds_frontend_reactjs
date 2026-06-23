import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "./SessionContext";
import { get } from "../services/api";
import {
  buildPermissionsMap,
  checkPermission,
  checkRole,
  resolveIsSuperAdmin,
} from "../utils/permissionUtils";

const DEFAULT_TENANT = "00000000-0000-0000-0000-000000000001";
const PERMISSIONS_STALE_MS = 5 * 60 * 1000;

export const permissionsKeys = {
  all: ["user-permissions"],
  user: (userId, tenantId) => [...permissionsKeys.all, userId, tenantId],
};

const PermissionsContext = createContext(null);

async function fetchUserRoles(userId, tenantId) {
  const response = await get(`/api/users/${userId}/roles?tenant_id=${tenantId}`);
  return response?.data || [];
}

export function PermissionsProvider({ children }) {
  const { session } = useSession();
  const userId = session?.user?.id || session?.user_id;
  const sessionTenantId = session?.tenant_id || DEFAULT_TENANT;

  const {
    data: userRoles = [],
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: permissionsKeys.user(userId, sessionTenantId),
    queryFn: () => fetchUserRoles(userId, sessionTenantId),
    enabled: Boolean(userId),
    staleTime: PERMISSIONS_STALE_MS,
    retry: 1,
  });

  const loading = Boolean(userId) && (isLoading || (isFetching && !userRoles.length));

  const isSuperAdmin = useMemo(() => resolveIsSuperAdmin(userRoles), [userRoles]);
  const permissions = useMemo(() => buildPermissionsMap(userRoles), [userRoles]);

  const hasPermission = useCallback(
    (module, action) => checkPermission(permissions, isSuperAdmin, module, action),
    [permissions, isSuperAdmin]
  );

  const hasRole = useCallback((roleName) => checkRole(userRoles, roleName), [userRoles]);

  const value = useMemo(
    () => ({
      userRoles,
      permissions,
      loading,
      isSuperAdmin,
      hasPermission,
      hasRole,
      isError,
      error,
      tenantId: sessionTenantId,
    }),
    [userRoles, permissions, loading, isSuperAdmin, hasPermission, hasRole, isError, error, sessionTenantId]
  );

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissionsContext() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissionsContext must be used within PermissionsProvider");
  }
  return context;
}
