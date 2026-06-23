import React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import Loader from "../../components/Loader";
import WorkflowFlowDiagram from "../../components/workflows/WorkflowFlowDiagram";
import WorkflowMappingSection from "../../components/workflows/WorkflowMappingSection";
import { WfBrandButton, WfMetaItem, WfOptionChip, WfSection } from "../../components/workflows/WorkflowUI";
import { displayWorkflowStatus, statusLabel } from "../../constants/workflowConstants";
import { usePermissions } from "../../hooks/usePermissions";
import { useWorkflow } from "../../hooks/useWorkflows";
import { ModernPageShell, PageHeader, StatusChip } from "../../components/layout/ModernPageUI";

export default function WorkflowViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin, loading: permsLoading } = usePermissions();
  const { data: workflow, isLoading } = useWorkflow(id);

  if (!permsLoading && !isSuperAdmin) {
    return <Navigate to="/403" replace />;
  }

  if (isLoading) return <Loader skeleton="detail" message="Loading workflow…" />;

  if (!workflow) {
    return (
      <ModernPageShell>
        <p className="text-sm text-[color:var(--kz-text-secondary)]">Workflow not found.</p>
      </ModernPageShell>
    );
  }

  const levels = workflow.levels || [];
  const wfStatus = displayWorkflowStatus(workflow);

  return (
    <ModernPageShell>
      <div className="wf-page">
        <button type="button" onClick={() => navigate("/workflows/definitions")} className="wf-back-link">
          <ArrowLeft size={16} />
          Back to definitions
        </button>

        <PageHeader
          title={workflow.workflow_name}
          subtitle={workflow.description || "Workflow configuration"}
          action={
            <WfBrandButton icon={Pencil} onClick={() => navigate(`/workflows/${id}/edit`)}>
              Edit Workflow
            </WfBrandButton>
          }
        />

        <div className="wf-view-layout">
          <aside className="wf-view-sidebar">
            <WfSection title="Details">
              <div className="flex flex-col gap-3">
                <WfMetaItem label="Status">
                  <StatusChip status={statusLabel(wfStatus)} />
                </WfMetaItem>
                <WfMetaItem label="Version" value={workflow.version ?? 1} />
                <WfMetaItem label="Steps" value={levels.length} />
                <WfMetaItem label="Created by" value={workflow.created_by_name || "—"} />
                <WfMetaItem
                  label="Created"
                  value={workflow.created_at ? new Date(workflow.created_at).toLocaleString() : "—"}
                />
              </div>
            </WfSection>
          </aside>

          <div className="flex flex-col gap-3 min-w-0">
            <WfSection title="Workflow designer" subtitle="Approval path from Open to Closed">
              <WorkflowFlowDiagram levels={levels} />
            </WfSection>

            <WfSection title="Workflow steps">
              <div className="wf-steps-list">
                {levels.map((lvl) => {
                  const opts = [
                    lvl.mandatory_comments && "Comments Required",
                    lvl.mandatory_attachments && "Attachments Required",
                    lvl.can_reject && "Reject Allowed",
                    lvl.can_reassign && "Reassign Allowed",
                    lvl.allow_skip && "Skip Allowed",
                  ].filter(Boolean);

                  return (
                    <div key={lvl.id} className="wf-level-readonly">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="wf-step-badge">Step {lvl.level_sequence}</span>
                        <p className="font-semibold text-sm text-[color:var(--kz-text-primary)]">{lvl.level_name}</p>
                      </div>
                      <div className="wf-step-summary" style={{ borderBottom: "none", padding: 0, background: "transparent" }}>
                        <WfMetaItem
                          label="Assigned to"
                          value={`${lvl.assignment_type} → ${lvl.assignment_label || lvl.assignment_value || "—"}`}
                        />
                        <WfMetaItem label="SLA" value={lvl.sla_hours != null ? `${lvl.sla_hours} Hours` : "No SLA"} />
                        <WfMetaItem
                          label="Escalation"
                          value={
                            lvl.escalation_enabled
                              ? `${lvl.escalation_type} → ${lvl.escalation_label || lvl.escalation_value || "—"}`
                              : "Disabled"
                          }
                        />
                        <WfMetaItem label="Permissions" value={opts.length ? `${opts.length} enabled` : "Default"} />
                      </div>
                      {opts.length > 0 && (
                        <div className="wf-step-options" style={{ borderBottom: "none", paddingLeft: 0, paddingRight: 0 }}>
                          {opts.map((o) => (
                            <WfOptionChip key={o} active>{o}</WfOptionChip>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </WfSection>

            <WorkflowMappingSection workflowId={id} mappedCategoriesText={workflow.mapped_categories} />
          </div>
        </div>
      </div>
    </ModernPageShell>
  );
}
