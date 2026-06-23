import React, { useState } from "react";
import { Eye, UserRound } from "lucide-react";
import { KZ } from "../../constants/designTokens";
import { useTaskWorkflow, useWorkflowMutations } from "../../hooks/useWorkflows";
import { useToast } from "../../contexts/ToastContext";
import WorkflowVisualization from "./WorkflowVisualization";
import { SkeletonWidget } from "../ui/Skeleton";

export default function TicketWorkflowPanel({ taskId }) {
  const { showToast } = useToast();
  const { data, isLoading } = useTaskWorkflow(taskId);
  const { advance } = useWorkflowMutations();
  const [comments, setComments] = useState("");

  if (isLoading) {
    return (
      <section className="kz-card">
        <div className="kz-card-body">
          <SkeletonWidget lines={3} />
        </div>
      </section>
    );
  }
  if (!data?.instance_id) {
    return (
      <section className="kz-card">
        <div className="kz-card-header">Workflow Progress</div>
        <div className="kz-card-body">
          <p className="text-sm" style={{ color: KZ.textMuted }}>
            No workflow attached. Map this ticket&apos;s category to a workflow to enable automatic routing.
          </p>
        </div>
      </section>
    );
  }

  const inProgress = data.workflow_status === "IN_PROGRESS";
  const completed = data.workflow_status === "COMPLETED";
  const rejected = data.workflow_status === "REJECTED";
  const currentLevel = (data.levels || []).find((l) => l.status === "IN_PROGRESS");
  const requiresStartWork = Boolean(data.requires_start_work);
  const canAct = Boolean(data.can_act) && inProgress && !requiresStartWork;
  const canReject = Boolean(data.can_reject ?? currentLevel?.can_reject);
  const canSkip = Boolean(data.allow_skip ?? currentLevel?.allow_skip);

  const handleAdvance = async (action) => {
    try {
      await advance.mutateAsync({ taskId, body: { action, comments: comments.trim() || undefined } });
      setComments("");
      showToast(action === "COMPLETE" ? "Level completed" : `Workflow ${action.toLowerCase()}`, "success");
    } catch (err) {
      showToast(err?.message || "Workflow action failed", "error");
    }
  };

  return (
    <section className="kz-card">
      <div className="kz-card-header flex flex-wrap items-center justify-between gap-2">
        <span>Workflow Progress</span>
        <span className="text-xs font-normal normal-case" style={{ color: KZ.textMuted }}>
          {data.workflow_name} · {(data.workflow_status || "").replace(/_/g, " ")}
        </span>
      </div>
      <div className="kz-card-body space-y-4">
        {(data.current_owner_label || data.current_owner_email) && inProgress && (
          <div
            className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm"
            style={{ background: KZ.activeBg, border: `1px solid ${KZ.border}` }}
          >
            <UserRound size={16} className="shrink-0 mt-0.5" style={{ color: KZ.textMuted }} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: KZ.textMuted }}>
                Current Workflow Owner
              </p>
              <p className="font-semibold" style={{ color: KZ.text }}>
                {data.current_owner_label || data.current_owner_email}
              </p>
              {data.current_owner_email && data.current_owner_label && (
                <p className="text-xs mt-0.5" style={{ color: KZ.textMuted }}>{data.current_owner_email}</p>
              )}
            </div>
          </div>
        )}

        <WorkflowVisualization levels={data.levels || []} mode="progress" />

        {currentLevel?.sla_hours != null && inProgress && (
          <p className="text-xs" style={{ color: KZ.textMuted }}>
            Current level SLA: {currentLevel.sla_hours} hours
          </p>
        )}

        {inProgress && requiresStartWork && (
          <div
            className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
            style={{ background: "rgba(249, 115, 22, 0.12)", color: "#c2410c" }}
          >
            <Eye size={14} />
            Click <strong>Start Work</strong> on this ticket before completing workflow levels.
          </div>
        )}

        {inProgress && !canAct && !requiresStartWork && (
          <div
            className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
            style={{ background: "rgba(200,209,193,0.25)", color: KZ.textMuted }}
          >
            <Eye size={14} />
            Read-only view — only the current workflow owner can act on this step.
          </div>
        )}

        {canAct && (
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: KZ.border }}>
            <p className="text-xs font-semibold" style={{ color: KZ.text }}>
              Your actions on &ldquo;{data.current_level_name}&rdquo;
            </p>
            <textarea
              className="kz-input w-full min-h-[72px]"
              placeholder="Comments (required if configured for this level)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="kz-btn-primary text-sm"
                disabled={advance.isPending}
                onClick={() => handleAdvance("COMPLETE")}
              >
                Complete Level
              </button>
              {canSkip && (
                <button
                  type="button"
                  className="kz-btn-secondary text-sm"
                  disabled={advance.isPending}
                  onClick={() => handleAdvance("SKIP")}
                >
                  Skip
                </button>
              )}
              {canReject && (
                <button
                  type="button"
                  className="kz-btn-secondary text-sm"
                  disabled={advance.isPending}
                  onClick={() => handleAdvance("REJECT")}
                >
                  Reject
                </button>
              )}
            </div>
          </div>
        )}

        {(completed || rejected) && (
          <p className="text-xs" style={{ color: KZ.textMuted }}>
            {completed
              ? "Workflow completed — ticket status was updated automatically."
              : "Workflow was rejected — ticket was cancelled."}
          </p>
        )}
      </div>
    </section>
  );
}
