import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Loader from "../../components/Loader";
import WorkflowBuilder from "../../components/workflows/WorkflowBuilder";
import {
  WfBrandButton,
  WfFieldLabel,
  WfGhostButton,
  WfInput,
  WfSection,
  WfSelect,
  WfTextarea,
} from "../../components/workflows/WorkflowUI";
import {
  emptyLevel,
  levelsFromApi,
  normalizeLevelsForApi,
  WORKFLOW_STATUSES,
  displayWorkflowStatus,
} from "../../constants/workflowConstants";
import { useToast } from "../../contexts/ToastContext";
import { usePermissions } from "../../hooks/usePermissions";
import { useWorkflow, useWorkflowMutations } from "../../hooks/useWorkflows";
import { ModernPageShell, PageHeader } from "../../components/layout/ModernPageUI";
import { extractApiErrorMessage } from "../../utils/apiErrors";

export default function WorkflowFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isSuperAdmin, loading: permsLoading } = usePermissions();
  const { data: existing, isLoading } = useWorkflow(isEdit ? id : null);
  const { create, update } = useWorkflowMutations();

  const [form, setForm] = useState({
    workflow_name: "",
    description: "",
    workflow_status: "DRAFT",
  });
  const [levels, setLevels] = useState([emptyLevel(1)]);
  const [saving, setSaving] = useState(false);
  const [formHydrated, setFormHydrated] = useState(!isEdit);

  useEffect(() => {
    if (isEdit) setFormHydrated(false);
  }, [id, isEdit]);

  useEffect(() => {
    if (!isEdit || !existing) return;
    setForm({
      workflow_name: existing.workflow_name || "",
      description: existing.description || "",
      workflow_status: displayWorkflowStatus(existing),
    });
    setLevels(existing.levels?.length ? levelsFromApi(existing.levels) : [emptyLevel(1)]);
    setFormHydrated(true);
  }, [isEdit, existing]);

  if (!permsLoading && !isSuperAdmin) {
    return <Navigate to="/403" replace />;
  }

  if (isEdit && (isLoading || !existing || !formHydrated)) {
    return <Loader skeleton="default" message="Loading workflow…" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.workflow_name.trim()) {
      showToast("Workflow name is required", "error");
      return;
    }
    if (!levels.length) {
      showToast("Add at least one step", "error");
      return;
    }

    const body = {
      workflow_name: form.workflow_name.trim(),
      description: form.description,
      workflow_status: form.workflow_status,
      levels: normalizeLevelsForApi(levels),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await update.mutateAsync({ id, body });
        showToast("Workflow updated", "success");
        navigate(`/workflows/${id}`);
      } else {
        const res = await create.mutateAsync(body);
        showToast("Workflow created", "success");
        navigate(`/workflows/${res?.data?.id || ""}`);
      }
    } catch (err) {
      showToast(extractApiErrorMessage(err, "Save failed"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModernPageShell>
      <div className="wf-page">
        <button
          type="button"
          onClick={() => navigate(isEdit ? `/workflows/${id}` : "/workflows/definitions")}
          className="wf-back-link"
        >
          <ArrowLeft size={16} />
          Back to definitions
        </button>

        <PageHeader
          title={isEdit ? "Edit workflow" : "Create workflow"}
          subtitle="Design approval paths and assign workflow steps"
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <WfSection title="Workflow information" subtitle="Name, description, and lifecycle status">
            <div className="wf-info-grid">
              <div className="wf-span-2">
                <WfFieldLabel required>Workflow name</WfFieldLabel>
                <WfInput
                  value={form.workflow_name}
                  onChange={(e) => setForm({ ...form, workflow_name: e.target.value })}
                  placeholder="e.g. Standard incident approval"
                  required
                />
              </div>
              <div>
                <WfFieldLabel>Status</WfFieldLabel>
                <WfSelect
                  key={`workflow-status-${id || "new"}-${form.workflow_status}`}
                  value={form.workflow_status}
                  onChange={(e) => setForm({ ...form, workflow_status: e.target.value })}
                  placeholder=""
                >
                  {WORKFLOW_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </WfSelect>
              </div>
              <div>
                <WfFieldLabel>Version</WfFieldLabel>
                <WfInput
                  value={isEdit && existing?.version != null ? existing.version : "1"}
                  readOnly
                  disabled
                />
              </div>
              <div className="wf-span-2">
                <WfFieldLabel>Description</WfFieldLabel>
                <WfTextarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Purpose and scope of this workflow"
                />
              </div>
            </div>
          </WfSection>

          <WorkflowBuilder levels={levels} onChange={setLevels} />

          <div className="wf-form-actions">
            <WfGhostButton type="button" onClick={() => navigate("/workflows/definitions")}>
              Cancel
            </WfGhostButton>
            <WfBrandButton type="submit" disabled={saving} size="lg">
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create workflow"}
            </WfBrandButton>
          </div>
        </form>
      </div>
    </ModernPageShell>
  );
}
