import { get, post, put, patch, del } from "./api";

const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      q.append(k, String(v));
    }
  });
  const s = q.toString();
  return s ? `?${s}` : "";
};

export const listKaizenTasks = (params = {}) =>
  get(`/api/tasks${buildQuery(params)}`);

export const getKaizenTask = (taskId) => get(`/api/tasks/${taskId}`);

export const createKaizenTask = (body) => post("/api/tasks", body);

export const updateKaizenTask = (taskId, body) => put(`/api/tasks/${taskId}`, body);

export const patchKaizenTaskStatus = (taskId, body) =>
  patch(`/api/tasks/${taskId}/status`, body);

export const startKaizenWork = (taskId) =>
  post(`/api/tasks/${taskId}/start-work`, {});

export const deleteKaizenTask = (taskId) => del(`/api/tasks/${taskId}`);

export const listKaizenTaskComments = (taskId) =>
  get(`/api/tasks/${taskId}/comments`);

export const addKaizenTaskComment = (taskId, body) =>
  post(`/api/tasks/${taskId}/comments`, body);

export const listKaizenTaskHistory = (taskId) =>
  get(`/api/tasks/${taskId}/history`);

export const getKaizenStatusTransitions = (taskId) =>
  get(`/api/tasks/status-transitions/${taskId}`);

export const getKaizenTaskReference = () => get("/api/tasks/reference");

export const getKaizenActiveTicketCategories = () => get("/api/tasks/categories");

export const getKaizenDashboardSummary = () =>
  get("/api/tasks/dashboard/summary");

export const getKaizenDashboardOverdue = (limit = 20) =>
  get(`/api/tasks/dashboard/overdue${buildQuery({ limit })}`);

export const getKaizenDashboardStale = (limit = 20) =>
  get(`/api/tasks/dashboard/stale${buildQuery({ limit })}`);

export const getKaizenDashboardByOwner = () =>
  get("/api/tasks/dashboard/by-owner");

export const getKaizenDashboardByCategory = () =>
  get("/api/tasks/dashboard/by-category");

export const getKaizenDashboardRecentActivity = (limit = 20) =>
  get(`/api/tasks/dashboard/recent-activity${buildQuery({ limit })}`);
