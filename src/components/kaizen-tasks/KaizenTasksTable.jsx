import React, { useMemo } from "react";
import DataTable from "react-data-table-component";
import { AlertTriangle, Ticket, UserRound } from "lucide-react";
import { SkeletonTable } from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";
import { KaizenPriorityChip, KaizenStatusChip, KaizenWorkflowStatusChip } from "./KaizenChips";
import { formatKaizenTicketId, TICKET_ID_TABLE_COLUMN_WIDTH } from "../../utils/kaizenTicketId";

const CELL_PADDING = "0.5rem 0.75rem";

function ClickableCell({ row, onRowClick, children }) {
  const handleOpen = (e) => {
    e?.stopPropagation?.();
    if (onRowClick) onRowClick(row);
  };

  return (
    <div
      className="w-full min-h-[2.5rem] flex items-center cursor-pointer"
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpen();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

/** Fixed-width column — grow: 0 keeps header/body flex sizing identical. */
function fixedColumn(widthPx, column) {
  const width = `${widthPx}px`;
  return { ...column, width, minWidth: width, maxWidth: width, grow: 0 };
}

function buildTableStyles(minWidth) {
  return {
  table: {
    className: "kaizen-tickets-rdt",
    style: {
      width: "100%",
      minWidth,
    },
  },
  tableWrapper: {
    style: { display: "block" },
  },
  headRow: {
    style: {
      minHeight: "44px",
      width: "100%",
      minWidth,
    },
  },
  headCells: {
    style: {
      fontSize: "12px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      color: "var(--kz-table-header-text)",
      backgroundColor: "var(--kz-table-header-bg)",
      padding: CELL_PADDING,
    },
  },
  rows: {
    style: {
      minHeight: "48px",
      width: "100%",
      minWidth,
      fontSize: "13px",
      cursor: "pointer",
      backgroundColor: "var(--kz-table-row-bg)",
      color: "var(--kz-table-cell-text)",
      "&:hover": { backgroundColor: "var(--kz-table-row-hover-bg)" },
    },
  },
  cells: {
    style: {
      padding: CELL_PADDING,
      color: "var(--kz-table-cell-text)",
    },
  },
};
}

const TABLE_MIN_WIDTH = {
  default: "1660px",
  myTickets: "1180px",
};

export default function KaizenTasksTable({
  rows,
  loading,
  total,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  onRowClick,
  paginationServer = true,
  loadingMessage = "Loading tickets...",
  columnPreset = "default",
}) {
  const today = new Date(new Date().toDateString());

  const getDueDate = (row) => {
    if (!row?.due_date) return null;
    const d = new Date(String(row.due_date).slice(0, 10));
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const wrapCell = (render) => (row) => (
    <ClickableCell row={row} onRowClick={onRowClick}>
      {render(row)}
    </ClickableCell>
  );

  const allColumns = useMemo(
    () => [
      fixedColumn(TICKET_ID_TABLE_COLUMN_WIDTH, {
        id: "ticket_id",
        name: "Ticket ID",
        sortable: true,
        selector: (r) => formatKaizenTicketId(r?.id),
        cell: wrapCell((r) => (
          <span className="kz-ticket-id inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
            <Ticket size={13} className="shrink-0" aria-hidden="true" />
            {formatKaizenTicketId(r?.id)}
          </span>
        )),
      }),
      {
        name: "Title",
        selector: (r) => r.title,
        sortable: true,
        grow: 1,
        minWidth: "220px",
        cell: wrapCell((r) => (
          <span className="font-medium truncate block w-full kz-text-primary">
            {r.title}
          </span>
        )),
      },
      fixedColumn(190, {
        name: "Workflow Owner",
        selector: (r) => r.owner_email,
        cell: wrapCell((r) => (
          <span className="inline-flex items-center gap-1 text-neutral-600 truncate w-full" title={r.owner_email || ""}>
            <UserRound size={12} className="shrink-0" />
            {r.owner_email || "Unassigned"}
          </span>
        )),
      }),
      fixedColumn(130, {
        name: "Team",
        selector: () => "—",
        cell: wrapCell(() => <span className="text-neutral-500 text-xs">—</span>),
      }),
      fixedColumn(120, {
        name: "Status",
        cell: wrapCell((r) => <KaizenStatusChip status={r.status} />),
      }),
      fixedColumn(210, {
        id: "workflow_status",
        name: "Workflow Status",
        cell: wrapCell((r) => <KaizenWorkflowStatusChip task={r} />),
      }),
      fixedColumn(110, {
        name: "Priority",
        cell: wrapCell((r) => <KaizenPriorityChip priority={r.priority} />),
      }),
      fixedColumn(100, {
        name: "Due Date",
        selector: (r) => r.due_date,
        cell: wrapCell((r) => {
          const due = getDueDate(r);
          const overdue = due && r.status !== "DONE" && r.status !== "CANCELLED" && due < today;
          return (
            <span className={overdue ? "text-red-600 font-semibold text-xs" : "text-xs text-neutral-600"}>
              {due ? due.toLocaleDateString() : "—"}
            </span>
          );
        }),
      }),
      fixedColumn(80, {
        name: "Age",
        cell: wrapCell((r) => (
          <span className="text-xs text-neutral-500">
            {r.ageing_days != null ? `${r.ageing_days} days` : "—"}
          </span>
        )),
      }),
      fixedColumn(180, {
        name: "Created By",
        selector: (r) => r.created_by_email || r.owner_email || "",
        cell: wrapCell((r) => (
          <span className="text-neutral-600 truncate block w-full">
            {r.created_by_email || r.owner_email || "—"}
          </span>
        )),
      }),
      fixedColumn(140, {
        name: "Meeting Reference",
        cell: wrapCell((r) => (
          <span className="text-xs text-neutral-500 truncate block w-full">
            {r.meeting_title || (r.meeting_id ? `#${r.meeting_id}` : "—")}
          </span>
        )),
      }),
      fixedColumn(40, {
        name: "",
        cell: wrapCell((r) =>
          r.is_blocked || r.status === "BLOCKED" ? (
            <AlertTriangle size={14} className="text-red-500" title="Blocked" />
          ) : null
        ),
      }),
    ],
    [onRowClick, today]
  );

  const columns = useMemo(() => {
    if (columnPreset !== "myTickets") {
      return allColumns;
    }
    const hidden = new Set(["Team", "Created By", "Meeting Reference", ""]);
    return allColumns.filter((col) => !hidden.has(col.name));
  }, [allColumns, columnPreset]);

  const tableStyles = useMemo(
    () => buildTableStyles(TABLE_MIN_WIDTH[columnPreset] || TABLE_MIN_WIDTH.default),
    [columnPreset]
  );

  return (
    <div className="kaizen-tickets-table-wrap">
      <DataTable
        columns={columns}
        data={rows}
        progressPending={loading}
        pagination
        paginationServer={paginationServer}
        paginationTotalRows={total}
        paginationDefaultPage={page}
        paginationPerPage={perPage}
        onChangePage={onPageChange}
        onChangeRowsPerPage={onPerPageChange}
        paginationRowsPerPageOptions={[20, 50, 100]}
        onRowClicked={onRowClick}
        progressComponent={<SkeletonTable rows={8} cols={6} />}
        highlightOnHover
        pointerOnHover
        dense
        striped
        responsive={false}
        customStyles={tableStyles}
        noDataComponent={
          <EmptyState
            icon={Ticket}
            title="No tickets found"
            description="No tickets available. Create your first ticket."
          />
        }
      />
    </div>
  );
}
