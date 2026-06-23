import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  addKaizenTaskComment,
  createKaizenTask,
  deleteKaizenTask,
  getKaizenDashboardByCategory,
  getKaizenDashboardByOwner,
  getKaizenDashboardOverdue,
  getKaizenDashboardRecentActivity,
  getKaizenDashboardStale,
  getKaizenDashboardSummary,
  getKaizenStatusTransitions,
  getKaizenTask,
  getKaizenTaskReference,
  listKaizenTaskComments,
  listKaizenTaskHistory,
  listKaizenTasks,
  patchKaizenTaskStatus,
  startKaizenWork,
  updateKaizenTask,
} from "../services/kaizenTasksApi";

export const kaizenTasksKeys = {
  all: ["kaizen-tasks"],
  lists: () => [...kaizenTasksKeys.all, "list"],
  list: (filters) => [...kaizenTasksKeys.lists(), filters],
  details: () => [...kaizenTasksKeys.all, "detail"],
  detail: (id) => [...kaizenTasksKeys.details(), id],
  comments: (id) => [...kaizenTasksKeys.detail(id), "comments"],
  history: (id) => [...kaizenTasksKeys.detail(id), "history"],
  transitions: (id) => [...kaizenTasksKeys.detail(id), "transitions"],
  reference: () => [...kaizenTasksKeys.all, "reference"],
  activeCategories: () => [...kaizenTasksKeys.all, "active-categories"],
  dashboard: () => [...kaizenTasksKeys.all, "dashboard"],
  dashboardSummary: () => [...kaizenTasksKeys.dashboard(), "summary"],
  dashboardOverdue: (limit) => [...kaizenTasksKeys.dashboard(), "overdue", limit],
  dashboardStale: (limit) => [...kaizenTasksKeys.dashboard(), "stale", limit],
  dashboardByOwner: () => [...kaizenTasksKeys.dashboard(), "by-owner"],
  dashboardByCategory: () => [...kaizenTasksKeys.dashboard(), "by-category"],
  dashboardRecentActivity: (limit) => [...kaizenTasksKeys.dashboard(), "recent-activity", limit],
};

export function useKaizenTasks(filters = {}, options = {}) {
  return useQuery({
    queryKey: kaizenTasksKeys.list(filters),
    queryFn: () => listKaizenTasks(filters),
    ...options,
  });
}

export function useKaizenTask(taskId, options = {}) {
  return useQuery({
    queryKey: kaizenTasksKeys.detail(taskId),
    queryFn: () => getKaizenTask(taskId),
    enabled: Boolean(taskId),
    ...options,
  });
}

export function useKaizenTaskReference(options = {}) {
  return useQuery({
    queryKey: kaizenTasksKeys.reference(),
    queryFn: getKaizenTaskReference,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useKaizenTaskComments(taskId, options = {}) {
  return useQuery({
    queryKey: kaizenTasksKeys.comments(taskId),
    queryFn: () => listKaizenTaskComments(taskId),
    enabled: Boolean(taskId),
    ...options,
  });
}

export function useKaizenTaskHistory(taskId, options = {}) {
  return useQuery({
    queryKey: kaizenTasksKeys.history(taskId),
    queryFn: () => listKaizenTaskHistory(taskId),
    enabled: Boolean(taskId),
    ...options,
  });
}

export function useKaizenStatusTransitions(taskId, options = {}) {
  return useQuery({
    queryKey: kaizenTasksKeys.transitions(taskId),
    queryFn: () => getKaizenStatusTransitions(taskId),
    enabled: Boolean(taskId),
    ...options,
  });
}

export function useKaizenDashboardSummary(options = {}) {
  return useQuery({
    queryKey: kaizenTasksKeys.dashboardSummary(),
    queryFn: getKaizenDashboardSummary,
    ...options,
  });
}

export function useKaizenDashboardOverdue(limit = 20, options = {}) {
  return useQuery({
    queryKey: kaizenTasksKeys.dashboardOverdue(limit),
    queryFn: () => getKaizenDashboardOverdue(limit),
    ...options,
  });
}

export function useKaizenDashboardStale(limit = 20, options = {}) {
  return useQuery({
    queryKey: kaizenTasksKeys.dashboardStale(limit),
    queryFn: () => getKaizenDashboardStale(limit),
    ...options,
  });
}

export function useKaizenDashboardByOwner(options = {}) {
  return useQuery({
    queryKey: kaizenTasksKeys.dashboardByOwner(),
    queryFn: getKaizenDashboardByOwner,
    ...options,
  });
}

export function useKaizenDashboardByCategory(options = {}) {
  return useQuery({
    queryKey: kaizenTasksKeys.dashboardByCategory(),
    queryFn: getKaizenDashboardByCategory,
    ...options,
  });
}

export function useKaizenDashboardRecentActivity(limit = 12, options = {}) {
  return useQuery({
    queryKey: kaizenTasksKeys.dashboardRecentActivity(limit),
    queryFn: () => getKaizenDashboardRecentActivity(limit),
    ...options,
  });
}

const DASHBOARD_PRIORITY_LABELS = {
  P1: "P1 – Critical",
  P2: "P2 – High",
  P3: "P3 – Medium",
};

export function useKaizenDashboardPriorityChart(options = {}) {
  const priorities = ["P1", "P2", "P3"];
  const results = useQueries({
    queries: priorities.map((priority) => ({
      queryKey: [...kaizenTasksKeys.dashboard(), "priority", priority],
      queryFn: () => listKaizenTasks({ priority, limit: 1, page: 1 }),
      select: (response) => Number(response?.meta?.total ?? 0),
      staleTime: 60_000,
      ...options,
    })),
  });

  const isLoading = results.some((result) => result.isLoading);
  const data = useMemo(
    () =>
      results
        .map((result, index) => ({
          name: DASHBOARD_PRIORITY_LABELS[priorities[index]],
          value: result.data ?? 0,
        }))
        .filter((item) => item.value > 0),
    [results]
  );

  return { data, isLoading };
}

export function useCreateKaizenTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createKaizenTask,
    onSuccess: (res) => {
      const task = res?.data;
      if (task?.id) {
        qc.setQueryData(kaizenTasksKeys.detail(task.id), res);
      }
      qc.invalidateQueries({ queryKey: kaizenTasksKeys.lists() });
      qc.invalidateQueries({ queryKey: kaizenTasksKeys.dashboard() });
    },
  });
}

