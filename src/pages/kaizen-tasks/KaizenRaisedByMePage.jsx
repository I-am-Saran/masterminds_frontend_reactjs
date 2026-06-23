import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Calendar, CheckCircle2, Loader2, Ticket } from "lucide-react";
import { KZ } from "../../constants/designTokens";
import Loader from "../../components/Loader";
import KaizenTasksTable from "../../components/kaizen-tasks/KaizenTasksTable";
import { useKaizenTasks } from "../../hooks/useKaizenTasks";
import {
  KaizenPageHeader,
  KaizenPageShell,
  KaizenStatGrid,
  KaizenTableCard,
} from "../../components/kaizen-tasks/KaizenModuleUI";
import { useSyncTicketListNav } from "../../utils/ticketListNav";

/** Backend GET /tasks caps limit at 200 (le=200). */
const RAISED_BY_ME_FETCH_LIMIT = 200;

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(String(dateStr).slice(0, 10));
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

function normalizeStatus(status) {
  return (status || "").toUpperCase().replace(/\s+/g, "_");
}

export default function KaizenRaisedByMePage() {
  useSyncTicketListNav();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [segment, setSegment] = useState("all");

  const filters = useMemo(
    () => ({
      raised_by_me: true,
      limit: RAISED_BY_ME_FETCH_LIMIT,
      page: 1,
      sort_by: "due_date",
      sort_desc: false,
    }),
    []
  );

  const { data, isLoading, isFetching } = useKaizenTasks(filters);
  const allRaised = data?.data || [];
  const total = data?.meta?.total ?? allRaised.length;

  const counts = useMemo(() => {
    const openCount = allRaised.filter((r) => normalizeStatus(r.status) === "OPEN").length;
    const inProgressCount = allRaised.filter((r) => normalizeStatus(r.status) === "IN_PROGRESS").length;
    const closedCount = allRaised.filter((r) => ["DONE", "CANCELLED"].includes(normalizeStatus(r.status))).length;
    const dueTodayCount = allRaised.filter((r) => {
      const status = normalizeStatus(r.status);
      return isToday(r.due_date) && !["DONE", "CANCELLED"].includes(status);
    }).length;
    const overdueCount = allRaised.filter((r) => {
      if (!r?.due_date) return false;
      const due = new Date(String(r.due_date).slice(0, 10));
      const today = new Date(new Date().toDateString());
      return due < today && !["DONE", "CANCELLED"].includes(normalizeStatus(r.status));
    }).length;
    return { openCount, inProgressCount, closedCount, dueTodayCount, overdueCount };
  }, [allRaised]);

  const filteredRows = useMemo(() => {
    if (segment === "open") {
      return allRaised.filter((r) => normalizeStatus(r.status) === "OPEN");
    }
    if (segment === "in_progress") {
      return allRaised.filter((r) => normalizeStatus(r.status) === "IN_PROGRESS");
    }
    if (segment === "closed") {
      return allRaised.filter((r) => ["DONE", "CANCELLED"].includes(normalizeStatus(r.status)));
    }
    if (segment === "due_today") {
      return allRaised.filter((r) => {
        const status = normalizeStatus(r.status);
        return isToday(r.due_date) && !["DONE", "CANCELLED"].includes(status);
      });
    }
    if (segment === "overdue") {
      return allRaised.filter((r) => {
        if (!r?.due_date) return false;
        const due = new Date(String(r.due_date).slice(0, 10));
        return due < new Date(new Date().toDateString()) && !["DONE", "CANCELLED"].includes(normalizeStatus(r.status));
      });
    }
    return allRaised;
  }, [allRaised, segment]);

  const displayRows = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredRows.slice(start, start + perPage);
  }, [filteredRows, page, perPage]);

  const displayTotal = segment === "all" ? total : filteredRows.length;

  if (isLoading) return <Loader skeleton="table" message="Loading raised tickets..." />;

  const statCards = [
    {
      label: "Open",
      value: counts.openCount,
      icon: Ticket,
      accent: "#64748B",
      iconVariant: "soft",
      sublabel: `${counts.openCount} — Open tickets`,
      onClick: () => { setSegment("open"); setPage(1); },
      active: segment === "open",
    },
    {
      label: "In Progress",
      value: counts.inProgressCount,
      icon: Loader2,
      accent: KZ.warning,
      iconVariant: "soft",
      sublabel: `${counts.inProgressCount} — Work in progress`,
      onClick: () => { setSegment("in_progress"); setPage(1); },
      active: segment === "in_progress",
    },
    {
      label: "Due Today",
      value: counts.dueTodayCount,
      icon: Calendar,
      accent: KZ.info,
      iconVariant: "soft",
      sublabel: `${counts.dueTodayCount} — Due today`,
      onClick: () => { setSegment("due_today"); setPage(1); },
      active: segment === "due_today",
    },
    {
      label: "Overdue",
      value: counts.overdueCount,
      icon: AlertTriangle,
      accent: KZ.dangerDark,
      iconVariant: "soft",
      sublabel: `${counts.overdueCount} — Past due`,
      onClick: () => { setSegment("overdue"); setPage(1); },
      active: segment === "overdue",
    },
    {
      label: "Closed",
      value: counts.closedCount,
      icon: CheckCircle2,
      accent: KZ.success,
      iconVariant: "soft",
      sublabel: `${counts.closedCount} — Resolved or closed`,
      onClick: () => { setSegment("closed"); setPage(1); },
      active: segment === "closed",
    },
  ];

  return (
    <KaizenPageShell>
      <KaizenPageHeader
        title="Raised Tickets"
        subtitle="Tickets created by you"
      />

      <KaizenStatGrid cards={statCards} columns={5} />

      <KaizenTableCard>
        <KaizenTasksTable
          rows={displayRows}
          loading={isFetching}
          loadingMessage="Loading raised tickets..."
          total={displayTotal}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
          paginationServer={false}
          columnPreset="myTickets"
          onRowClick={(row) => navigate(`/tasks/${row.id}`)}
        />
      </KaizenTableCard>
    </KaizenPageShell>
  );
}
