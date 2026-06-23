import { Navigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import Loader from "./Loader";

/** Restrict route to Super Admin only. */
export default function SuperAdminRoute({ children }) {
  const { isSuperAdmin, loading } = usePermissions();

  if (loading) return <Loader message="Checking access…" />;

  if (!isSuperAdmin) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
