import React from "react";
import { ArrowRight, Ticket } from "lucide-react";
import EmptyState from "../ui/EmptyState";
import {
  DashboardPriorityBreakdown,
  KaizenCategoryBarChart,
  KaizenDonutChart,
  KaizenQuickActions,
  KaizenStatGrid,
  KaizenTicketList,
  KaizenWorkloadTable,
  PRIORITY_CHART_COLORS,
  STATUS_CHART_COLORS,
} from "./KaizenModuleUI";

/**
 * Ticket dashboard composition — KPI → Analytics (dominant) → Quick Actions → Operations.
 * Layout and hierarchy only; all data/actions come from props.
 */
export default function TicketDashboardLayout({
  subtitle,
  statCards,
  totalTickets,
  statusChart,
  priorityChart,
  priorityLoading,
  byCategory,
  categoryLoading,
  categoryTotal,
  workloadRows,
  ownerLoading,
  recentTickets,
  recentLoading,
  onCategoryClick,
  onViewAllTickets,
  onViewAllAssignees,
  onTicketClick,
}) {
  return (
    <div className="tdash">
      {subtitle ? (
        <div className="tdash__intro">
          <p className="tdash__intro-text">{subtitle}</p>
        </div>
      ) : null}

      <section className="tdash__kpi-band" aria-label="Key metrics">
        <div className="tdash__kpi-row">
          <KaizenStatGrid cards={statCards} columns={6} cardLayout="dashboard" className="contents" />
        </div>
      </section>

      <section className="tdash__analytics-section" aria-label="Analytics">
        <div className="tdash__section-head tdash__section-head--analytics">
          <h2 className="tdash__section-title tdash__section-title--analytics">Analytics</h2>
          <p className="tdash__section-subtitle">Distribution across your ticket queue</p>
        </div>

        <div className="tdash__analytics-grid">
          <article className="tdash-panel tdash-panel--chart tdash-panel--status">
            <header className="tdash-panel__head">
              <div>
                <h3 className="tdash-panel__title">Tickets by Status</h3>
                <span className="tdash-panel__badge">{totalTickets} total</span>
              </div>
            </header>
            <div className="tdash-chart-body tdash-status-chart">
              {statusChart.length === 0 ? (
                <EmptyState icon={Ticket} title="No tickets found" description="No ticket status data available yet." />
              ) : (
                <KaizenDonutChart
                  data={statusChart}
                  colors={STATUS_CHART_COLORS}
                  legendFirst
                />
              )}
            </div>
          </article>

          <article className="tdash-panel tdash-panel--chart tdash-panel--priority">
            <header className="tdash-panel__head">
              <h3 className="tdash-panel__title">Tickets by Priority</h3>
            </header>
            <div className="tdash-chart-body">
              <DashboardPriorityBreakdown
                data={priorityChart}
                colors={PRIORITY_CHART_COLORS}
                loading={priorityLoading}
              />
            </div>
          </article>

          <article className="tdash-panel tdash-panel--chart tdash-panel--category">
            <header className="tdash-panel__head">
              <h3 className="tdash-panel__title">Tickets by Category</h3>
              {categoryTotal > 0 ? (
                <span className="tdash-panel__badge">Total: {categoryTotal}</span>
              ) : null}
            </header>
            <div className="tdash-chart-body">
              {categoryLoading ? (
                <p className="text-sm kz-text-secondary">Loading…</p>
              ) : byCategory.length === 0 ? (
                <EmptyState icon={Ticket} title="No tickets found" description="No ticket category data available yet." />
              ) : (
                <KaizenCategoryBarChart data={byCategory} onItemClick={onCategoryClick} />
              )}
            </div>
          </article>
        </div>
      </section>

      <section className="tdash__quick-section" aria-label="Quick actions">
        <div className="tdash__section-head">
          <h2 className="tdash__section-title">Quick Actions</h2>
          <p className="tdash__section-subtitle">Common ticket workflows</p>
        </div>
        <KaizenQuickActions variant="dashboard" />
      </section>

      <section className="tdash__ops-section" aria-label="Operations">
        <div className="tdash__ops-grid">
          <div className="tdash__column">
            <div className="tdash__section-head">
              <h2 className="tdash__section-title">Operations</h2>
              <p className="tdash__section-subtitle">Team workload and latest activity</p>
            </div>

            <article className="tdash-panel tdash-panel--workload">
              <header className="tdash-panel__head">
                <h3 className="tdash-panel__title">Workload by Assignee</h3>
                <button type="button" className="tdash-panel__link" onClick={onViewAllAssignees}>
                  View all
                  <ArrowRight size={14} />
                </button>
              </header>
              {ownerLoading ? (
                <p className="text-sm px-6 pb-6 kz-text-secondary">Loading…</p>
              ) : (
                <KaizenWorkloadTable rows={workloadRows} maxItems={5} />
              )}
            </article>
          </div>

          <div className="tdash__column">
            <div className="tdash__section-head">
              <h2 className="tdash__section-title">Recent Tickets</h2>
              <p className="tdash__section-subtitle">Latest updates from the queue</p>
            </div>

            <div className="tdash-recent-panel">
              <div className="tdash-recent-panel__toolbar">
                <span className="tdash-recent-panel__toolbar-label">Active queue</span>
              </div>
              <div className="tdash-recent-feed">
                {recentLoading ? (
                  <p className="text-sm px-6 py-6 kz-text-secondary">Loading…</p>
                ) : (
                  <KaizenTicketList
                    tickets={recentTickets}
                    onItemClick={onTicketClick}
                    emptyText="No tickets available. Create your first ticket."
                  />
                )}
              </div>
              <div className="tdash-recent-panel__footer">
                <button type="button" onClick={onViewAllTickets}>
                  See all tickets
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
