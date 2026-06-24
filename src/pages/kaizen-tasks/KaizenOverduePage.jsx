import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Clock, Flame, Search } from "lucide-react";
import { KAIZEN_PRIORITIES } from "../../components/kaizen-tasks/KaizenChips";
import { KZ } from "../../constants/designTokens";
import Loader from "../../components/Loader";
import { FilterSelect } from "../../components/ui/Select";
import KaizenTasksTable from "../../components/kaizen-tasks/KaizenTasksTable";
import { useKaizenTasks } from "../../hooks/useKaizenTasks";
import { logKpiDrillDown } from "../../utils/ticketKpiFilters";
import {
  KaizenFiltersBar,
  KaizenPageHeader,
  KaizenPageShell,
  KaizenStatGrid,
  KaizenTableCard,
  KaizenWidgetCard,
} from "../../components/kaizen-tasks/KaizenModuleUI";
import { useSyncTicketListNav } from "../../utils/ticketListNav";

function agingBucket(days) {
  if (days <= 3) return "1–3 days";
  if (days <= 7) return "4–7 days";
  if (days <= 14) return "8–14 days";
  return "15+ days";
}

function daysOverdue(dueDate) {
  if (!dueDate) return 0;
  const due = new Date(String(dueDate).slice(0, 10));
  const today = new Date(new Date().toDateString());
  return Math.max(0, Math.floor((today - due) / (1000 * 60 * 60 * 24)));
}

const AGING_COLORS = [KZ.warning, KZ.danger, KZ.dangerDark, "#7F1D1D"];

export default function KaizenOverduePage() {
  useSyncTicketListNav();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");

  const filters = useMemo(
    () => ({
      page,
      limit: perPage,
      overdue: true,
      search: search.trim() || undefined,
      priority: priority || undefined,
      sort_by: "due_date",
      sort_desc: false,
    }),
    [page, perPage, search, priority]
  );

  const { data, isLoading, isFetching } = useKaizenTasks(filters);
  const { data: allOverdueRes } = useKaizenTasks(
    { overdue: true, limit: 200, page: 1 },
    { staleTime: 30_000 }
  );

  const rows = data?.data || [];
  const total = data?.meta?.total || 0;
  const allOverdue = allOverdueRes?.data || [];

  const criticalOverdue = allOverdue.filter((r) => (r.priority || "").toUpperCase() === "P1").length;
  const highPriorityOverdue = allOverdue.filter((r) =>
    ["P1", "P2"].includes((r.priority || "").toUpperCase())
  ).length;

  useEffect(() => {
    const kpi = searchParams.get("kpi");
    if (!kpi || isLoading) return;

    const expectedCount = searchParams.get("kpiCount");
    logKpiDrillDown({
      kpiName: kpi,
      cardCount: expectedCount != null ? Number(expectedCount) : null,
      tableRowCount: total,
      filters: { overdue: true, priority: priority || "all" },
    });
  }, [total, searchParams, priority, isLoading]);

  const agingChart = useMemo(() => {
    const buckets = {
      "1–3 days": 0,
      "4–7 days": 0,
      "8–14 days": 0,
      "15+ days": 0,
    };
    for (const row of allOverdue) {
      const bucket = agingBucket(daysOverdue(row.due_date));
      buckets[bucket] += 1;
    }
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [allOverdue]);

  if (isLoading) return <Loader skeleton="table" message="Loading overdue tickets..." />;

  const statCards = [
    {
      label: "Total Overdue",
      value: total,
      icon: Clock,
      accent: KZ.dangerDark,
      iconVariant: "solid",
      sublabel: "Past due date",
    },
    {
      label: "Critical Overdue",
      value: criticalOverdue,
      icon: Flame,
      accent: KZ.danger,
      iconVariant: "solid",
      sublabel: "P1 critical",
    },
    {
      label: "High Priority Overdue",
      value: highPriorityOverdue,
      icon: AlertTriangle,
      accent: KZ.warning,
      iconVariant: "solid",
      sublabel: "P1 & P2",
    },
  ];

  return (
    <KaizenPageShell>
      <KaizenPageHeader
        title="Overdue Tickets"
        subtitle="Escalation and SLA view — tickets past due date"
      />

      <KaizenFiltersBar>
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted,var(--kz-placeholder))]" />
          <input
            className="w-full pl-9 pr-3"
            placeholder="Search overdue tickets…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <FilterSelect
          value={priority}
          onChange={(e) => { setPriority(e.target.value); setPage(1); }}
          placeholder="All priorities"
          options={[
            { value: "", label: "All priorities" },
            ...KAIZEN_PRIORITIES.map((p) => ({ value: p, label: p })),
          ]}
        />
      </KaizenFiltersBar>

      <KaizenStatGrid cards={statCards} columns={3} />

      <div className="grid lg:grid-cols-3 gap-4">
        <KaizenWidgetCard
          title="Aging Buckets"
          badge={`Total: ${allOverdue.length}`}
          className="lg:col-span-1"
        >
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {agingChart.map((entry, index) => (
                    <Cell key={entry.name} fill={AGING_COLORS[index % AGING_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </KaizenWidgetCard>

        <KaizenTableCard className="lg:col-span-2">
          <KaizenTasksTable
            rows={rows}
            loading={isFetching}
            loadingMessage="Loading overdue tickets..."
            total={total}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
            onRowClick={(row) => navigate(`/tasks/${row.id}`)}
          />
        </KaizenTableCard>
      </div>
    </KaizenPageShell>
  );
}
