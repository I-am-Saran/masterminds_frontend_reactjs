import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import { KZ } from "../../constants/designTokens";
import {
  useKaizenDashboardByCategory,
  useKaizenDashboardByOwner,
  useKaizenDashboardPriorityChart,
  useKaizenDashboardSummary,
  useKaizenTasks,
} from "../../hooks/useKaizenTasks";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Loader2,
  Ticket,
  XCircle,
} from "lucide-react";
import {
  buildStatusChartDataFromSummary,
  enrichOwnerWorkload,
  KaizenPageHeader,
  KaizenPageShell,
} from "../../components/kaizen-tasks/KaizenModuleUI";
import TicketDashboardLayout from "../../components/kaizen-tasks/TicketDashboardLayout";
import {
  buildAllTasksDrillDownUrl,
  KPI_STATUS,
  logKpiDrillDown,
} from "../../utils/ticketKpiFilters";
import { useSyncTicketListNav } from "../../utils/ticketListNav";
import "../../styles/ticket-dashboard-layout.css";

export default function KaizenDashboardPage() {
  useSyncTicketListNav();
  const navigate = useNavigate();
  const { data: summaryRes, isLoading: summaryLoading } = useKaizenDashboardSummary();
  const { data: ownerRes, isLoading: ownerLoading } = useKaizenDashboardByOwner();
  const { data: categoryRes, isLoading: categoryLoading } = useKaizenDashboardByCategory();
  const { data: priorityChart, isLoading: priorityLoading } = useKaizenDashboardPriorityChart();
  const { data: recentRes, isLoading: recentLoading } = useKaizenTasks(
    { limit: 6, page: 1, sort_by: "updated_at", sort_desc: true },
    { staleTime: 60_000 }
  );

  const summary = summaryRes?.data || {};
  const byOwner = ownerRes?.data || [];
  const byCategory = useMemo(
    () => (categoryRes?.data || []).map((row) => ({ name: row.category, value: row.count })),
    [categoryRes?.data]
  );
  const totalTickets = summary.total_count ?? 0;
  const recentTickets = useMemo(() => recentRes?.data || [], [recentRes?.data]);
  const categoryTotal = byCategory.reduce((s, c) => s + c.value, 0);
  const priorityData = priorityChart ?? [];

  const statusChart = useMemo(() => buildStatusChartDataFromSummary(summary), [summary]);
  const workloadRows = useMemo(() => enrichOwnerWorkload(byOwner), [byOwner]);

  const drillDown = (kpi, cardCount, path, filters) => {
    logKpiDrillDown({
      kpiName: kpi,
      cardCount,
      tableRowCount: null,
      filters,
    });
    navigate(path);
  };

  const statCards = [
    {
      label: "Total Tickets",
      value: totalTickets,
      icon: Ticket,
      accent: KZ.info,
      iconVariant: "soft",
      trendLabel: "All tickets in system",
      onClick: () =>
        drillDown("Total Tickets", totalTickets, buildAllTasksDrillDownUrl({ kpi: "Total Tickets", cardCount: totalTickets }), {}),
    },
    {
      label: "Open",
      value: summary.open_count ?? 0,
      icon: CircleDot,
      accent: KZ.success,
      iconVariant: "soft",
      trendLabel: "Awaiting start of work",
      onClick: () =>
        drillDown(
          "Open",
          summary.open_count ?? 0,
          buildAllTasksDrillDownUrl({
            status: KPI_STATUS.OPEN,
            kpi: "Open",
            cardCount: summary.open_count ?? 0,
          }),
          { status: KPI_STATUS.OPEN }
        ),
    },
    {
      label: "In Progress",
      value: summary.in_progress_count ?? 0,
      icon: Loader2,
      accent: KZ.warning,
      iconVariant: "soft",
      trendLabel: "Work in progress",
      onClick: () =>
        drillDown(
          "In Progress",
          summary.in_progress_count ?? 0,
          buildAllTasksDrillDownUrl({
            status: KPI_STATUS.IN_PROGRESS,
            kpi: "In Progress",
            cardCount: summary.in_progress_count ?? 0,
          }),
          { status: KPI_STATUS.IN_PROGRESS }
        ),
    },
    {
      label: "Overdue",
      value: summary.overdue_count,
      icon: AlertTriangle,
      accent: KZ.danger,
      iconVariant: "soft",
      trendLabel: "Past due date",
      onClick: () =>
        drillDown(
          "Overdue",
          summary.overdue_count,
          buildAllTasksDrillDownUrl({
            overdue: true,
            kpi: "Overdue",
            cardCount: summary.overdue_count,
          }),
          { overdue: true }
        ),
    },
    {
      label: "Resolved",
      value: summary.resolved_count ?? 0,
      icon: CheckCircle2,
      accent: "#7C3AED",
      iconVariant: "soft",
      trendLabel: "Successfully resolved",
      onClick: () =>
        drillDown(
          "Resolved",
          summary.resolved_count ?? 0,
          buildAllTasksDrillDownUrl({
            status: KPI_STATUS.RESOLVED,
            kpi: "Resolved",
            cardCount: summary.resolved_count ?? 0,
          }),
          { status: KPI_STATUS.RESOLVED }
        ),
    },
    {
      label: "Closed",
      value: summary.closed_count ?? 0,
      icon: XCircle,
      accent: KZ.textMuted,
      iconVariant: "soft",
      trendLabel: "All closed tickets",
      onClick: () =>
        drillDown(
          "Closed",
          summary.closed_count ?? 0,
          buildAllTasksDrillDownUrl({
            status: KPI_STATUS.CLOSED,
            kpi: "Closed",
            cardCount: summary.closed_count ?? 0,
          }),
          { status: KPI_STATUS.CLOSED }
        ),
    },
  ];

  if (summaryLoading) return <Loader skeleton="dashboard" message="Loading ticket dashboard…" />;

  return (
    <KaizenPageShell className="kz-module-page--dashboard tdash-page">
      <KaizenPageHeader title="Ticket Dashboard" />

      <TicketDashboardLayout
        subtitle="Executive overview of ticket volume, status, and assignee workload"
        statCards={statCards}
        totalTickets={totalTickets}
        statusChart={statusChart}
        priorityChart={priorityData}
        priorityLoading={priorityLoading}
        byCategory={byCategory}
        categoryLoading={categoryLoading}
        categoryTotal={categoryTotal}
        workloadRows={workloadRows}
        ownerLoading={ownerLoading}
        recentTickets={recentTickets}
        recentLoading={recentLoading}
        onCategoryClick={(item) =>
          drillDown(
            `Category: ${item.name}`,
            item.value,
            buildAllTasksDrillDownUrl({
              category: item.name,
              kpi: `Category: ${item.name}`,
              cardCount: item.value,
            }),
            { category: item.name }
          )
        }
        onViewAllTickets={() => navigate("/tasks")}
        onViewAllAssignees={() => navigate("/tasks")}
        onTicketClick={(t) => navigate(`/tasks/${t.id}`)}
      />
    </KaizenPageShell>
  );
}
