import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { keepPreviousData } from "@tanstack/react-query";
import { Download, Plus, Search } from "lucide-react";
import { KZ } from "../../constants/designTokens";
import { useToast } from "../../contexts/ToastContext";
import Loader from "../../components/Loader";
import PermissionGuard from "../../components/PermissionGuard";
import KaizenTasksTable from "../../components/kaizen-tasks/KaizenTasksTable";
import KaizenTaskFormModal from "../../components/kaizen-tasks/KaizenTaskFormModal";
import { KAIZEN_STATUSES, KAIZEN_PRIORITIES } from "../../components/kaizen-tasks/KaizenChips";
import { TICKET_CATEGORIES } from "../../constants/workflowConstants";
import {
  formatKaizenTicketId,
  parseTicketSearchQuery,
  taskMatchesUuidPrefix,
} from "../../utils/kaizenTicketId";
import { NO_ACTIVE_WORKFLOWS_MSG } from "../../constants/workflowConstants";
import { useActiveTicketCategories } from "../../hooks/useActiveTicketCategories";
import {
  useCreateKaizenTask,
  useKaizenTasks,
} from "../../hooks/useKaizenTasks";
import {
  KaizenFiltersBar,
  KaizenPageHeader,
  KaizenPageShell,
  KaizenTableCard,
} from "../../components/kaizen-tasks/KaizenModuleUI";
import { FilterSelect } from "../../components/ui/Select";
import { logKpiDrillDown, parseOverdueParam } from "../../utils/ticketKpiFilters";
import { useSyncTicketListNav } from "../../utils/ticketListNav";

