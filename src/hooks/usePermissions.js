import { usePermissionsContext, permissionsKeys } from "../contexts/PermissionsContext";

export { permissionsKeys };

/**
 * Hook to read shared user permissions and roles (single cached fetch per session).
 * Optional tenantIdOverride is accepted for backward compatibility.
 */
export function usePermissions(_tenantIdOverride) {
  const context = usePermissionsContext();

  return {
    hasPermission: context.hasPermission,
    hasRole: context.hasRole,
    userRoles: context.userRoles,
    permissions: context.permissions,
    loading: context.loading,
    isSuperAdmin: context.isSuperAdmin,
  };
}
