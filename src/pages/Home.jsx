import React, { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CircleDot,
  ClipboardCheck,
  Clock,
  GitBranch,
  Sparkles,
  Ticket,
} from "lucide-react";
import Loader from "../components/Loader";
import { KZ } from "../constants/designTokens";
import { useSession } from "../contexts/SessionContext";
import {
  useKaizenDashboardRecentActivity,
  useKaizenTasks,
} from "../hooks/useKaizenTasks";
import { resolveUserDisplayName } from "../utils/displayName";
import {
  buildMyTasksDrillDownUrl,
  buildRecentlyAssignedList,
  logKpiDrillDown,
  matchesActiveTicket,
  matchesInProgressStatus,
  matchesOpenStatus,
} from "../utils/ticketKpiFilters";
import {
  KaizenActivityFeed,
  KaizenPageShell,
  KaizenQuickActions,
  KaizenStatGrid,
  KaizenTicketList,
  KaizenWelcomeCard,
  KaizenWidgetCard,
  KaizenWidgetEmpty,
} from "../components/kaizen-tasks/KaizenModuleUI";
import { openTicketDetail, setTicketListNav, useSyncTicketListNav } from "../utils/ticketListNav";

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function Home() {
  useSyncTicketListNav();
  const navigate = useNavigate();
  const { session } = useSession();
  const recentlyAssignedRef = useRef(null);

  const { data: tasksRes, isLoading: tasksLoading } = useKaizenTasks({
    limit: 200,
    page: 1,
    mine: true,
  });
  const { data: activityRes, isLoading: activityLoading } =
    useKaizenDashboardRecentActivity(12);

  const myTasks = useMemo(() => tasksRes?.data || [], [tasksRes?.data]);
  const recentActivity = useMemo(() => activityRes?.data || [], [activityRes?.data]);

  const metrics = useMemo(() => {
    const openCount = myTasks.filter(matchesActiveTicket).length;
    const pendingApprovals = myTasks.filter(matchesOpenStatus).length;
    const workflowPending = myTasks.filter(matchesInProgressStatus).length;
    const recentlyAssigned = buildRecentlyAssignedList(myTasks, 6);

    return {
      openCount,
      myTicketsCount: myTasks.length,
      pendingApprovals,
      workflowPending,
      recentlyAssigned,
    };
  }, [myTasks]);

  const userName = resolveUserDisplayName(session?.user, "");

  const drillToMyTickets = (segment, kpi, cardCount) => {
    logKpiDrillDown({
      kpiName: kpi,
      cardCount,
      tableRowCount: null,
      filters: { segment, mine: true },
    });
    navigate(buildMyTasksDrillDownUrl(segment, { kpi, cardCount }));
  };

  const kpiCards = [
    {
      label: "Open Tickets",
      value: metrics.openCount,
      icon: CircleDot,
      accent: KZ.info,
      iconVariant: "soft",
      trendLabel: "Active in your queue",
      onClick: () => drillToMyTickets("active", "Open Tickets", metrics.openCount),
    },
    {
      label: "My Tickets",
      value: metrics.myTicketsCount,
      icon: Ticket,
      accent: KZ.success,
      iconVariant: "soft",
      trendLabel: "Assigned to you",
      onClick: () => drillToMyTickets("all", "My Tickets", metrics.myTicketsCount),
    },
    {
      label: "Pending Approvals",
      value: metrics.pendingApprovals,
      icon: ClipboardCheck,
      accent: KZ.warning,
      iconVariant: "soft",
      trendLabel: "Awaiting start of work",
      onClick: () => drillToMyTickets("open", "Pending Approvals", metrics.pendingApprovals),
    },
    {
      label: "Workflow Actions",
      value: metrics.workflowPending,
      icon: GitBranch,
      accent: "#7C3AED",
      iconVariant: "soft",
      trendLabel: "In progress",
      onClick: () => drillToMyTickets("in_progress", "Workflow Actions", metrics.workflowPending),
    },
    {
      label: "Recently Assigned",
      value: metrics.recentlyAssigned.length,
      icon: Clock,
      accent: KZ.brandHover,
      iconVariant: "soft",
      trendLabel: "Updated recently",
      onClick: () => {
        logKpiDrillDown({
          kpiName: "Recently Assigned",
          cardCount: metrics.recentlyAssigned.length,
          tableRowCount: metrics.recentlyAssigned.length,
          filters: { segment: "recently_assigned", mine: true, limit: 6 },
        });
        recentlyAssignedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    },
  ];

  if (tasksLoading || activityLoading) {
    return <Loader skeleton="home" message="Loading priorities…" />;
  }

  return (
    <KaizenPageShell className="kz-module-page--home">
      <KaizenWelcomeCard
        greeting={getTimeGreeting()}
        name={userName}
        subtitle="Here's what's happening today."
        icon={Sparkles}
      />

      <KaizenStatGrid cards={kpiCards} columns={5} />

      <div className="grid lg:grid-cols-2 gap-6">
        <KaizenWidgetCard
          title="Recently Assigned Tickets"
          footerLabel="View my tickets"
          onFooterClick={() => drillToMyTickets("all", "My Tickets", metrics.myTicketsCount)}
          className="scroll-mt-4"
        >
          <div ref={recentlyAssignedRef}>
            <KaizenTicketList
              tickets={metrics.recentlyAssigned}
              onItemClick={(t) => openTicketDetail(navigate, t.id, "/tasks/my")}
              emptyText="No tickets assigned to you."
            />
          </div>
        </KaizenWidgetCard>

        <KaizenWidgetCard title="Quick Actions">
          <KaizenQuickActions />
        </KaizenWidgetCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <KaizenWidgetCard
          title="Recent Activity"
          footerLabel="View all tickets"
          onFooterClick={() => navigate("/tasks")}
        >
          <KaizenActivityFeed
            items={recentActivity}
            emptyText="No recent ticket activity."
            onItemClick={(entry) => {
              setTicketListNav("/tasks");
              navigate(`/tasks/${entry.task_id}`);
            }}
          />
        </KaizenWidgetCard>

        <KaizenWidgetCard title="Recent Notifications">
          <KaizenWidgetEmpty
            icon={Bell}
            title="No notifications yet"
            description="Notifications will appear here when updates are sent to you."
          />
        </KaizenWidgetCard>
      </div>
    </KaizenPageShell>
  );
}