export default function KaizenTasksPage() {
  useSyncTicketListNav();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(() => searchParams.get("status") || "");
  const [overdueOnly, setOverdueOnly] = useState(() =>
    parseOverdueParam(searchParams.get("overdue"))
  );
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState(() => searchParams.get("category") || "");
  const [blocked, setBlocked] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const urlOverdue = parseOverdueParam(searchParams.get("overdue"));
    const urlStatus = searchParams.get("status") || "";
    const urlCategory = searchParams.get("category") || "";
    setOverdueOnly(urlOverdue);
    setStatus(urlOverdue ? "" : urlStatus);
    setCategory(urlCategory);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setModalOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete("create");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const ticketSearch = useMemo(() => parseTicketSearchQuery(search), [search]);

  const filters = useMemo(
    () => ({
      page: ticketSearch.uuidPrefix ? 1 : page,
      limit: ticketSearch.uuidPrefix ? 500 : perPage,
      search: ticketSearch.apiSearch || undefined,
      status: overdueOnly ? undefined : status || undefined,
      overdue: overdueOnly || undefined,
      priority: priority || undefined,
      category: category || undefined,
      blocked: blocked === "" ? undefined : blocked === "true",
      sort_by: "due_date",
      sort_desc: false,
    }),
    [page, perPage, ticketSearch, status, overdueOnly, priority, category, blocked]
  );

  const { data, isLoading, isFetching, isPending } = useKaizenTasks(filters, {
    placeholderData: keepPreviousData,
  });
  const createMutation = useCreateKaizenTask();
  const { hasActiveCategories, isLoading: categoriesLoading } = useActiveTicketCategories();
  const createDisabled = categoriesLoading || !hasActiveCategories;

  const apiRows = data?.data || [];
  const rows = useMemo(() => {
    if (!ticketSearch.uuidPrefix) return apiRows;
    return apiRows.filter((row) => taskMatchesUuidPrefix(row, ticketSearch.uuidPrefix));
  }, [apiRows, ticketSearch.uuidPrefix]);
  const total = ticketSearch.uuidPrefix ? rows.length : (data?.meta?.total || 0);

  const isTableLoading = isPending || isLoading || (isFetching && apiRows.length === 0);

  useEffect(() => {
    const kpi = searchParams.get("kpi");
    if (!kpi || isLoading || isPending) return;

    const expectedCount = searchParams.get("kpiCount");
    logKpiDrillDown({
      kpiName: kpi,
      cardCount: expectedCount != null ? Number(expectedCount) : null,
      tableRowCount: total,
      filters: {
        status: overdueOnly ? "all" : status || "all",
        overdue: overdueOnly,
        priority: priority || "all",
        category: category || "all",
        blocked: blocked || "any",
      },
    });
  }, [total, searchParams, status, overdueOnly, priority, category, blocked, isLoading, isPending]);

  const exportCsv = () => {
    const headers = [
      "Ticket ID",
      "Title",
      "Category",
      "Assignee",
      "Team",
      "Priority",
      "Status",
      "Due Date",
      "Age (days)",
      "Created By",
      "Meeting Reference",
    ];
    const lines = rows.map((row) => {
      const ticketId = formatKaizenTicketId(row?.id);
      const meetingRef = row.meeting_title || (row.meeting_id ? `#${row.meeting_id}` : "");
      const values = [
        ticketId,
        row.title || "",
        row.category || "",
        row.owner_email || "",
        "",
        row.priority || "",
        row.status || "",
        row.due_date ? new Date(String(row.due_date).slice(0, 10)).toLocaleDateString() : "",
        row.ageing_days ?? "",
        row.created_by_email || row.owner_email || "",
        meetingRef,
      ];
      return values
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tickets_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreate = async (payload) => {
    try {
      const res = await createMutation.mutateAsync(payload);
      if (res?.success) {
        const ticketLabel = res.data?.id ? formatKaizenTicketId(res.data.id) : "Ticket";
        showToast(`${ticketLabel} created`, "success");
        setModalOpen(false);
        if (res.data?.id) navigate(`/tasks/${res.data.id}`);
      }
    } catch (err) {
      showToast(err?.message || "Failed to create task", "error");
    }
  };

  const filtersFocused = Boolean(overdueOnly || status || priority || category || blocked || search);

  if (isTableLoading) {
    return <Loader skeleton="table" message="Loading tickets..." />;
  }

  return (
    <KaizenPageShell>
      <KaizenPageHeader
        title="Tickets"
        subtitle="Operational working screen — search, filter, and manage all tickets"
        actions={
          <>
            <button type="button" onClick={exportCsv} className="kz-btn-secondary">
              <Download size={16} />
              Export
            </button>
            <PermissionGuard module="kaizen_tasks" action="create">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="kz-btn-primary"
                disabled={createDisabled}
                title={createDisabled && !categoriesLoading ? NO_ACTIVE_WORKFLOWS_MSG : undefined}
              >
                <Plus size={16} />
                Create Ticket
              </button>
            </PermissionGuard>
          </>
        }
      />

      <KaizenFiltersBar>
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted,var(--kz-placeholder))]" />
          <input
            id="kz-ticket-search"
            className="w-full pl-9 pr-3"
            placeholder="Search by KZN- ticket ID, title, assignee…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <FilterSelect
          value={status}
          onChange={(e) => {
            const nextStatus = e.target.value;
            setStatus(nextStatus);
            setPage(1);
            const params = new URLSearchParams(searchParams);
            params.delete("kpi");
            params.delete("kpiCount");
            params.delete("overdue");
            setOverdueOnly(false);
            if (nextStatus) params.set("status", nextStatus);
            else params.delete("status");
            setSearchParams(params, { replace: true });
          }}
          placeholder="All statuses"
          options={[
            { value: "", label: "All statuses" },
            ...KAIZEN_STATUSES.map((s) => ({ value: s, label: s })),
          ]}
        />
        <FilterSelect
          value={priority}
          onChange={(e) => { setPriority(e.target.value); setPage(1); }}
          placeholder="All priorities"
          options={[
            { value: "", label: "All priorities" },
            ...KAIZEN_PRIORITIES.map((p) => ({ value: p, label: p })),
          ]}
        />
        <FilterSelect
          value={category}
          onChange={(e) => {
            const nextCategory = e.target.value;
            setCategory(nextCategory);
            setPage(1);
            const params = new URLSearchParams(searchParams);
            params.delete("kpi");
            params.delete("kpiCount");
            if (nextCategory) params.set("category", nextCategory);
            else params.delete("category");
            setSearchParams(params, { replace: true });
          }}
          placeholder="All categories"
          options={[
            { value: "", label: "All categories" },
            ...TICKET_CATEGORIES.map((c) => ({ value: c, label: c })),
          ]}
        />
        <FilterSelect
          value={blocked}
          onChange={(e) => { setBlocked(e.target.value); setPage(1); }}
          placeholder="Blocked: any"
          options={[
            { value: "", label: "Blocked: any" },
            { value: "true", label: "Blocked only" },
            { value: "false", label: "Not blocked" },
          ]}
        />
        {filtersFocused ? (
          <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: KZ.activeBg, color: KZ.text }}>
            {total} results
          </span>
        ) : null}
      </KaizenFiltersBar>

      <KaizenTableCard>
        <KaizenTasksTable
          rows={rows}
          loading={isFetching && apiRows.length > 0}
          loadingMessage="Loading tickets..."
          total={total}
          page={ticketSearch.uuidPrefix ? 1 : page}
          perPage={ticketSearch.uuidPrefix ? Math.max(rows.length, 1) : perPage}
          onPageChange={setPage}
          onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
          paginationServer={!ticketSearch.uuidPrefix}
          onRowClick={(row) => navigate(`/tasks/${row.id}`)}
        />
      </KaizenTableCard>

      <KaizenTaskFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        saving={createMutation.isPending}
        title="Create Ticket"
      />
    </KaizenPageShell>
  );
}
