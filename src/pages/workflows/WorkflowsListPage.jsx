import React, { useEffect, useMemo, useState } from "react";

import { useNavigate, useLocation, Navigate } from "react-router-dom";

import { Copy, Eye, GitBranch, Link2, Pencil, Power, PowerOff } from "lucide-react";

import Loader from "../../components/Loader";

import WorkflowMappingsPanel from "../../components/workflows/WorkflowMappingsPanel";

import WorkflowsViewToggle, { WORKFLOW_VIEWS } from "../../components/workflows/WorkflowsViewToggle";

import { WfBrandButton } from "../../components/workflows/WorkflowUI";

import {

  ModernPageShell,

  PageHeader,

  SearchField,

  TableCard,

  ToolbarCard,

  ModernDataTable,

  fixedRdtColumn,

  flexRdtColumn,

  ActionIconButton,

  StatusChip,

} from "../../components/layout/ModernPageUI";

import { displayWorkflowStatus, statusLabel } from "../../constants/workflowConstants";

import { usePermissions } from "../../hooks/usePermissions";

import { useToast } from "../../contexts/ToastContext";

import { useWorkflowMutations, useWorkflows } from "../../hooks/useWorkflows";



function resolveWorkflowView(hash) {

  return hash === "#category-mappings" ? WORKFLOW_VIEWS.MAPPINGS : WORKFLOW_VIEWS.DEFINITIONS;

}



export default function WorkflowsListPage() {

  const navigate = useNavigate();

  const location = useLocation();

  const { showToast } = useToast();

  const { isSuperAdmin, loading: permsLoading } = usePermissions();

  const { data: workflows = [], isLoading, refetch } = useWorkflows();

  const { activate, deactivate, clone } = useWorkflowMutations();

  const [search, setSearch] = useState("");

  const [mappingModalOpen, setMappingModalOpen] = useState(false);

  const [view, setView] = useState(() => resolveWorkflowView(location.hash));



  useEffect(() => {

    setView(resolveWorkflowView(location.hash));

  }, [location.hash]);



  const isDefinitionsView = view === WORKFLOW_VIEWS.DEFINITIONS;



  const filtered = useMemo(() => {

    const q = search.trim().toLowerCase();

    if (!q) return workflows;

    return workflows.filter(

      (w) =>

        (w.workflow_name || "").toLowerCase().includes(q) ||

        (w.mapped_categories || "").toLowerCase().includes(q)

    );

  }, [workflows, search]);



  if (!permsLoading && !isSuperAdmin) {

    return <Navigate to="/403" replace />;

  }



  const handleViewChange = (nextView) => {

    setView(nextView);

    navigate(

      nextView === WORKFLOW_VIEWS.MAPPINGS

        ? "/workflows/definitions#category-mappings"

        : "/workflows/definitions",

      { replace: true }

    );

  };



  const handleToggle = async (row) => {

    const status = displayWorkflowStatus(row);

    try {

      if (status === "ACTIVE") {

        await deactivate.mutateAsync(row.id);

        showToast("Workflow set to inactive", "success");

      } else {

        await activate.mutateAsync(row.id);

        showToast("Workflow activated", "success");

      }

      refetch();

    } catch (err) {

      showToast(err?.message || "Update failed", "error");

    }

  };



  const handleClone = async (row) => {

    try {

      const res = await clone.mutateAsync(row.id);

      showToast("Workflow cloned as draft", "success");

      if (res?.data?.id) navigate(`/workflows/${res.data.id}/edit`);

      else refetch();

    } catch (err) {

      showToast(err?.message || "Clone failed", "error");

    }

  };



  const columns = [

    fixedRdtColumn(168, {

      name: "Workflow Name",

      selector: (r) => r.workflow_name,

      sortable: true,

      cell: (r) => (

        <span className="font-medium flex items-center gap-1.5 min-w-0">

          <GitBranch size={14} className="shrink-0" style={{ color: "var(--kz-accent-vibrant)" }} />

          <span className="truncate" title={r.workflow_name}>{r.workflow_name}</span>

        </span>

      ),

    }),

    flexRdtColumn(180, {

      name: "Mapped Categories",

      selector: (r) => r.mapped_categories,

      grow: 1,

      cell: (r) => (

        <span className="text-sm text-neutral-600 truncate block w-full" title={r.mapped_categories || ""}>

          {r.mapped_categories || "—"}

        </span>

      ),

    }),

    fixedRdtColumn(72, { name: "Steps", selector: (r) => r.total_levels ?? 0, center: true }),

    fixedRdtColumn(96, {

      name: "Status",

      cell: (r) => <StatusChip status={statusLabel(displayWorkflowStatus(r))} />,

    }),

    fixedRdtColumn(120, { name: "Created By", selector: (r) => r.created_by_name || "—" }),

    fixedRdtColumn(100, {

      name: "Created",

      cell: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"),

    }),

    fixedRdtColumn(168, {

      name: "Actions",

      center: true,

      cell: (r) => (

        <div className="flex gap-1 justify-center">

          <ActionIconButton title="View" variant="view" onClick={() => navigate(`/workflows/${r.id}`)}>

            <Eye size={16} />

          </ActionIconButton>

          <ActionIconButton title="Edit" variant="edit" onClick={() => navigate(`/workflows/${r.id}/edit`)}>

            <Pencil size={16} />

          </ActionIconButton>

          <ActionIconButton

            title={displayWorkflowStatus(r) === "ACTIVE" ? "Deactivate" : "Activate"}

            variant="view"

            onClick={() => handleToggle(r)}

          >

            {displayWorkflowStatus(r) === "ACTIVE" ? <PowerOff size={16} /> : <Power size={16} />}

          </ActionIconButton>

          <ActionIconButton title="Clone" variant="view" onClick={() => handleClone(r)}>

            <Copy size={16} />

          </ActionIconButton>

        </div>

      ),

    }),

  ];



  if (permsLoading) return <Loader skeleton="table" message="Loading…" />;



  return (

    <ModernPageShell>

      <div className="wf-page">

        <PageHeader

          title={isDefinitionsView ? "Workflow Definitions" : "Category mappings"}

          subtitle={

            isDefinitionsView

              ? "Design reusable approval paths for ticket routing and approvals"

              : "Assign ticket categories to workflows — applied automatically when tickets are created"

          }

          action={

            isDefinitionsView ? (

              <WfBrandButton icon={GitBranch} onClick={() => navigate("/workflows/new")}>

                Create Workflow

              </WfBrandButton>

            ) : (

              <WfBrandButton icon={Link2} onClick={() => setMappingModalOpen(true)}>

                Add mapping

              </WfBrandButton>

            )

          }

        />



        <WorkflowsViewToggle value={view} onChange={handleViewChange} />



        {isDefinitionsView ? (

          <>

            <ToolbarCard>

              <SearchField

                value={search}

                onChange={(e) => setSearch(e.target.value)}

                placeholder="Search definitions…"

              />

            </ToolbarCard>

            <TableCard>

              <ModernDataTable

                columns={columns}

                data={filtered}

                progressPending={isLoading}

                pagination

                highlightOnHover

              />

            </TableCard>

          </>

        ) : (

          <WorkflowMappingsPanel
            compact
            addModalOpen={mappingModalOpen}
            onAddModalOpenChange={setMappingModalOpen}
          />

        )}

      </div>

    </ModernPageShell>

  );

}


