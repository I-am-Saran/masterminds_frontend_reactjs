import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { Plus, Search, Eye } from "lucide-react";
import { listMeetings, createMeeting } from "../../services/momApi";
import { useToast } from "../../contexts/ToastContext";
import { usePermissions } from "../../hooks/usePermissions";
import { THEME_COLORS } from "../../constants/colors";
import { PrimaryButton } from "../../components/layout/ModernPageUI";
import { StatusChip } from "../../components/mom/MomChips";
import MeetingFormModal from "../../components/mom/MeetingFormModal";
import Loader from "../../components/Loader";
import { FilterSelect } from "../../components/ui/Select";

const RDT_CELL_PADDING = "0.5rem 0.75rem";

const tableStyles = {
  tableWrapper: { style: { overflowX: "auto" }, className: "kz-rdt-wrap" },
  headCells: {
    style: {
      padding: RDT_CELL_PADDING,
      fontSize: "11px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      color: "#64748b",
      backgroundColor: "#f8fafc",
      position: "sticky",
      top: 0,
    },
  },
  cells: {
    style: {
      padding: RDT_CELL_PADDING,
    },
  },
  rows: {
    style: {
      minHeight: "44px",
      fontSize: "13px",
      cursor: "pointer",
      "&:hover": { backgroundColor: "rgba(45, 90, 143, 0.04)" },
    },
  },
};

export default function MomMeetingsPage() {
  const navigate = useNavigate();

  const openMeetingView = (id) => {
    navigate(`/mom/${encodeURIComponent(id)}`);
  };
  const { showToast } = useToast();
  const { hasPermission } = usePermissions();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [sortBy] = useState("meeting_date");
  const [sortDesc] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listMeetings({
        page,
        limit: perPage,
        search: search || undefined,
        status: statusFilter || undefined,
        sort_by: sortBy,
        sort_desc: sortDesc,
      });
      if (res.success) {
        setMeetings(res.data || []);
        setTotal(res.meta?.total || 0);
      }
    } catch {
      showToast("Failed to load meetings", "error");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, statusFilter, sortBy, sortDesc, showToast]);

  useEffect(() => {
    const t = setTimeout(fetchMeetings, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchMeetings, search]);

  const handleCreate = async (payload) => {
    setSaving(true);
    try {
      const res = await createMeeting(payload);
      if (res.success) {
        showToast("Meeting created", "success");
        setModalOpen(false);
        openMeetingView(res.data.id);
      }
    } catch {
      showToast("Failed to create meeting", "error");
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "Meeting Title",
        selector: (r) => r.title,
        sortable: true,
        grow: 2,
        cell: (r) => (
          <span className="font-medium" style={{ color: THEME_COLORS.deepBlue }}>
            {r.title}
          </span>
        ),
      },
      {
        name: "Date",
        selector: (r) => r.meeting_date,
        sortable: true,
        width: "110px",
        cell: (r) => (r.meeting_date ? new Date(r.meeting_date).toLocaleDateString() : "—"),
      },
      {
        name: "Organizer",
        selector: (r) => r.organizer,
        sortable: true,
        width: "140px",
        cell: (r) => r.organizer || "—",
      },
      {
        name: "Pending Actions",
        selector: (r) => r.pending_actions,
        width: "120px",
        center: true,
        cell: (r) => (
          <span
            className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-semibold"
            style={{
              background: r.pending_actions > 0 ? "rgba(184, 148, 90, 0.15)" : "rgba(45, 90, 143, 0.08)",
              color: r.pending_actions > 0 ? THEME_COLORS.gold : THEME_COLORS.deepBlue,
            }}
          >
            {r.pending_actions ?? 0}
          </span>
        ),
      },
      {
        name: "Status",
        selector: (r) => r.status,
        width: "100px",
        cell: (r) => <StatusChip status={r.status} />,
      },
      {
        name: "Last Updated",
        selector: (r) => r.updated_at,
        width: "130px",
        cell: (r) =>
          r.updated_at ? new Date(r.updated_at).toLocaleDateString() : "—",
      },
      {
        name: "",
        width: "52px",
        center: true,
        cell: (r) => (
          <button
            type="button"
            title="View meeting"
            onClick={(e) => {
              e.stopPropagation();
              openMeetingView(r.id);
            }}
            className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
            style={{ color: THEME_COLORS.mediumTeal }}
          >
            <Eye size={16} />
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search meetings..."
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <FilterSelect
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          placeholder="All statuses"
          options={[
            { value: "", label: "All statuses" },
            { value: "OPEN", label: "Open" },
            { value: "CLOSED", label: "Closed" },
          ]}
        />
        {hasPermission("mom", "create") && (
          <PrimaryButton type="button" onClick={() => setModalOpen(true)} icon={Plus} className="ml-auto">
            New Meeting
          </PrimaryButton>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 overflow-hidden bg-white">
        <DataTable
          columns={columns}
          data={meetings}
          progressPending={loading}
          progressComponent={<Loader message="Loading meetings..." fullScreen={false} />}
          pagination
          paginationServer
          paginationTotalRows={total}
          paginationPerPage={perPage}
          paginationDefaultPage={page}
          onChangePage={setPage}
          onChangeRowsPerPage={(newPerPage) => { setPerPage(newPerPage); setPage(1); }}
          onRowClicked={(row) => openMeetingView(row.id)}
          highlightOnHover
          pointerOnHover
          dense
          responsive={false}
          customStyles={tableStyles}
          noDataComponent={
            <p className="py-8 text-sm text-neutral-400">No meetings found</p>
          }
        />
      </div>

      <MeetingFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        saving={saving}
      />
    </div>
  );
}
