import { del, get, post, put } from "./api";

export const listWorkflows = () => get("/workflows");

export const getWorkflow = (id) => get(`/workflows/${id}`);

export const createWorkflow = (body) => post("/workflows", body);

export const updateWorkflow = (id, body) => put(`/workflows/${id}`, body);

export const deleteWorkflow = (id) => del(`/workflows/${id}`);

export const activateWorkflow = (id) => post(`/workflows/${id}/activate`, {});

export const deactivateWorkflow = (id) => post(`/workflows/${id}/deactivate`, {});

export const cloneWorkflow = (id) => post(`/workflows/${id}/clone`, {});

export const listWorkflowMappings = () => get("/workflows/mappings");

export const saveWorkflowMapping = (body) => post("/workflows/mappings", body);

export const deleteWorkflowMapping = (id) => del(`/workflows/mappings/${id}`);

export const getTaskWorkflow = (taskId) => get(`/api/tasks/${taskId}/workflow`);

export const advanceTaskWorkflow = (taskId, body) =>
  post(`/api/tasks/${taskId}/workflow/advance`, body);

export const listTeamsOptions = () => get("/teams");

export const listRolesOptions = (tenantId) =>
  get(`/roles?tenant_id=${tenantId || "00000000-0000-0000-0000-000000000001"}`);

export const listUsersOptions = () => get("/users");
