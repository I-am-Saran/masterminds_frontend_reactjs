import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import Login from "../pages/Login";
import ChangePassword from "../pages/ChangePassword";
import RoleDetails from "../pages/RoleDetails";
import RoleForm from "../pages/RoleForm";
import UserRoles from "../pages/UserRoles";
import Home from "../pages/Home";
import Loader from "../components/Loader";
import NotFound from "../pages/NotFound";
import ServerError from "../pages/ServerError";
import AccessDenied from "../pages/AccessDenied";
import SuperAdminRoute from "../components/SuperAdminRoute";
import {
  UsersPage,
  RolesList,
  TeamsPage,
  KaizenTasksPage,
  KaizenMyTasksPage,
  KaizenRaisedByMePage,
  KaizenOverduePage,
  KaizenDashboardPage,
  KaizenTaskDetailPage,
  WorkflowsListPage,
  WorkflowFormPage,
  WorkflowViewPage,
  EmailConfigurationPage,
  EmailNotificationsPage,
  EmailTemplatesPage,
} from "./lazyPages";

/** Persistent app shell — MainLayout stays mounted during in-app navigation. */
function AppShellRoute() {
  return (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      <Route element={<AppShellRoute />}>
        <Route
          path="/"
          element={<Home />}
        />

        {/* Kaizen — Tickets */}
        <Route
          path="/tasks/dashboard"
          element={
            <ProtectedRoute permissionsOnly requiredPermission="retrieve" requiredModule="kaizen_tasks">
              <Suspense fallback={<Loader message="Loading ticket dashboard..." />}>
                <KaizenDashboardPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/my"
          element={
            <ProtectedRoute permissionsOnly requiredPermission="retrieve" requiredModule="kaizen_tasks">
              <Suspense fallback={<Loader message="Loading my tickets..." />}>
                <KaizenMyTasksPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/raised-by-me"
          element={
            <ProtectedRoute permissionsOnly requiredPermission="retrieve" requiredModule="kaizen_tasks">
              <Suspense fallback={<Loader message="Loading raised tickets..." />}>
                <KaizenRaisedByMePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/overdue"
          element={
            <ProtectedRoute permissionsOnly requiredPermission="retrieve" requiredModule="kaizen_tasks">
              <Suspense fallback={<Loader message="Loading overdue tickets..." />}>
                <KaizenOverduePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:taskId"
          element={
            <ProtectedRoute permissionsOnly requiredPermission="retrieve" requiredModule="kaizen_tasks">
              <Suspense fallback={<Loader message="Loading ticket..." />}>
                <KaizenTaskDetailPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute permissionsOnly requiredPermission="retrieve" requiredModule="kaizen_tasks">
              <Suspense fallback={<Loader message="Loading tickets..." />}>
                <KaizenTasksPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Access */}
        <Route
          path="/teams"
          element={
            <SuperAdminRoute>
              <Suspense fallback={<Loader message="Loading teams..." />}>
                <TeamsPage />
              </Suspense>
            </SuperAdminRoute>
          }
        />
        <Route
          path="/users"
          element={
            <SuperAdminRoute>
              <Suspense fallback={<Loader message="Loading users..." />}>
                <UsersPage />
              </Suspense>
            </SuperAdminRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <SuperAdminRoute>
              <Suspense fallback={<Loader message="Loading roles..." />}>
                <RolesList />
              </Suspense>
            </SuperAdminRoute>
          }
        />
        <Route
          path="/roles/new"
          element={
            <SuperAdminRoute>
              <RoleForm />
            </SuperAdminRoute>
          }
        />
        <Route
          path="/roles/:id"
          element={
            <SuperAdminRoute>
              <RoleDetails />
            </SuperAdminRoute>
          }
        />
        <Route
          path="/roles/:id/edit"
          element={
            <SuperAdminRoute>
              <RoleForm />
            </SuperAdminRoute>
          }
        />
        <Route
          path="/users/:userId/roles"
          element={
            <SuperAdminRoute>
              <UserRoles />
            </SuperAdminRoute>
          }
        />

        {/* Workflows — Super Admin configuration */}
        <Route
          path="/workflows"
          element={<Navigate to="/workflows/definitions" replace />}
        />
        <Route
          path="/workflows/definitions"
          element={
            <SuperAdminRoute>
              <Suspense fallback={<Loader message="Loading workflows..." />}>
                <WorkflowsListPage />
              </Suspense>
            </SuperAdminRoute>
          }
        />
        <Route
          path="/workflows/mappings"
          element={<Navigate to="/workflows/definitions#category-mappings" replace />}
        />
        <Route
          path="/workflows/new"
          element={
            <SuperAdminRoute>
              <Suspense fallback={<Loader message="Loading workflow builder..." />}>
                <WorkflowFormPage />
              </Suspense>
            </SuperAdminRoute>
          }
        />
        <Route
          path="/workflows/:id/edit"
          element={
            <SuperAdminRoute>
              <Suspense fallback={<Loader message="Loading workflow builder..." />}>
                <WorkflowFormPage />
              </Suspense>
            </SuperAdminRoute>
          }
        />
        <Route
          path="/workflows/:id"
          element={
            <SuperAdminRoute>
              <Suspense fallback={<Loader message="Loading workflow..." />}>
                <WorkflowViewPage />
              </Suspense>
            </SuperAdminRoute>
          }
        />

        {/* Email notifications — Super Admin */}
        <Route
          path="/email/configuration"
          element={
            <SuperAdminRoute>
              <Suspense fallback={<Loader message="Loading email configuration..." />}>
                <EmailConfigurationPage />
              </Suspense>
            </SuperAdminRoute>
          }
        />
        <Route
          path="/email/notifications"
          element={
            <SuperAdminRoute>
              <Suspense fallback={<Loader message="Loading email notifications..." />}>
                <EmailNotificationsPage />
              </Suspense>
            </SuperAdminRoute>
          }
        />
        <Route
          path="/email/templates"
          element={
            <SuperAdminRoute>
              <Suspense fallback={<Loader message="Loading email templates..." />}>
                <EmailTemplatesPage />
              </Suspense>
            </SuperAdminRoute>
          }
        />
      </Route>

      <Route path="/403" element={<AccessDenied />} />
      <Route path="/500" element={<ServerError />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
