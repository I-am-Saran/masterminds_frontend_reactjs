import React, { useEffect, useMemo, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { AlertTriangle, Calendar, CheckCircle2, Loader2, Ticket } from "lucide-react";

import { KZ } from "../../constants/designTokens";

import Loader from "../../components/Loader";

import KaizenTasksTable from "../../components/kaizen-tasks/KaizenTasksTable";

import { useKaizenTasks } from "../../hooks/useKaizenTasks";

import {

  filterMyTasksBySegment,

  logKpiDrillDown,

  matchesClosedStatus,

  matchesDueTodayTicket,

  matchesInProgressStatus,

  matchesOpenStatus,

  matchesOverdueTicket,

  matchesResolvedStatus,

  TERMINAL_STATUSES,

} from "../../utils/ticketKpiFilters";

import {

  KaizenPageHeader,

  KaizenPageShell,

  KaizenStatGrid,

  KaizenTableCard,

} from "../../components/kaizen-tasks/KaizenModuleUI";

import { useSyncTicketListNav } from "../../utils/ticketListNav";



/** Backend GET /tasks caps limit at 200 (le=200). */

const MY_TICKETS_FETCH_LIMIT = 200;



export default function KaizenMyTasksPage() {

  useSyncTicketListNav();

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(1);

  const [perPage, setPerPage] = useState(50);

  const [segment, setSegment] = useState(() => searchParams.get("segment") || "all");



  useEffect(() => {

    const urlSegment = searchParams.get("segment") || "all";

    setSegment(urlSegment);

    setPage(1);

  }, [searchParams]);



  const filters = useMemo(

    () => ({

      mine: true,

      limit: MY_TICKETS_FETCH_LIMIT,

      page: 1,

      sort_by: "due_date",

      sort_desc: false,

    }),

    []

  );



  const { data, isLoading, isFetching } = useKaizenTasks(filters);

  const allMine = data?.data || [];

  const total = data?.meta?.total ?? allMine.length;



  const counts = useMemo(() => ({

    openCount: allMine.filter(matchesOpenStatus).length,

    inProgressCount: allMine.filter(matchesInProgressStatus).length,

    closedCount: allMine.filter(

      (r) => matchesResolvedStatus(r) || matchesClosedStatus(r)

    ).length,

    dueTodayCount: allMine.filter(matchesDueTodayTicket).length,

    overdueCount: allMine.filter(matchesOverdueTicket).length,

    allCount: allMine.length,

  }), [allMine]);



  const filteredRows = useMemo(

    () => filterMyTasksBySegment(allMine, segment),

    [allMine, segment]

  );



  const displayRows = useMemo(() => {

    const start = (page - 1) * perPage;

    return filteredRows.slice(start, start + perPage);

  }, [filteredRows, page, perPage]);



  const displayTotal = segment === "all" ? total : filteredRows.length;



  useEffect(() => {

    const kpi = searchParams.get("kpi");

    if (!kpi || isLoading) return;



    const expectedCount = searchParams.get("kpiCount");

    logKpiDrillDown({

      kpiName: kpi,

      cardCount: expectedCount != null ? Number(expectedCount) : null,

      tableRowCount: filteredRows.length,

      filters: { segment, mine: true, status: segmentToStatusLabel(segment) },

    });

  }, [filteredRows.length, searchParams, segment, isLoading]);



  const applySegment = (nextSegment, kpi, cardCount) => {

    logKpiDrillDown({

      kpiName: kpi,

      cardCount,

      tableRowCount: null,

      filters: { segment: nextSegment, mine: true, status: segmentToStatusLabel(nextSegment) },

    });

    setSegment(nextSegment);

    setPage(1);

    const params = new URLSearchParams(searchParams);

    if (nextSegment === "all") params.delete("segment");

    else params.set("segment", nextSegment);

    if (kpi) params.set("kpi", kpi);

    else params.delete("kpi");

    if (cardCount != null) params.set("kpiCount", String(cardCount));

    else params.delete("kpiCount");

    setSearchParams(params, { replace: true });

  };



  if (isLoading) return <Loader skeleton="table" message="Loading my tickets..." />;



  const statCards = [

    {

      label: "My Open",

      value: counts.openCount,

      icon: Ticket,

      accent: "#64748B",

      iconVariant: "soft",

      sublabel: `${counts.openCount} — Open tickets`,

      onClick: () => applySegment("open", "My Open", counts.openCount),

      active: segment === "open",

    },

    {

      label: "My In Progress",

      value: counts.inProgressCount,

      icon: Loader2,

      accent: KZ.warning,

      iconVariant: "soft",

      sublabel: `${counts.inProgressCount} — Work in progress`,

      onClick: () => applySegment("in_progress", "My In Progress", counts.inProgressCount),

      active: segment === "in_progress",

    },

    {

      label: "My Due Today",

      value: counts.dueTodayCount,

      icon: Calendar,

      accent: KZ.info,

      iconVariant: "soft",

      sublabel: `${counts.dueTodayCount} — Due today`,

      onClick: () => applySegment("due_today", "My Due Today", counts.dueTodayCount),

      active: segment === "due_today",

    },

    {

      label: "My Overdue",

      value: counts.overdueCount,

      icon: AlertTriangle,

      accent: KZ.dangerDark,

      iconVariant: "soft",

      sublabel: `${counts.overdueCount} — Past due`,

      onClick: () => applySegment("overdue", "My Overdue", counts.overdueCount),

      active: segment === "overdue",

    },

    {

      label: "My Closed",

      value: counts.closedCount,

      icon: CheckCircle2,

      accent: KZ.success,

      iconVariant: "soft",

      sublabel: `${counts.closedCount} — Resolved or closed`,

      onClick: () => applySegment("closed", "My Closed", counts.closedCount),

      active: segment === "closed",

    },

  ];



  return (

    <KaizenPageShell>

      <KaizenPageHeader

        title="My Tickets"

        subtitle="Tickets you are responsible for"

      />



      <KaizenStatGrid cards={statCards} columns={5} />



      <KaizenTableCard>

        <KaizenTasksTable

          rows={displayRows}

          loading={isFetching}

          loadingMessage="Loading my tickets..."

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



function segmentToStatusLabel(segment) {

  switch (segment) {

    case "active":

      return `NOT IN (${TERMINAL_STATUSES.join(", ")})`;

    case "open":

      return "OPEN";

    case "in_progress":

      return "IN_PROGRESS";

    case "closed":

      return "DONE, CANCELLED";

    case "due_today":

      return "due_date=today";

    case "overdue":

      return "due_date<today";

    default:

      return "all";

  }

}


