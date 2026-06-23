import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCountUp } from "../../hooks/useCountUp";
import {
  AlignLeft,
  ArrowRight,
  Ban,
  Calendar,
  CircleDot,
  Flag,
  History,
  LayoutGrid,
  MoreHorizontal,
  Plus,
  Ticket,
  Type,
  User,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { KZ } from "../../constants/designTokens";
import { KaizenPriorityChip, KaizenStatusChip } from "./KaizenChips";
import { formatKaizenTicketId } from "../../utils/kaizenTicketId";
import {
  dedupeRedundantActivityEvents,
  formatActivityActorInitials,
  formatRelativeActivityTime,
  formatTicketActivityActor,
  formatActivityFieldValue,
  getTicketActivityMeta,
  parseActivityEvent,
} from "../../utils/ticketActivity";

export function KaizenPageShell({ children, className = "" }) {
  return (
    <div className={`kz-module-page w-full min-w-0 max-w-full box-border ${className}`.trim()}>
      <div className="kz-module-page__inner w-full max-w-[1440px] min-w-0 mx-auto p-5 md:p-8 space-y-6 box-border">
        {children}
      </div>
    </div>
  );
}

export function KaizenWelcomeCard({ greeting, name, subtitle, icon: Icon }) {
  const GreetingIcon = Icon;
  return (
    <section className="kz-greeting-card" aria-label="Welcome">
      <div className="min-w-0">
        <h1 className="kz-greeting-card__title">
          {greeting}
          {name ? `, ${name}` : ""}
        </h1>
        <p className="kz-greeting-card__subtitle">
          {subtitle || "Here's what's happening today."}
        </p>
      </div>
      {GreetingIcon ? (
        <span className="kz-greeting-card__accent" aria-hidden>
          <GreetingIcon size={24} strokeWidth={1.75} />
        </span>
      ) : null}
    </section>
  );
}

export function KaizenWidgetEmpty({ icon: Icon, title, description }) {
  return (
    <div className="kz-widget-empty kz-empty-fade-in">
      <span className="kz-widget-empty__icon" aria-hidden>
        <Icon size={26} strokeWidth={1.5} />
      </span>
      <p className="kz-widget-empty__title">{title}</p>
      {description ? <p className="kz-widget-empty__desc">{description}</p> : null}
    </div>
  );
}

export function KaizenPageHeader({ title, subtitle, toolbar, actions, className = "" }) {
  return (
    <div className={`kz-page-header flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between ${className}`.trim()}>
      <div className="min-w-0">
        <h1 className="kz-page-title">{title}</h1>
        {subtitle ? (
          <p className="kz-page-subtitle mt-2 kz-text-secondary">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {toolbar}
        {actions}
      </div>
    </div>
  );
}

function hexToRgba(hex, alpha) {
  const raw = String(hex || "").replace("#", "");
  if (raw.length !== 6) return `rgba(100, 116, 139, ${alpha})`;
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function MetricStatCard({
  label,
  value,
  icon: Icon,
  accent,
  iconVariant = "soft",
  labelColor,
  tint,
  sublabel,
  trendLabel,
  active = false,
  onClick,
  layout = "default",
}) {
  const resolvedAccent = accent || KZ.info;
  const displayValue = useCountUp(value ?? 0);
  const clickable = Boolean(onClick);
  const isSolid = iconVariant === "solid";
  const iconBg = isSolid ? resolvedAccent : hexToRgba(resolvedAccent, 0.14);
  const iconFg = isSolid ? "#FFFFFF" : resolvedAccent;
  const cardBg = tint
    ? hexToRgba(resolvedAccent, tint)
    : isSolid
      ? hexToRgba(resolvedAccent, 0.06)
      : "var(--kz-surface)";

  const cardClass = [
    "kz-metric-stat",
    clickable ? "kz-metric-stat--clickable" : "",
    active ? "kz-metric-stat--active" : "",
    layout === "dashboard" ? "kz-metric-stat--dashboard" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (layout === "dashboard") {
    return (
      <article
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") onClick();
              }
            : undefined
        }
        className={cardClass}
        style={{ background: cardBg }}
      >
        <div className="kz-metric-stat__header kz-metric-stat__header--dashboard">
          {Icon ? (
            <span
              className="kz-metric-stat__icon kz-metric-stat__icon--dashboard"
              style={{ backgroundColor: iconBg, color: iconFg }}
            >
              <Icon size={18} strokeWidth={2} />
            </span>
          ) : null}
          <p className="kz-metric-stat__label kz-metric-stat__label--dashboard">{label}</p>
        </div>
        <p className="kz-metric-stat__value kz-metric-stat__value--dashboard">{displayValue}</p>
        {trendLabel ? (
          <div className="kz-metric-stat__trend kz-metric-stat__trend--dashboard" aria-label="Status indicator">
            <span className="kz-metric-stat__trend-dot" />
            <span className="kz-metric-stat__trend-label">{trendLabel}</span>
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <article
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      className={cardClass}
      style={{ background: cardBg }}
    >
      <div className="kz-metric-stat__header">
        {Icon ? (
          <span
            className="kz-metric-stat__icon"
            style={{
              backgroundColor: iconBg,
              color: iconFg,
            }}
          >
            <Icon size={isSolid ? 18 : 17} strokeWidth={2} />
          </span>
        ) : null}
        <p
          className="kz-metric-stat__label"
          style={labelColor ? { color: labelColor } : undefined}
        >
          {label}
        </p>
      </div>
      <p className="kz-metric-stat__value">{displayValue}</p>
      {sublabel ? <p className="kz-metric-stat__sublabel">{sublabel}</p> : null}
      {trendLabel ? (
        <div className="kz-metric-stat__trend" aria-label="Status indicator">
          <span className="kz-metric-stat__trend-dot" />
          <span className="kz-metric-stat__trend-label">{trendLabel}</span>
        </div>
      ) : null}
    </article>
  );
}

export function KaizenStatGrid({ cards, columns = 6, className = "", cardLayout = "default" }) {
  const colClass =
    columns === 6
      ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-6"
      : columns === 5
        ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
        : columns === 4
          ? "grid-cols-2 lg:grid-cols-4"
          : columns === 3
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-2 md:grid-cols-3 xl:grid-cols-6";

  return (
    <div className={`kz-stat-grid grid ${colClass} gap-3 w-full min-w-0 ${className}`.trim()}>
      {cards.map((card) => (
        <MetricStatCard
          key={card.label}
          label={card.label}
          value={card.value}
          icon={card.icon}
          accent={card.accent}
          iconVariant={card.iconVariant}
          labelColor={card.labelColor}
          tint={card.tint}
          sublabel={card.sublabel}
          trendLabel={card.trendLabel}
          active={card.active}
          onClick={card.onClick}
          layout={cardLayout}
        />
      ))}
    </div>
  );
}

export function KaizenWidgetCard({
  title,
  badge,
  insight,
  children,
  footerLabel,
  onFooterClick,
  className = "",
}) {
  const hasHeader = Boolean(title || badge || insight);

  return (
    <section className={`kz-card kz-widget-card kz-panel-card overflow-hidden ${className}`}>
      {hasHeader ? (
        <div className="kz-widget-header">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            {(title || badge) ? (
              <div className="flex items-center gap-2 min-w-0">
                {title ? <h2 className="kz-widget-title kz-card-title truncate">{title}</h2> : null}
                {badge ? <span className="kz-widget-badge">{badge}</span> : null}
              </div>
            ) : null}
            {insight ? <p className="kz-widget-insight">{insight}</p> : null}
          </div>
          <button type="button" className="kz-widget-menu" aria-label="Widget options">
            <MoreHorizontal size={16} />
          </button>
        </div>
      ) : null}
      <div className="kz-widget-body">{children}</div>
      {footerLabel ? (
        <div className="kz-widget-footer">
          <button type="button" className="kz-widget-footer-link" onClick={onFooterClick}>
            {footerLabel}
            <ArrowRight size={14} />
          </button>
        </div>
      ) : null}
    </section>
  );
}

const DEFAULT_CHART_COLORS = ["#93C5FD", "#FCD34D", "#FCA5A5", "#86EFAC", "#CBD5E1"];

export function KaizenDonutChart({
  data,
  colors = DEFAULT_CHART_COLORS,
  centerLabel = "Total",
  legendFirst = false,
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (!data.length || total === 0) {
    return (
      <p className="text-sm text-center py-8 kz-text-secondary">
        No data available
      </p>
    );
  }

  const legend = (
    <ul className="kz-donut-chart__legend">
      {data.map((item, index) => {
        const pct = total ? Math.round((item.value / total) * 100) : 0;
        return (
          <li key={item.name} className="kz-donut-legend-item">
            <span
              className="kz-donut-legend-dot"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="kz-donut-legend-label">{item.name}</span>
            <span className="kz-donut-legend-value">
              {item.value} ({pct}%)
            </span>
          </li>
        );
      })}
    </ul>
  );

  const viz = (
    <div className="kz-donut-chart__viz">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={88}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="kz-donut-chart__center">
        <span className="kz-donut-chart__center-value">{total}</span>
        <span className="kz-donut-chart__center-label">{centerLabel}</span>
      </div>
    </div>
  );

  return (
    <div className={`kz-donut-chart${legendFirst ? " kz-donut-chart--legend-first" : ""}`}>
      {legendFirst ? (
        <>
          {legend}
          {viz}
        </>
      ) : (
        <>
          {viz}
          {legend}
        </>
      )}
    </div>
  );
}

export const CATEGORY_CHART_COLORS = [
  KZ.info,
  "#7C3AED",
  KZ.success,
  KZ.warning,
  "#0EA5E9",
  "#EC4899",
  KZ.brand,
  KZ.brandMuted,
];

export function KaizenCategoryBarChart({
  data,
  colors = CATEGORY_CHART_COLORS,
  onItemClick,
  maxItems = 8,
}) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [data]);

  const sorted = useMemo(
    () => [...data].sort((a, b) => b.value - a.value).slice(0, maxItems),
    [data, maxItems]
  );
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  const maxValue = sorted[0]?.value || 1;
  const topCategory = sorted[0];

  if (!data.length || total === 0) {
    return (
      <p className="text-sm text-center py-8 kz-text-secondary">
        No data available
      </p>
    );
  }

  return (
    <div className="kz-category-chart">
      {topCategory ? (
        <div className="kz-category-chart__highlight">
          <div className="kz-category-chart__highlight-copy">
            <span className="kz-category-chart__highlight-label">Leading category</span>
            <span className="kz-category-chart__highlight-name" title={topCategory.name}>
              {topCategory.name}
            </span>
          </div>
          <div className="kz-category-chart__highlight-stat">
            <span className="kz-category-chart__highlight-value">{topCategory.value}</span>
            <span className="kz-category-chart__highlight-pct">
              {total ? Math.round((topCategory.value / total) * 100) : 0}% of total
            </span>
          </div>
        </div>
      ) : null}

      <ul className="kz-category-chart__list" role="list">
        {sorted.map((item, index) => {
          const sharePct = total ? (item.value / total) * 100 : 0;
          const barWidth = maxValue ? (item.value / maxValue) * 100 : 0;
          const color = colors[index % colors.length];
          const clickable = Boolean(onItemClick);

          return (
            <li key={item.name}>
              <button
                type="button"
                className={`kz-category-chart__row${clickable ? " kz-category-chart__row--clickable" : ""}`}
                onClick={clickable ? () => onItemClick(item) : undefined}
                disabled={!clickable}
                title={clickable ? `View ${item.value} tickets in ${item.name}` : item.name}
              >
                <div className="kz-category-chart__meta">
                  <span
                    className={`kz-category-chart__rank${index < 3 ? " kz-category-chart__rank--top" : ""}`}
                    style={index < 3 ? { color, borderColor: `${color}33`, backgroundColor: `${color}14` } : undefined}
                  >
                    {index + 1}
                  </span>
                  <span className="kz-category-chart__name" title={item.name}>
                    {item.name}
                  </span>
                  <span className="kz-category-chart__count">{item.value}</span>
                  <span className="kz-category-chart__pct">{Math.round(sharePct)}%</span>
                </div>
                <div className="kz-category-chart__track" aria-hidden="true">
                  <div
                    className="kz-category-chart__fill"
                    style={{
                      width: animate ? `${barWidth}%` : "0%",
                      "--kz-bar-color": color,
                    }}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {data.length > maxItems ? (
        <p className="kz-category-chart__more">
          +{data.length - maxItems} more categor{data.length - maxItems === 1 ? "y" : "ies"}
        </p>
      ) : null}
    </div>
  );
}

const WORKLOAD_AVATAR_COLORS = [
  KZ.info,
  "#7C3AED",
  KZ.success,
  KZ.warning,
  "#0EA5E9",
  KZ.brandHover,
];

function assigneeInitials(email) {
  const local = String(email || "?").split("@")[0] || "?";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

function formatAssigneeName(email) {
  if (!email || email === "Unassigned") return "Unassigned";
  const local = String(email).split("@")[0] || email;
  if (!local.includes(".") && !local.includes("_") && !local.includes("-")) {
    return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function WorkloadStatPill({ label, value, tone = "neutral" }) {
  if (!value) return null;
  return (
    <span className={`kz-workload-board__pill kz-workload-board__pill--${tone}`}>
      <span className="kz-workload-board__pill-value">{value}</span>
      <span className="kz-workload-board__pill-label">{label}</span>
    </span>
  );
}

export function KaizenWorkloadTable({ rows, onViewAll, onRowClick, maxItems = 8 }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [rows]);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.total_count - a.total_count).slice(0, maxItems),
    [rows, maxItems]
  );
  const topAssignee = sorted[0];
  const maxTotal = topAssignee?.total_count || 1;
  const workloadTotal = useMemo(
    () => rows.reduce((sum, row) => sum + (row.total_count ?? 0), 0),
    [rows]
  );

  if (!rows.length) {
    return (
      <p className="text-sm text-center py-6 kz-text-secondary">
        No assignee workload data available.
      </p>
    );
  }

  return (
    <div className="kz-workload-board">
      {topAssignee ? (
        <div className="kz-workload-board__highlight">
          <div className="kz-workload-board__highlight-copy">
            <span className="kz-workload-board__highlight-label">Highest workload</span>
            <span className="kz-workload-board__highlight-name" title={topAssignee.owner_email}>
              {formatAssigneeName(topAssignee.owner_email)}
            </span>
            <span className="kz-workload-board__highlight-email">{topAssignee.owner_email}</span>
          </div>
          <div className="kz-workload-board__highlight-stat">
            <span className="kz-workload-board__highlight-value">{topAssignee.total_count}</span>
            <span className="kz-workload-board__highlight-pct">
              {workloadTotal
                ? `${Math.round((topAssignee.total_count / workloadTotal) * 100)}% of tickets`
                : "tickets"}
            </span>
          </div>
        </div>
      ) : null}

      <ul className="kz-workload-board__list" role="list">
        {sorted.map((row, index) => {
          const open = row.open_count ?? 0;
          const inProgress = row.in_progress_count ?? 0;
          const overdue = row.overdue_count ?? 0;
          const total = row.total_count ?? 0;
          const other = Math.max(0, total - open - inProgress - overdue);
          const avatarColor = WORKLOAD_AVATAR_COLORS[index % WORKLOAD_AVATAR_COLORS.length];
          const rowWidth = animate ? (total / maxTotal) * 100 : 0;
          const clickable = Boolean(onRowClick);

          return (
            <li key={row.owner_email}>
              <button
                type="button"
                className={`kz-workload-board__row${clickable ? " kz-workload-board__row--clickable" : ""}`}
                onClick={clickable ? () => onRowClick(row) : undefined}
                disabled={!clickable}
                title={row.owner_email}
              >
                <div className="kz-workload-board__meta">
                  <span
                    className={`kz-workload-board__rank${index < 3 ? " kz-workload-board__rank--top" : ""}`}
                    style={
                      index < 3
                        ? {
                            color: avatarColor,
                            borderColor: `${avatarColor}33`,
                            backgroundColor: `${avatarColor}14`,
                          }
                        : undefined
                    }
                  >
                    {index + 1}
                  </span>
                  <span
                    className="kz-workload-board__avatar"
                    style={{
                      color: avatarColor,
                      backgroundColor: `${avatarColor}18`,
                      borderColor: `${avatarColor}30`,
                    }}
                  >
                    {assigneeInitials(row.owner_email)}
                  </span>
                  <div className="kz-workload-board__identity min-w-0">
                    <span className="kz-workload-board__name">{formatAssigneeName(row.owner_email)}</span>
                    <span className="kz-workload-board__email">{row.owner_email}</span>
                  </div>
                  <span className="kz-workload-board__total">{total}</span>
                </div>

                <div className="kz-workload-board__stats">
                  <WorkloadStatPill label="Open" value={open} tone="open" />
                  <WorkloadStatPill label="In progress" value={inProgress} tone="progress" />
                  <WorkloadStatPill label="Overdue" value={overdue} tone="overdue" />
                </div>

                <div className="kz-workload-board__track" aria-hidden="true">
                  <div
                    className="kz-workload-board__bar"
                    style={{ width: animate ? `${rowWidth}%` : "0%" }}
                  >
                    {total > 0 ? (
                      <>
                        {open > 0 ? (
                          <span
                            className="kz-workload-board__segment kz-workload-board__segment--open"
                            style={{ width: `${(open / total) * 100}%` }}
                          />
                        ) : null}
                        {inProgress > 0 ? (
                          <span
                            className="kz-workload-board__segment kz-workload-board__segment--progress"
                            style={{ width: `${(inProgress / total) * 100}%` }}
                          />
                        ) : null}
                        {overdue > 0 ? (
                          <span
                            className="kz-workload-board__segment kz-workload-board__segment--overdue"
                            style={{ width: `${(overdue / total) * 100}%` }}
                          />
                        ) : null}
                        {other > 0 ? (
                          <span
                            className="kz-workload-board__segment kz-workload-board__segment--other"
                            style={{ width: `${(other / total) * 100}%` }}
                          />
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {rows.length > maxItems ? (
        <p className="kz-workload-board__more">
          +{rows.length - maxItems} more assignee{rows.length - maxItems === 1 ? "" : "s"}
        </p>
      ) : null}

      {onViewAll ? (
        <div className="kz-widget-footer border-t-0 pt-0">
          <button type="button" className="kz-widget-footer-link" onClick={onViewAll}>
            View all assignees
            <ArrowRight size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function KaizenTicketList({ tickets, onItemClick, emptyText = "No tickets found." }) {
  if (!tickets.length) {
    return (
      <p className="text-sm text-center py-6 kz-text-secondary">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="kz-ticket-list">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <button
            type="button"
            className="kz-ticket-list-item"
            onClick={() => onItemClick?.(ticket)}
          >
            <span className="kz-ticket-list-icon">
              <Ticket size={16} />
            </span>
            <span className="kz-ticket-list-content min-w-0">
              <span className="kz-ticket-list-title truncate">{ticket.title}</span>
              <span className="kz-ticket-list-meta">
                <span className="kz-ticket-list-id">{formatKaizenTicketId(ticket.id)}</span>
                <span className="kz-ticket-list-sep">•</span>
                <KaizenPriorityChip priority={ticket.priority} />
                <span className="kz-ticket-list-sep">•</span>
                <KaizenStatusChip status={ticket.status} />
              </span>
            </span>
            <span className="kz-ticket-list-side shrink-0 text-right">
              <span className="kz-ticket-list-date block text-xs kz-text-secondary">
                {ticket.updated_at || ticket.created_at
                  ? new Date(ticket.updated_at || ticket.created_at).toLocaleDateString()
                  : "—"}
              </span>
              <span className="text-xs kz-text-secondary">
                {ticket.comment_count ?? 0} comments
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

const ACTIVITY_TONE_COLORS = {
  info: KZ.info,
  warning: KZ.warning,
  brand: KZ.brandHover,
  success: KZ.success,
  danger: KZ.dangerDark,
  purple: "#7C3AED",
  neutral: KZ.textMuted,
};

const ACTIVITY_FIELD_ICONS = {
  status: CircleDot,
  priority: Flag,
  owner_email: User,
  due_date: Calendar,
  title: Type,
  category: LayoutGrid,
  description: AlignLeft,
  is_blocked: Ban,
  blocked_reason: Ban,
};

function ActivityChangeValues({ entry }) {
  const field = entry?.field_name || "";
  const oldRaw = entry?.old_value;
  const newRaw = entry?.new_value;
  const hasOld = oldRaw !== null && oldRaw !== undefined && oldRaw !== "";

  if (field === "activity") {
    const event = parseActivityEvent(entry);
    return (
      <div className="kz-activity-feed__values kz-activity-feed__values--event">
        {event?.status ? <KaizenStatusChip status={event.status} /> : null}
        <p className="kz-activity-feed__message">{event?.message || "Ticket updated"}</p>
      </div>
    );
  }

  if (field === "status") {
    return (
      <div className="kz-activity-feed__values">
        {hasOld ? <KaizenStatusChip status={oldRaw} /> : null}
        {hasOld ? <ArrowRight size={12} className="kz-activity-feed__arrow" aria-hidden="true" /> : null}
        <KaizenStatusChip status={newRaw || "OPEN"} />
      </div>
    );
  }

  if (field === "priority") {
    return (
      <div className="kz-activity-feed__values">
        {hasOld ? <KaizenPriorityChip priority={oldRaw} /> : null}
        {hasOld ? <ArrowRight size={12} className="kz-activity-feed__arrow" aria-hidden="true" /> : null}
        <KaizenPriorityChip priority={newRaw || "P3"} />
      </div>
    );
  }

  const oldVal = formatActivityFieldValue(field, oldRaw);
  const newVal = formatActivityFieldValue(field, newRaw);

  return (
    <div className="kz-activity-feed__values kz-activity-feed__values--text">
      {hasOld ? <span className="kz-activity-feed__value-old">{oldVal}</span> : null}
      {hasOld ? <ArrowRight size={12} className="kz-activity-feed__arrow" aria-hidden="true" /> : null}
      <span className="kz-activity-feed__value-new">{newVal}</span>
    </div>
  );
}

export function KaizenActivityFeed({ items, onItemClick, emptyText = "No recent activity." }) {
  const feedItems = useMemo(() => dedupeRedundantActivityEvents(items), [items]);

  if (!feedItems.length) {
    return (
      <p className="text-sm text-center py-6 kz-text-secondary">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="kz-activity-feed">
      {feedItems.map((entry, index) => {
        const meta = getTicketActivityMeta(entry.field_name, entry);
        const isNarrativeEvent = entry.field_name === "activity";
        const toneColor = ACTIVITY_TONE_COLORS[meta.tone] || ACTIVITY_TONE_COLORS.neutral;
        const FieldIcon = ACTIVITY_FIELD_ICONS[meta.field] || History;
        const isLast = index === feedItems.length - 1;

        return (
          <button
            key={entry.id ?? `activity-${index}`}
            type="button"
            className="kz-activity-feed__item"
            onClick={() => onItemClick?.(entry)}
          >
            <div className="kz-activity-feed__rail" aria-hidden="true">
              <span
                className="kz-activity-feed__dot"
                style={{
                  color: toneColor,
                  backgroundColor: `${toneColor}18`,
                  borderColor: `${toneColor}30`,
                }}
              >
                <FieldIcon size={14} strokeWidth={2.25} />
              </span>
              {!isLast ? <span className="kz-activity-feed__line" /> : null}
            </div>

            <div className="kz-activity-feed__body">
              <div className="kz-activity-feed__header">
                <span className="kz-activity-feed__ticket-id">
                  {formatKaizenTicketId(entry.task_id)}
                </span>
                <span
                  className="kz-activity-feed__field-badge"
                  style={{
                    color: toneColor,
                    backgroundColor: `${toneColor}14`,
                    borderColor: `${toneColor}28`,
                  }}
                >
                  {meta.label}
                </span>
                <span className="kz-activity-feed__time">
                  {formatRelativeActivityTime(entry.created_at)}
                </span>
              </div>

              <p className="kz-activity-feed__title" title={entry.task_title || "Untitled ticket"}>
                {entry.task_title || "Untitled ticket"}
              </p>

              {!isNarrativeEvent ? (
                <div className="kz-activity-feed__actor-row">
                  <span className="kz-activity-feed__actor-chip">
                    {formatActivityActorInitials(entry)}
                  </span>
                  <span className="kz-activity-feed__actor">
                    {formatTicketActivityActor(entry)}
                  </span>
                  <span className="kz-activity-feed__verb">updated</span>
                </div>
              ) : (
                <div className="kz-activity-feed__actor-row">
                  <span className="kz-activity-feed__actor-chip">
                    {formatActivityActorInitials(entry)}
                  </span>
                  <span className="kz-activity-feed__actor">
                    {formatTicketActivityActor(entry)}
                  </span>
                </div>
              )}

              <ActivityChangeValues entry={entry} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

const QUICK_ACTIONS = [
  {
    key: "create",
    label: "Create Ticket",
    description: "Raise a new support request",
    icon: Plus,
    color: KZ.brand,
    path: "/tasks?create=1",
  },
  {
    key: "my",
    label: "My Tickets",
    description: "View and manage your requests",
    icon: User,
    color: KZ.info,
    path: "/tasks/my",
  },
  {
    key: "overdue",
    label: "Overdue Tickets",
    description: "Review items past due date",
    icon: Calendar,
    color: KZ.warning,
    path: "/tasks/overdue",
  },
  {
    key: "all",
    label: "All Tickets",
    description: "Browse the full ticket queue",
    icon: LayoutGrid,
    color: "#7C3AED",
    path: "/tasks",
  },
];

export function KaizenQuickActions({ actions = QUICK_ACTIONS, variant = "default" }) {
  const navigate = useNavigate();

  return (
    <div className={variant === "dashboard" ? "tdash-quick-grid" : "grid grid-cols-2 gap-3"}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.key}
            type="button"
            className={variant === "dashboard" ? "tdash-quick-card" : "kz-quick-action"}
            onClick={() => navigate(action.path)}
          >
            <span
              className={variant === "dashboard" ? "tdash-quick-card__icon" : "kz-quick-action-icon"}
              style={{ backgroundColor: `${action.color}22`, color: action.color }}
            >
              <Icon size={variant === "dashboard" ? 22 : 18} />
            </span>
            <span className={variant === "dashboard" ? "tdash-quick-card__body" : "kz-quick-action-text"}>
              <span className={variant === "dashboard" ? "tdash-quick-card__title" : "kz-quick-action-label"}>
                {action.label}
              </span>
              <span className={variant === "dashboard" ? "tdash-quick-card__desc" : "kz-quick-action-desc"}>
                {action.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function DashboardPriorityBreakdown({ data = [], colors = DEFAULT_CHART_COLORS, loading = false }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return <p className="text-sm kz-text-secondary">Loading…</p>;
  }

  if (!data.length || total === 0) {
    return (
      <p className="text-sm text-center py-6 kz-text-secondary">
        No priority data available.
      </p>
    );
  }

  return (
    <div className="tdash-priority-list">
      {data.map((item, index) => {
        const pct = total ? Math.round((item.value / total) * 100) : 0;
        const color = colors[index % colors.length];
        return (
          <div key={item.name} className="tdash-priority-row">
            <span
              className="tdash-priority-chip"
              style={{ backgroundColor: `${color}22`, color }}
            >
              {item.name}
            </span>
            <span className="tdash-priority-value">
              {item.value} ({pct}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function KaizenFiltersBar({ children }) {
  return <div className="kz-filters-bar flex flex-wrap gap-2 items-center">{children}</div>;
}

export function KaizenTableCard({ children, className = "" }) {
  return (
    <div className={`kz-card kz-widget-card kz-panel-card overflow-hidden ${className}`.trim()}>
      {children}
    </div>
  );
}

export function buildStatusChartDataFromSummary(summary = {}) {
  if (summary.chart_open_count != null || summary.chart_in_progress_count != null) {
    const counts = {
      Open: Number(summary.chart_open_count ?? 0),
      "In Progress": Number(summary.chart_in_progress_count ?? 0),
      Overdue: Number(summary.overdue_count ?? 0),
      Resolved: Number(summary.resolved_count ?? 0),
      Closed: Number(summary.closed_count ?? 0),
    };
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }

  const resolved = Number(summary.resolved_count ?? 0);
  const closed = Number(summary.closed_count ?? 0);
  const overdue = Number(summary.overdue_count ?? 0);
  const inProgressRaw = Number(summary.in_progress_count ?? 0);
  const openRaw = Number(summary.open_count ?? 0);
  const overdueFromInProgress = Math.min(overdue, inProgressRaw);
  const overdueFromOpen = Math.min(Math.max(0, overdue - overdueFromInProgress), openRaw);
  const inProgress = Math.max(0, inProgressRaw - overdueFromInProgress);
  const open = Math.max(0, openRaw - overdueFromOpen);
  const total = Number(summary.total_count ?? 0);
  const otherActive = Math.max(0, total - resolved - closed - overdue - inProgress - open);

  const counts = {
    Open: open + otherActive,
    "In Progress": inProgress,
    Overdue: overdue,
    Resolved: resolved,
    Closed: closed,
  };

  return Object.entries(counts)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));
}

export function buildStatusChartData(tickets) {
  const counts = {
    Open: 0,
    "In Progress": 0,
    Overdue: 0,
    Resolved: 0,
    Closed: 0,
  };
  const today = new Date(new Date().toDateString());

  for (const ticket of tickets) {
    const status = (ticket.status || "").toUpperCase();
    const isOverdue =
      ticket.due_date &&
      new Date(String(ticket.due_date).slice(0, 10)) < today &&
      !["DONE", "CANCELLED"].includes(status);

    if (status === "DONE") counts.Resolved += 1;
    else if (status === "CANCELLED") counts.Closed += 1;
    else if (isOverdue) counts.Overdue += 1;
    else if (status === "IN_PROGRESS") counts["In Progress"] += 1;
    else counts.Open += 1;
  }

  return Object.entries(counts)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));
}

export function buildPriorityChartData(tickets) {
  const labels = {
    P1: "P1 – Critical",
    P2: "P2 – High",
    P3: "P3 – Medium",
  };
  const counts = { P1: 0, P2: 0, P3: 0 };

  for (const ticket of tickets) {
    const key = (ticket.priority || "P3").toUpperCase();
    if (counts[key] !== undefined) counts[key] += 1;
  }

  return Object.entries(counts)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({ name: labels[key] || key, value }));
}

export function enrichOwnerWorkload(byOwner) {
  if (!Array.isArray(byOwner) || byOwner.length === 0) {
    return [];
  }

  return byOwner
    .map((row) => {
      if (!row || typeof row !== "object") {
        return null;
      }

      const ownerEmail = String(row.owner_email ?? "Unassigned").trim() || "Unassigned";
      const totalCount = Number(row.total_count ?? 0);
      const openCount = Number(row.open_status_count ?? 0);
      const inProgressCount = Number(row.in_progress_count ?? 0);
      const overdueCount = Number(row.overdue_count ?? 0);

      return {
        owner_email: ownerEmail,
        open_count: Number.isFinite(openCount) ? openCount : 0,
        in_progress_count: Number.isFinite(inProgressCount) ? inProgressCount : 0,
        overdue_count: Number.isFinite(overdueCount) ? overdueCount : 0,
        total_count: Number.isFinite(totalCount) ? totalCount : 0,
      };
    })
    .filter((row) => row != null && row.total_count > 0)
    .sort((a, b) => b.total_count - a.total_count);
}

/** Soft donut palette — light theme (Open, In Progress, Overdue, Resolved, Closed) */
export const STATUS_CHART_COLORS = ["#93C5FD", "#FCD34D", "#FCA5A5", "#86EFAC", "#CBD5E1"];

/** Soft donut palette — light theme (P1, P2, P3) */
export const PRIORITY_CHART_COLORS = ["#FDA4AF", "#FDBA74", "#93C5FD"];
