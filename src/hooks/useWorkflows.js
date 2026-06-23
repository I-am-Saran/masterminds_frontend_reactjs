import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { kaizenTasksKeys } from "./useKaizenTasks";
import {
  activateWorkflow,
  advanceTaskWorkflow,
  cloneWorkflow,
  createWorkflow,
  deactivateWorkflow,
  deleteWorkflow,
  getTaskWorkflow,
  getWorkflow,
  listWorkflows,
  updateWorkflow,
  listWorkflowMappings,
  saveWorkflowMapping,
  deleteWorkflowMapping,
} from "../services/workflowsApi";

export function useWorkflows() {
  return useQuery({
    queryKey: ["workflows"],
    queryFn: async () => {
      const res = await listWorkflows();
      return res?.data || [];
    },
  });
}

export function useWorkflow(id) {
  return useQuery({
    queryKey: ["workflows", id],
    queryFn: async () => {
      const res = await getWorkflow(id);
      return res?.data;
    },
    enabled: Boolean(id),
  });
}

export function useTaskWorkflow(taskId) {
  return useQuery({
    queryKey: ["task-workflow", taskId],
    queryFn: async () => {
      const res = await getTaskWorkflow(taskId);
      return res?.data;
    },
    enabled: Boolean(taskId),
  });
}

export function useWorkflowMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["workflows"] });
    qc.invalidateQueries({ queryKey: kaizenTasksKeys.activeCategories() });
  };

  return {
    create: useMutation({
      mutationFn: createWorkflow,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }) => updateWorkflow(id, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: deleteWorkflow,
      onSuccess: invalidate,
    }),
    activate: useMutation({
      mutationFn: activateWorkflow,
      onSuccess: invalidate,
    }),
    deactivate: useMutation({
      mutationFn: deactivateWorkflow,
      onSuccess: invalidate,
    }),
    clone: useMutation({
      mutationFn: cloneWorkflow,
      onSuccess: invalidate,
    }),
    advance: useMutation({
      mutationFn: ({ taskId, body }) => advanceTaskWorkflow(taskId, body),
      onSuccess: (res, vars) => {
        if (res?.data) {
          qc.setQueryData(["task-workflow", vars.taskId], res.data);
        }
        qc.invalidateQueries({ queryKey: kaizenTasksKeys.detail(vars.taskId) });
        qc.invalidateQueries({ queryKey: kaizenTasksKeys.history(vars.taskId) });
        qc.invalidateQueries({ queryKey: kaizenTasksKeys.lists() });
        qc.invalidateQueries({ queryKey: ["task-workflow", vars.taskId] });
      },
    }),
  };
}

export function useWorkflowMappings() {
  return useQuery({
    queryKey: ["workflow-mappings"],
    queryFn: async () => {
      const res = await listWorkflowMappings();
      return res?.data || [];
    },
  });
}

export function useWorkflowMappingMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["workflow-mappings"] });
    qc.invalidateQueries({ queryKey: ["workflows"] });
    qc.invalidateQueries({ queryKey: kaizenTasksKeys.activeCategories() });
  };
  return {
    save: useMutation({
      mutationFn: saveWorkflowMapping,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: deleteWorkflowMapping,
      onSuccess: invalidate,
    }),
  };
}
