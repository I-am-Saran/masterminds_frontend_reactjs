import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useSession } from "../contexts/SessionContext";
import { usePermissions } from "../hooks/usePermissions";
import { useToast } from "../contexts/ToastContext";
import { get } from "../services/api";
import Loader from "./Loader";

// Map routes to modules for permission checking (must match backend module_name)
const ROUTE_MODULE_MAP = {
  '/': null,
  '/tasks': 'kaizen_tasks',
  '/users': 'users',
  '/roles': 'roles',
  '/teams': 'teams',
  '/workflows': 'workflows',
};

function isPasswordAlreadyVerified() {
  return localStorage.getItem('password_changed') === 'true';
}

export default function ProtectedRoute({
  children,
  requiredPermission = 'retrieve',
  requiredModule = null,
  /** When true, only checks module permissions — auth handled by parent layout guard. */
  permissionsOnly = false,
}) {
  const { session, loading, restored } = useSession();
  const location = useLocation();
  const { hasPermission, loading: permsLoading } = usePermissions();
  const { showToast } = useToast();
  const hasShownToastRef = useRef(false);
  const lastPathRef = useRef(location.pathname);
  const initialLoadRef = useRef(true);
  const [checkingPassword, setCheckingPassword] = useState(false);
  const [passwordCheckComplete, setPasswordCheckComplete] = useState(
    () => permissionsOnly || isPasswordAlreadyVerified()
  );

  // CRITICAL: Immediate session check - validate session exists in storage
  useEffect(() => {
    if (permissionsOnly || !restored) return;

    const token = sessionStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      try {
        sessionStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      } catch (e) {
        console.error(e);
      }
    }
  }, [permissionsOnly, restored]);

  // Reset toast ref when pathname changes (do not reset password verification)
  useEffect(() => {
    if (lastPathRef.current !== location.pathname) {
      hasShownToastRef.current = false;
      lastPathRef.current = location.pathname;
      initialLoadRef.current = true;
    }
  }, [location.pathname]);

  // Check if password change is required (once per session, not on every navigation)
  useEffect(() => {
    if (permissionsOnly) return;

    if (location.pathname === '/change-password' || location.pathname === '/login') {
      setPasswordCheckComplete(true);
      return;
    }

    if (!restored || !session || loading || checkingPassword || passwordCheckComplete) {
      return;
    }

    if (isPasswordAlreadyVerified()) {
      setPasswordCheckComplete(true);
      return;
    }

    const checkPasswordChange = async () => {
      try {
        setCheckingPassword(true);
        const response = await get("/api/auth/check-password-change");

        if (response.data?.requires_password_change) {
          setPasswordCheckComplete(true);
        } else {
          localStorage.setItem('password_changed', 'true');
          setPasswordCheckComplete(true);
        }
      } catch (error) {
        console.error('Failed to check password change status:', error);
        setPasswordCheckComplete(true);
      } finally {
        setCheckingPassword(false);
      }
    };

    checkPasswordChange();
  }, [permissionsOnly, session, restored, loading, checkingPassword, passwordCheckComplete, location.pathname]);

  // Check permissions and show toast if needed (only once per navigation)
  useEffect(() => {
    if (loading || permsLoading || !session || !restored) {
      return;
    }

    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    const pathSegments = location.pathname.split('/').filter(Boolean);
    let modulePath = '/' + (pathSegments[0] || '');
    if (modulePath === '/') modulePath = '/';

    const skipModuleCheck = requiredModule === null;
    const module = skipModuleCheck
      ? null
      : requiredModule || ROUTE_MODULE_MAP[modulePath];

    if (module && module !== '/') {
      const hasAccess = hasPermission(module, requiredPermission);

      if (!hasAccess && !hasShownToastRef.current) {
        hasShownToastRef.current = true;
        showToast(
          `You do not have permission to access this page`,
          'warning'
        );
      }
    }
  }, [session, restored, loading, permsLoading, location.pathname, hasPermission, requiredPermission, requiredModule, showToast]);

  if (!permissionsOnly && (loading || permsLoading || checkingPassword)) {
    return <Loader />;
  }

  if (permissionsOnly && permsLoading) {
    return <Loader />;
  }

  if (!permissionsOnly && !session && restored) {
    const token = sessionStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      try {
        sessionStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('password_changed');
      } catch (e) {
        console.error(e);
      }
      return <Navigate to="/login" replace />;
    }
  }

  if (
    !permissionsOnly &&
    session &&
    restored &&
    location.pathname !== '/change-password' &&
    passwordCheckComplete &&
    !checkingPassword &&
    !isPasswordAlreadyVerified()
  ) {
    return <Navigate to="/change-password" replace />;
  }

  if (session && restored && location.pathname !== '/change-password') {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    let modulePath = '/' + (pathSegments[0] || '');
    if (modulePath === '/') modulePath = '/';

    const skipModuleCheck = requiredModule === null;
    const module = skipModuleCheck
      ? null
      : requiredModule || ROUTE_MODULE_MAP[modulePath];

    if (module && module !== '/') {
      const hasAccess = hasPermission(module, requiredPermission);

      if (!hasAccess) {
        return <Navigate to="/403" replace />;
      }
    }
  }

  return children;
}
