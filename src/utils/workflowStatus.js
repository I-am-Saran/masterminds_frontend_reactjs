/**
 * Resolve workflow status label + chip variant for ticket list and detail views.
 * @returns {{ variant: string, label: string }}
 */
export function resolveWorkflowStatusDisplay({ task = null, workflowState = null } = {}) {
  const ticketStatus = String(task?.status || workflowState?.ticket_status || "OPEN").toUpperCase();
  const wfStatus = String(
    workflowState?.workflow_status || task?.workflow_instance_status || ""
  ).toUpperCase();

  const hasWorkflow = Boolean(
    workflowState?.instance_id || wfStatus || task?.workflow_instance_status
  );

  if (!hasWorkflow) {
    return { variant: "none", label: "—" };
  }

  if (wfStatus === "REJECTED") {
    return { variant: "rejected", label: "Rejected / Cancelled" };
  }

  if (wfStatus === "COMPLETED") {
    return { variant: "completed", label: "Completed" };
  }

  if (wfStatus === "IN_PROGRESS") {
    if (ticketStatus === "OPEN") {
      return { variant: "not_initiated", label: "Not Initiated" };
    }

    const levelSeq = getPendingLevelSequence(workflowState, task);
    if (levelSeq != null) {
      return { variant: "pending", label: `In Progress - Pending L${levelSeq}` };
    }
    return { variant: "pending", label: "In Progress" };
  }

  return { variant: "none", label: "—" };
}

function getPendingLevelSequence(workflowState, task) {
  if (workflowState?.levels?.length) {
    const current = workflowState.levels.find((level) => level.status === "IN_PROGRESS");
    if (current?.level_sequence != null) {
      return Number(current.level_sequence);
    }
  }

  if (task?.workflow_level_sequence != null && task.workflow_level_sequence !== "") {
    return Number(task.workflow_level_sequence);
  }

  const levelName = workflowState?.current_level_name || "";
  const match = String(levelName).match(/\b(\d+)\b/);
  if (match) {
    return Number(match[1]);
  }

  return null;
}
