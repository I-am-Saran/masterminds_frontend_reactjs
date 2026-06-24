import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Play } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import { useSession } from "../../contexts/SessionContext";
import Loader from "../../components/Loader";
import PermissionGuard from "../../components/PermissionGuard";
import EmptyState from "../../components/ui/EmptyState";
import KaizenTaskForm from "../../components/kaizen-tasks/KaizenTaskForm";
import { KaizenPriorityChip, KaizenStatusChip, KaizenWorkflowStatusChip } from "../../components/kaizen-tasks/KaizenChips";
import { KZ } from "../../constants/designTokens";
import {
  useAddKaizenTaskComment,
  useKaizenTask,
  useKaizenTaskComments,
  useKaizenTaskHistory,
  useStartKaizenWork,
  useUpdateKaizenTask,
} from "../../hooks/useKaizenTasks";
import { useTaskWorkflow } from "../../hooks/useWorkflows";
import { formatKaizenTicketId } from "../../utils/kaizenTicketId";
import {
  formatDateLabel,
  getOriginalDueDate,
  getRevisedDueDate,
} from "../../utils/taskDueDates";
import TicketWorkflowPanel from "../../components/workflows/TicketWorkflowPanel";
import TicketActivityTimeline from "../../components/kaizen-tasks/TicketActivityTimeline";
import { getTicketListReturn } from "../../utils/ticketListNav";

function MetaRow({ label, children }) {
  return (
    <div className="kz-meta-row">
      <span className="kz-meta-label">{label}</span>
      <span className="kz-meta-value">{children}</span>
    </div>
  );
}