export function useUpdateKaizenTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, body }) => updateKaizenTask(taskId, body),
    onSuccess: (_, { taskId }) => {
      qc.invalidateQueries({ queryKey: kaizenTasksKeys.lists() });
      qc.invalidateQueries({ queryKey: kaizenTasksKeys.detail(taskId) });
      qc.invalidateQueries({ queryKey: kaizenTasksKeys.dashboard() });
    },
  });
}

export function usePatchKaizenTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, body }) => patchKaizenTaskStatus(taskId, body),
    onSuccess: (_, { taskId }) => {
      qc.invalidateQueries({ queryKey: kaizenTasksKeys.lists() });
      qc.invalidateQueries({ queryKey: kaizenTasksKeys.detail(taskId) });
      qc.invalidateQueries({ queryKey: kaizenTasksKeys.transitions(taskId) });
      qc.invalidateQueries({ queryKey: kaizenTasksKeys.dashboard() });
    },
  });
}

function patchWorkflowAfterStartWork(qc, taskId) {
  qc.setQueryData(["task-workflow", taskId], (old) => {
    if (!old) return old;
    return {
      ...old,
      ticket_status: "IN_PROGRESS",
      requires_start_work: false,
      can_act: Boolean(old.can_act) || Boolean(old.requires_start_work),
    };
  });
}

export function useStartKaizenWork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId) => startKaizenWork(taskId),
    onMutate: async (taskId) => {
      await qc.cancelQueries({ queryKey: kaizenTasksKeys.detail(taskId) });
      await qc.cancelQueries({ queryKey: ["task-workflow", taskId] });
      const previousTask = qc.getQueryData(kaizenTasksKeys.detail(taskId));
      const previousWorkflow = qc.getQueryData(["task-workflow", taskId]);
      const now = new Date().toISOString();

      qc.setQueryData(kaizenTasksKeys.detail(taskId), (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: { ...old.data, status: "IN_PROGRESS", work_started_at: now },
        };
      });
      patchWorkflowAfterStartWork(qc, taskId);

      return { previousTask, previousWorkflow };
    },
    onError: (_err, taskId, context) => {
      if (context?.previousTask) {
        qc.setQueryData(kaizenTasksKeys.detail(taskId), context.previousTask);
      }
      if (context?.previousWorkflow) {
        qc.setQueryData(["task-workflow", taskId], context.previousWorkflow);
      }
    },
    onSuccess: (res, taskId) => {
      if (res?.data) {
        qc.setQueryData(kaizenTasksKeys.detail(taskId), res);
      }
      patchWorkflowAfterStartWork(qc, taskId);
      qc.invalidateQueries({ queryKey: kaizenTasksKeys.history(taskId) });
      qc.invalidateQueries({ queryKey: kaizenTasksKeys.lists() });
      qc.invalidateQueries({ queryKey: kaizenTasksKeys.dashboard() });
      qc.invalidateQueries({ queryKey: ["task-workflow", taskId] });
    },
  });
}

export function useDeleteKaizenTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteKaizenTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: kaizenTasksKeys.lists() });
      qc.invalidateQueries({ queryKey: kaizenTasksKeys.dashboard() });
    },
  });
}

export function useAddKaizenTaskComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, comment }) => addKaizenTaskComment(taskId, { comment }),
    onMutate: async ({ taskId, comment, authorEmail }) => {
      await qc.cancelQueries({ queryKey: kaizenTasksKeys.comments(taskId) });
      const previousComments = qc.getQueryData(kaizenTasksKeys.comments(taskId));
      const optimistic = {
        id: `optimistic-${Date.now()}`,
        comment,
        author_email: authorEmail || "You",
        created_at: new Date().toISOString(),
        _optimistic: true,
      };
      qc.setQueryData(kaizenTasksKeys.comments(taskId), (old) => ({
        ...(old || { success: true }),
        data: [...(old?.data || []), optimistic],
      }));
      return { previousComments };
    },
    onError: (_err, { taskId }, context) => {
      if (context?.previousComments) {
        qc.setQueryData(kaizenTasksKeys.comments(taskId), context.previousComments);
      }
    },
    onSuccess: (res, { taskId }) => {
      const saved = res?.data;
      if (saved) {
        qc.setQueryData(kaizenTasksKeys.comments(taskId), (old) => {
          const withoutOptimistic = (old?.data || []).filter((c) => !c._optimistic);
          return { success: true, data: [...withoutOptimistic, saved] };
        });
      }
      qc.invalidateQueries({ queryKey: kaizenTasksKeys.comments(taskId) });
      qc.invalidateQueries({ queryKey: kaizenTasksKeys.detail(taskId) });
      qc.invalidateQueries({ queryKey: kaizenTasksKeys.lists() });
    },
  });
}
