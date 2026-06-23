import React, { useMemo, useState } from "react";
import { Link2, Trash2 } from "lucide-react";
import { WfBrandButton, WfFieldLabel, WfGhostButton, WfSelect } from "./WorkflowUI";
import {
  TableCard,
  ModernDataTable,
  fixedRdtColumn,
  flexRdtColumn,
  ActionIconButton,
  StatusChip,
} from "../layout/ModernPageUI";
import ModernModal from "../ModernModal";
import { TICKET_CATEGORIES, displayWorkflowStatus, statusLabel } from "../../constants/workflowConstants";
import { useToast } from "../../contexts/ToastContext";
import { useConfirm } from "../../contexts/ConfirmContext";
import { useWorkflowMappingMutations, useWorkflowMappings, useWorkflows } from "../../hooks/useWorkflows";

export default function WorkflowMappingsPanel({
  compact = false,
  addModalOpen,
  onAddModalOpenChange,
}) {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const { data: mappings = [], isLoading, refetch } = useWorkflowMappings();
  const { data: workflows = [] } = useWorkflows();
  const { save, remove } = useWorkflowMappingMutations();
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const modalOpen = addModalOpen ?? internalModalOpen;
  const setModalOpen = onAddModalOpenChange ?? setInternalModalOpen;
  const [category, setCategory] = useState("");
  const [workflowId, setWorkflowId] = useState("");
  const [saving, setSaving] = useState(false);

  const mappedCategories = useMemo(
    () => new Set(mappings.map((m) => m.ticket_category)),
    [mappings]
  );

  const availableCategories = TICKET_CATEGORIES.filter((c) => !mappedCategories.has(c));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!category || !workflowId) {
      showToast("Select category and workflow", "error");
      return;
    }
    setSaving(true);
    try {
      await save.mutateAsync({ ticket_category: category, workflow_id: workflowId });
      showToast("Mapping saved", "success");
      setModalOpen(false);
      setCategory("");
      setWorkflowId("");
      refetch();
    } catch (err) {
      showToast(err?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    const ok = await confirm({
      title: "Remove mapping",
      message: `Are you sure you want to remove the mapping for "${row.ticket_category}"?`,
    });
    if (!ok) return;
    try {
      await remove.mutateAsync(row.id);
      showToast("Mapping removed", "success");
      refetch();
    } catch (err) {
      showToast(err?.message || "Delete failed", "error");
    }
  };

  const columns = [
    flexRdtColumn(220, {
      name: "Ticket Category",
      selector: (r) => r.ticket_category,
      sortable: true,
      grow: 1,
      cell: (r) => (
        <span className="truncate block w-full" title={r.ticket_category}>
          {r.ticket_category}
        </span>
      ),
    }),
    fixedRdtColumn(148, {
      name: "Workflow",
      selector: (r) => r.workflow_name,
      sortable: true,
      cell: (r) => (
        <span className="truncate block w-full" title={r.workflow_name}>
          {r.workflow_name}
        </span>
      ),
    }),
    fixedRdtColumn(100, {
      name: "Status",
      cell: (r) => <StatusChip status={statusLabel(r.workflow_status || displayWorkflowStatus(r))} />,
    }),
    fixedRdtColumn(76, {
      name: "Actions",
      center: true,
      cell: (r) => (
        <ActionIconButton title="Remove mapping" variant="delete" onClick={() => handleDelete(r)}>
          <Trash2 size={16} />
        </ActionIconButton>
      ),
    }),
  ];

  return (
    <section id="category-mappings" className="flex flex-col gap-3 scroll-mt-6">
      {!compact ? (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="kz-section-title">Category mappings</h2>
            <p className="text-sm text-[color:var(--kz-text-secondary)] mt-1">
              Assign ticket categories to workflows — applied automatically when tickets are created.
            </p>
          </div>
          <WfBrandButton
            icon={Link2}
            onClick={() => setModalOpen(true)}
            disabled={availableCategories.length === 0}
          >
            Add mapping
          </WfBrandButton>
        </div>
      ) : null}

      <TableCard>
        <ModernDataTable
          columns={columns}
          data={mappings}
          progressPending={isLoading}
          pagination
          highlightOnHover
          noDataComponent={
            <p className="py-8 text-sm text-neutral-500 text-center">No category mappings yet.</p>
          }
        />
      </TableCard>

      <ModernModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Map category to workflow"
        size="sm"
      >
        <form onSubmit={handleSave} className="space-y-4 wf-modal-form">
          <div>
            <WfFieldLabel required>Ticket category</WfFieldLabel>
            <WfSelect value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="">Select category</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </WfSelect>
          </div>
          <div>
            <WfFieldLabel required>Workflow</WfFieldLabel>
            <WfSelect value={workflowId} onChange={(e) => setWorkflowId(e.target.value)} required>
              <option value="">Select workflow</option>
              {workflows.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.workflow_name} ({statusLabel(displayWorkflowStatus(w))})
                </option>
              ))}
            </WfSelect>
          </div>
          <div className="wf-form-actions pt-2">
            <WfGhostButton type="button" onClick={() => setModalOpen(false)}>Cancel</WfGhostButton>
            <WfBrandButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save mapping"}</WfBrandButton>
          </div>
        </form>
      </ModernModal>
    </section>
  );
}
