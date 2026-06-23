import { lazy } from "react";

/** Lazy-loaded pages for Kaizen ticketing platform. */
export const UsersPage = lazy(() => import("../pages/UsersPage"));
export const RolesList = lazy(() => import("../pages/RolesList"));
export const TeamsPage = lazy(() => import("../pages/TeamsPage"));
export const KaizenTasksPage = lazy(() => import("../pages/kaizen-tasks/KaizenTasksPage"));
export const KaizenMyTasksPage = lazy(() => import("../pages/kaizen-tasks/KaizenMyTasksPage"));
export const KaizenRaisedByMePage = lazy(() => import("../pages/kaizen-tasks/KaizenRaisedByMePage"));
export const KaizenOverduePage = lazy(() => import("../pages/kaizen-tasks/KaizenOverduePage"));
export const KaizenDashboardPage = lazy(() => import("../pages/kaizen-tasks/KaizenDashboardPage"));
export const KaizenTaskDetailPage = lazy(() => import("../pages/kaizen-tasks/KaizenTaskDetailPage"));
export const WorkflowsListPage = lazy(() => import("../pages/workflows/WorkflowsListPage"));
export const WorkflowFormPage = lazy(() => import("../pages/workflows/WorkflowFormPage"));
export const WorkflowViewPage = lazy(() => import("../pages/workflows/WorkflowViewPage"));
export const EmailConfigurationPage = lazy(() => import("../pages/email/EmailConfigurationPage"));
export const EmailNotificationsPage = lazy(() => import("../pages/email/EmailNotificationsPage"));
export const EmailTemplatesPage = lazy(() => import("../pages/email/EmailTemplatesPage"));
