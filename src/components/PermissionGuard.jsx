import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

/**
 * PermissionGuard - Renders children only if user has specific permission.
 * Uses usePermissions hook to check against actual user roles.
 */
export default function PermissionGuard({ children, module, action, fallback = null }) {
  const { hasPermission, loading } = usePermissions();

  if (loading) return null; // Or a loading spinner if preferred

  if (!hasPermission(module, action)) {
    return fallback;
  }

  return <>{children}</>;
}
