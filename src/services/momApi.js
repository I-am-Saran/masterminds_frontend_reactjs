import { get, post, put, del } from "./api";

const buildQuery = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  const str = qs.toString();
  return str ? `?${str}` : "";
};

// Meetings
export const listMeetings = (params = {}) =>
  get(`/api/mom/meetings${buildQuery(params)}`);

export const getMeeting = (id) => get(`/api/mom/meetings/${id}`);

export const createMeeting = (payload) => post("/api/mom/meetings", payload);

export const updateMeeting = (id, payload) => put(`/api/mom/meetings/${id}`, payload);

export const deleteMeeting = (id) => del(`/api/mom/meetings/${id}`);

// Action items
export const listActionItems = (params = {}) =>
  get(`/api/mom/action-items${buildQuery(params)}`);

export const createActionItem = (payload) => post("/api/mom/action-items", payload);

export const updateActionItem = (id, payload) => put(`/api/mom/action-items/${id}`, payload);

export const deleteActionItem = (id) => del(`/api/mom/action-items/${id}`);

// Comments
export const listComments = (actionId) =>
  get(`/api/mom/action-items/${actionId}/comments`);

export const createComment = (actionId, comment) =>
  post(`/api/mom/action-items/${actionId}/comments`, { comment });

// Dashboard
export const getMomDashboardMetrics = (params = {}) =>
  get(`/api/mom/dashboard-metrics${buildQuery(params)}`);

// Teams (for dashboard filter)
export const listTeams = () => get("/api/teams");
