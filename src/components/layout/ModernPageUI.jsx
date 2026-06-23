import React from "react";
import DataTable from "react-data-table-component";
import { THEME_COLORS } from "../../constants/colors";
import { useCountUp } from "../../hooks/useCountUp";
import { kpiGlowAt } from "../../themes/dashboardKpi";

const RDT_CELL_PADDING = "0.5rem 0.75rem";

/** Fixed-width column — grow: 0 keeps header/body flex sizing identical. */
export function fixedRdtColumn(widthPx, column = {}) {
  const width = `${widthPx}px`;
  return { ...column, width, minWidth: width, maxWidth: width, grow: 0 };
}

/** Flexible column with a minimum width so header/body share space consistently. */
export function flexRdtColumn(minWidthPx, column = {}) {
  return {
    ...column,
    minWidth: `${minWidthPx}px`,
    grow: column.grow ?? 1,
  };
}

export const CARD_SHADOW = "kz-card shadow-[var(--kz-card-shadow)]";

export function ModernPageShell({ children, className = "" }) {
  return (
    <div className={`kz-page-shell app-page-shell min-h-full pb-10 w-full min-w-0 max-w-full box-border ${className}`}>
      <div className="w-full max-w-[1440px] min-w-0 mx-auto px-5 sm:px-6 lg:px-8 py-6 space-y-6 box-border">
        {children}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action, badge }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="kz-page-title">{title}</h1>
          {badge}
        </div>
        {subtitle ? (
          <p className="text-[0.9375rem] text-[color:var(--kz-text-secondary)] mt-2 leading-snug">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  icon: Icon,
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`kz-btn-primary inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`kz-btn-secondary inline-flex items-center gap-2 h-9 px-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function SearchField({ value, onChange, placeholder = "Search…", className = "" }) {
  return (
    <div className={`relative flex-1 min-w-[200px] max-w-md ${className}`}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-3 text-sm border border-[color:var(--kz-border)] rounded-lg bg-card text-[color:var(--kz-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
      />
    </div>
  );
}

export function ToolbarCard({ children, className = "" }) {
  return <div className={`${CARD_SHADOW} p-3 sm:p-4 ${className}`}>{children}</div>;
}

export function TableCard({ children, className = "" }) {
  return (
    <div className={`${CARD_SHADOW} min-w-0 w-full max-w-full overflow-x-auto overflow-y-visible ${className}`}>
      {children}
    </div>
  );
}

export function ActionIconButton({ onClick, title, children, variant = "view" }) {
  const styles = {
    view: "text-primary hover:bg-[color:var(--kz-active-bg)]",
    edit: "text-[color:var(--kz-primary-light)] hover:bg-[color:var(--kz-hover-bg)]",
    delete: "text-red-600 hover:bg-red-50",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center p-1.5 rounded-lg transition-colors ${styles[variant] || styles.view}`}
    >
      {children}
    </button>
  );
}

export function getKpiCardStyle(_glow, hovered = false) {
  return {
    background: "var(--kz-surface)",
    boxShadow: hovered
      ? "0 2px 8px rgba(44, 44, 44, 0.08)"
      : "0 1px 3px rgba(44, 44, 44, 0.06)",
    border: `1px solid ${hovered ? "var(--kz-border-strong)" : "var(--kz-border)"}`,
  };
}

export function glowForIndex(index) {
  return kpiGlowAt(index);
}

export function KpiCard({
  label,
  value,
  glow,
  accent,
  icon: Icon,
  active = false,
  onClick,
  compact = false,
  sublabel,
}) {
  const resolvedGlow = glow || THEME_COLORS.deepBlue;
  const resolvedAccent = accent || THEME_COLORS.deepBlue;
  const displayValue = useCountUp(value ?? 0);
  const clickable = Boolean(onClick);
  const style = getKpiCardStyle(resolvedGlow, active);

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
      className={`group rounded-xl transition-all duration-300 text-left w-full ${
        compact ? "px-3 py-3" : "px-4 py-4"
      } ${clickable ? "cursor-pointer" : ""} ${active ? "ring-2 ring-primary/30" : ""}`}
      style={style}
      onMouseEnter={(e) => {
        if (!clickable) return;
        Object.assign(e.currentTarget.style, getKpiCardStyle(resolvedGlow, true));
      }}
      onMouseLeave={(e) => {
        if (!clickable) return;
        Object.assign(e.currentTarget.style, getKpiCardStyle(resolvedGlow, active));
      }}
    >
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <p
          className="text-[11px] font-bold uppercase tracking-wide leading-snug break-words flex-1 min-w-0"
          style={{ color: resolvedAccent }}
        >
          {label}
        </p>
        {Icon ? (
          <span
            className="rounded-full shrink-0 p-1.5"
            style={{
              backgroundColor: `${resolvedAccent}18`,
              color: resolvedAccent,
            }}
          >
            <Icon size={12} strokeWidth={2} />
          </span>
        ) : null}
      </div>
      <p
        className={`font-semibold leading-none tracking-tight tabular-nums text-[color:var(--kz-text-primary)] ${
          compact ? "text-2xl" : "text-[32px]"
        }`}
      >
        {displayValue}
      </p>
      {sublabel ? (
        <p className="text-[11px] mt-1.5 text-[color:var(--kz-text-secondary)] leading-snug">{sublabel}</p>
      ) : null}
    </article>
  );
}

export function SectionCard({ title, subtitle, children, className = "" }) {
  return (
    <section className={`${CARD_SHADOW} min-w-0 w-full max-w-full overflow-visible ${className}`}>
      <div className="px-4 pt-4 pb-3 border-b border-[color:var(--kz-border)]">
        <h2 className="text-[15px] font-semibold tracking-tight text-[color:var(--kz-text-primary)]">{title}</h2>
        {subtitle ? (
          <p className="text-[11px] text-[color:var(--kz-text-secondary)] mt-0.5 leading-snug">{subtitle}</p>
        ) : null}
      </div>
      <div className="p-4 min-w-0">{children}</div>
    </section>
  );
}

const STATUS_STYLES = {
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  done: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  closed: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  "in progress": { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  open: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  pending: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  overdue: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  blocked: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  active: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  draft: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
  inactive: { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200" },
};

export function StatusChip({ status }) {
  if (!status || status === "—") {
    return <span className="text-slate-300 text-xs">—</span>;
  }
  const key = String(status).toLowerCase();
  const style =
    STATUS_STYLES[key] ||
    Object.entries(STATUS_STYLES).find(([k]) => key.includes(k))?.[1] || {
      bg: "kz-chip-default",
      text: "",
      border: "",
    };

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold truncate ${style.bg} ${style.text} ${style.border}`}
      title={status}
    >
      {status}
    </span>
  );
}

const PRIORITY_STYLES = {
  critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  blocker: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  high: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
  medium: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  low: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
};

export function PriorityChip({ priority }) {
  if (!priority || priority === "—") {
    return <span className="text-slate-300 text-xs">—</span>;
  }
  const key = String(priority).toLowerCase();
  const style = PRIORITY_STYLES[key] || {
    bg: "kz-chip-default",
    text: "",
    border: "",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style.bg} ${style.text} ${style.border}`}
    >
      {priority}
    </span>
  );
}

export const modernTableStyles = {
  table: { style: { backgroundColor: "transparent" } },
  tableWrapper: { style: { overflowX: "auto" }, className: "kz-rdt-wrap" },
  headRow: {
    style: {
      minHeight: "44px",
      borderBottom: "1px solid var(--kz-border)",
      backgroundColor: "var(--kz-table-header-bg)",
    },
    className: "kz-rdt-head",
  },
  headCells: {
    style: {
      padding: RDT_CELL_PADDING,
      fontSize: "10px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: "var(--kz-table-header-text)",
    },
  },
  rows: {
    style: {
      minHeight: "48px",
      borderBottom: "1px solid var(--kz-border)",
      fontSize: "13px",
      backgroundColor: "var(--kz-table-row-bg, transparent)",
      color: "var(--kz-table-cell-text, var(--kz-text-primary))",
    },
    highlightOnHoverStyle: {
      backgroundColor: "var(--kz-table-row-hover-bg, var(--kz-hover-bg))",
      outline: "none",
    },
    stripedStyle: { backgroundColor: "var(--kz-table-row-bg, var(--kz-tint-03))" },
    className: "kz-rdt-row",
  },
  cells: {
    style: {
      padding: RDT_CELL_PADDING,
      color: "var(--kz-table-cell-text, var(--kz-text-primary))",
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid var(--kz-border)",
      fontSize: "13px",
      color: "var(--kz-text-secondary)",
      minHeight: "52px",
    },
    className: "kz-rdt-pagination",
    pageButtonsStyle: {
      borderRadius: "8px",
      height: "32px",
      width: "32px",
      margin: "2px",
      color: "var(--kz-text-secondary)",
    },
  },
};

export const modernTaskTableStyles = modernTableStyles;

export function ModernDataTable({ customStyles, responsive = false, ...props }) {
  return (
    <DataTable
      responsive={responsive}
      customStyles={customStyles ?? modernTableStyles}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className={`${CARD_SHADOW} p-4 space-y-3`}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-9 rounded-lg bg-[color:var(--kz-hover-bg)] animate-pulse" />
      ))}
    </div>
  );
}

export const TasksTableSkeleton = TableSkeleton;

export const adminLabelClass =
  "text-[11px] font-semibold uppercase tracking-wide text-[color:var(--kz-text-secondary)] mb-1.5 block";
export const adminInputClass =
  "w-full h-9 px-3 text-sm border border-[color:var(--kz-border)] rounded-lg bg-card text-[color:var(--kz-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 disabled:bg-slate-50 disabled:text-slate-500";
export const adminSelectClass = `${adminInputClass} appearance-none pr-9`;
export const adminTextareaClass =
  "w-full min-h-[100px] px-3 py-2.5 text-sm border border-[color:var(--kz-border)] rounded-lg bg-card text-[color:var(--kz-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40";

export function AdminEmptyState({ icon: Icon, title = "Nothing here yet", description }) {
  return (
    <div className="admin-empty-state">
      {Icon ? (
        <span className="admin-empty-state-icon" aria-hidden>
          <Icon size={20} strokeWidth={1.75} />
        </span>
      ) : null}
      <p className="text-sm font-medium text-[color:var(--kz-text-primary)]">{title}</p>
      {description ? <p className="text-xs text-[color:var(--kz-text-secondary)] mt-1">{description}</p> : null}
    </div>
  );
}

export function AdminListRow({ title, description, children, className = "" }) {
  return (
    <div className={`admin-list-row ${className}`.trim()}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[color:var(--kz-text-primary)] break-words">{title}</p>
        {description ? (
          <p className="text-xs text-[color:var(--kz-text-secondary)] mt-0.5 break-words">{description}</p>
        ) : null}
      </div>
      {children ? <div className="shrink-0 flex items-center gap-2">{children}</div> : null}
    </div>
  );
}

export function AdminFormLabel({ children, required }) {
  return (
    <label className={adminLabelClass}>
      {children}
      {required ? <span className="text-red-500 normal-case tracking-normal"> *</span> : null}
    </label>
  );
}

export function OverviewSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`${CARD_SHADOW} h-24 animate-pulse bg-[color:var(--kz-hover-bg)]`} />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className={`${CARD_SHADOW} xl:col-span-1 h-48 animate-pulse bg-[color:var(--kz-hover-bg)]`} />
        <div className={`${CARD_SHADOW} xl:col-span-2 h-48 animate-pulse bg-[color:var(--kz-hover-bg)]`} />
      </div>
    </div>
  );
}