export default function KaizenTaskDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { session } = useSession();

  const [editOpen, setEditOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const { data: taskRes, isLoading } = useKaizenTask(taskId);
  const { data: workflowState } = useTaskWorkflow(taskId);
  const { data: commentsRes } = useKaizenTaskComments(taskId);
  const { data: historyRes } = useKaizenTaskHistory(taskId);

  const updateMutation = useUpdateKaizenTask();
  const startWorkMutation = useStartKaizenWork();
  const commentMutation = useAddKaizenTaskComment();

  const task = taskRes?.data;
  const comments = useMemo(() => commentsRes?.data || [], [commentsRes?.data]);
  const history = useMemo(() => historyRes?.data || [], [historyRes?.data]);

  const workflowOwner =
    workflowState?.current_owner_label ||
    workflowState?.current_owner_email ||
    task?.owner_email ||
    "Unassigned";
  const reporterEmail = task?.created_by_email || "—";
  const originalDueDate = useMemo(() => getOriginalDueDate(task, history), [task, history]);
  const revisedDueDate = useMemo(() => getRevisedDueDate(task, history), [task, history]);

  const currentUserEmail = (session?.user?.email || "").trim().toLowerCase();
  const assigneeEmail = (task?.owner_email || "").trim().toLowerCase();
  const canStartWork =
    (task?.status || "").toUpperCase() === "OPEN" &&
    assigneeEmail &&
    currentUserEmail === assigneeEmail;

  if (isLoading && !taskRes?.data) return <Loader skeleton="detail" message="Loading ticket…" />;

  if (!task) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <EmptyState
          icon={ArrowLeft}
          title="Ticket not found"
          description="This ticket may have been removed or you do not have access."
          actionLabel="Back to Tickets"
          onAction={() => navigate(getTicketListReturn())}
        />
      </div>
    );
  }

  const handleUpdate = async (payload) => {
    try {
      await updateMutation.mutateAsync({ taskId, body: payload });
      showToast("Ticket updated", "success");
      setEditOpen(false);
    } catch (err) {
      showToast(err?.message || "Update failed", "error");
    }
  };

  if (editOpen) {
    return (
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
        <button
          type="button"
          onClick={() => setEditOpen(false)}
          className="inline-flex items-center gap-1 text-sm mb-4 hover:opacity-80"
          style={{ color: KZ.textMuted }}
        >
          <ArrowLeft size={16} />
          Back to Ticket
        </button>

        <div className="kz-ticket-editor-page">
          <div className="kz-ticket-editor-page__header">
            <p className="kz-ticket-editor-page__eyebrow">Edit Ticket</p>
            <h1 className="kz-ticket-editor-page__title">{task.title}</h1>
            <p className="kz-ticket-editor-page__subtitle">
              Update core ticket details in a single page layout. Workflow progress remains on the detail view after you save.
            </p>
          </div>

          <KaizenTaskForm
            mode="edit"
            variant="page"
            initial={task}
            history={history}
            saving={updateMutation.isPending}
            onSubmit={handleUpdate}
            onCancel={() => setEditOpen(false)}
          />
        </div>
      </div>
    );
  }

  const handleStartWork = async () => {
    try {
      await startWorkMutation.mutateAsync(taskId);
      showToast("Work started", "success");
    } catch (err) {
      showToast(err?.message || "Failed to start work", "error");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await commentMutation.mutateAsync({
        taskId,
        comment: commentText.trim(),
        authorEmail: session?.user?.email,
      });
      setCommentText("");
      showToast("Comment added", "success");
    } catch (err) {
      showToast(err?.message || "Failed to add comment", "error");
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <button
        type="button"
        onClick={() => navigate(getTicketListReturn())}
        className="inline-flex items-center gap-1 text-sm mb-4 hover:opacity-80"
        style={{ color: KZ.textMuted }}
      >
        <ArrowLeft size={16} />
        Back to Tickets
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: KZ.brandHover }}>
            {formatKaizenTicketId(task.id)}
          </p>
          <h1 className="text-2xl font-bold" style={{ color: KZ.text }}>
            {task.title}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <KaizenStatusChip status={task.status} />
            <KaizenPriorityChip priority={task.priority} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canStartWork && (
            <button
              type="button"
              className="kz-btn-primary inline-flex items-center gap-2"
              onClick={handleStartWork}
              disabled={startWorkMutation.isPending}
            >
              <Play size={16} />
              {startWorkMutation.isPending ? "Starting…" : "Start Work"}
            </button>
          )}
          <PermissionGuard module="kaizen_tasks" action="update">
            <button type="button" className="kz-btn-secondary" onClick={() => setEditOpen(true)}>
              Edit Ticket
            </button>
          </PermissionGuard>
        </div>
      </div>

      <div className="kz-detail-grid">
        <div className="space-y-4">
          <section className="kz-card">
            <div className="kz-card-header">Ticket Details</div>
            <div className="kz-card-body space-y-2 text-sm">
              <MetaRow label="Ticket ID">{formatKaizenTicketId(task.id)}</MetaRow>
              <MetaRow label="Category">{task.category || "—"}</MetaRow>
              <MetaRow label="Priority"><KaizenPriorityChip priority={task.priority} /></MetaRow>
              <MetaRow label="Status"><KaizenStatusChip status={task.status} /></MetaRow>
              <MetaRow label="Reporter">{reporterEmail}</MetaRow>
              <MetaRow label="Current Workflow Owner">{workflowOwner}</MetaRow>
              {task.work_started_at && (
                <MetaRow label="Work Started">
                  {new Date(task.work_started_at).toLocaleString()}
                </MetaRow>
              )}
              <MetaRow label="Due Date">{formatDateLabel(originalDueDate)}</MetaRow>
              <MetaRow label="Revised Due Date">{formatDateLabel(revisedDueDate)}</MetaRow>
              <MetaRow label="Workflow Status">
                <KaizenWorkflowStatusChip task={task} workflowState={workflowState} />
              </MetaRow>
              <MetaRow label="Created Date">
                {task.created_at ? new Date(task.created_at).toLocaleString() : "—"}
              </MetaRow>
              <MetaRow label="Last Updated">
                {task.updated_at ? new Date(task.updated_at).toLocaleString() : "—"}
              </MetaRow>
            </div>
          </section>

          <section className="kz-card">
            <div className="kz-card-header">Description</div>
            <div className="kz-card-body">
              <p className="text-sm whitespace-pre-wrap" style={{ color: KZ.text }}>
                {task.description || "—"}
              </p>
            </div>
          </section>

          {/* TODO: Attachments will be enabled in future release.
          <section className="kz-card">Attachments</section>
          */}

          <section className="kz-card">
            <div className="kz-card-header">Comments</div>
            <div className="kz-card-body">
              <PermissionGuard module="kaizen_tasks" action="comment">
                <form onSubmit={handleAddComment} className="mb-4 flex gap-2">
                  <input
                    className="kz-input flex-1"
                    placeholder="Add a comment…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button type="submit" disabled={commentMutation.isPending} className="kz-btn-primary">
                    {commentMutation.isPending ? "Posting…" : "Post"}
                  </button>
                </form>
              </PermissionGuard>
              {comments.length === 0 ? (
                <p className="text-sm" style={{ color: KZ.textMuted }}>No comments yet.</p>
              ) : (
                <ul className="space-y-3 max-h-72 overflow-y-auto">
                  {comments.map((c) => (
                    <li key={c.id} className="text-sm pb-2 border-b" style={{ borderColor: KZ.border }}>
                      <p style={{ color: KZ.text }}>{c.comment}</p>
                      <p className="text-xs mt-1" style={{ color: KZ.textMuted }}>
                        {c.author_email || "Unknown"} · {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          {(task?.status || "").toUpperCase() === "OPEN" && !canStartWork && assigneeEmail && (
            <section className="kz-card">
              <div className="kz-card-body">
                <div
                  className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
                  style={{ background: "rgba(200,209,193,0.25)", color: KZ.textMuted }}
                >
                  <Eye size={14} />
                  Read-only — only the assigned owner can start work on this ticket.
                </div>
              </div>
            </section>
          )}

          <TicketWorkflowPanel taskId={taskId} />

          <section className="kz-card">
            <div className="kz-card-header">Activity Timeline</div>
            <div className="kz-card-body kz-card-body--flush">
              <TicketActivityTimeline
                history={history}
                comments={comments}
                workflowHistory={workflowState?.history || []}
                task={task}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
