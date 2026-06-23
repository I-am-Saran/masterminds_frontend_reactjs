/**
 * Shared RBAC helpers — used by PermissionsProvider and usePermissions.
 */

const SUPER_ADMIN_VARIANTS = ["super admin", "superadmin", "super_admin", "global super admin"];

export function resolveIsSuperAdmin(userRoles) {
  return (userRoles || []).some((r) => {
    const roleName = r?.roles?.role_name || r?.role_name || "";
    return SUPER_ADMIN_VARIANTS.includes(String(roleName).toLowerCase());
  });
}

export function buildPermissionsMap(userRoles) {
  return (userRoles || []).reduce((acc, userRole) => {
    const rolePerms = userRole?.roles?.permissions || userRole?.permissions || [];

    if (Array.isArray(rolePerms)) {
      rolePerms.forEach((p) => {
        const rawModule = p.module_name;
        if (!rawModule) return;

        const mergePerms = (key) => {
          if (!acc[key]) {
            acc[key] = {
              can_create: false,
              can_retrieve: false,
              can_update: false,
              can_delete: false,
              can_comment: false,
              can_create_task: false,
            };
          }

          if (p.can_create) acc[key].can_create = true;
          if (p.can_retrieve) acc[key].can_retrieve = true;
          if (p.can_update) acc[key].can_update = true;
          if (p.can_delete) acc[key].can_delete = true;
          if (p.can_comment) acc[key].can_comment = true;
          if (p.can_create_task) acc[key].can_create_task = true;
        };

        mergePerms(rawModule);

        const lower = rawModule.toLowerCase();
        if (lower !== rawModule) mergePerms(lower);

        const snake = lower.replace(/\s+/g, "_");
        if (snake !== lower) mergePerms(snake);

        if (snake === "build_tracker" || lower === "build tracker") {
          mergePerms("builds");
        }
        if (snake === "bug" || lower === "bug") {
          mergePerms("bugs");
        }
        if (
          snake === "testcase" ||
          lower === "test case" ||
          snake === "test_cases" ||
          snake === "testcases_module" ||
          snake === "qa_testcases"
        ) {
          mergePerms("testcases");
        }
        if (snake === "testcases") {
          mergePerms("testcase");
        }
      });
    }
    return acc;
  }, {});
}

export function checkPermission(permissions, isSuperAdmin, module, action) {
  if (isSuperAdmin) return true;
  if (!module || !action) return false;

  const actionKey = action.startsWith("can_") ? action : `can_${action}`;
  return permissions[module]?.[actionKey] === true;
}

export function checkRole(userRoles, roleName) {
  if (!roleName) return false;
  const target = String(roleName).trim().toLowerCase();
  return (userRoles || []).some((r) => {
    const name = r?.roles?.role_name || r?.role_name;
    if (!name) return false;
    return String(name).trim().toLowerCase() === target;
  });
}
