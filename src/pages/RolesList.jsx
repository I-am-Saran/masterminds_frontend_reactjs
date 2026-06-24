import React, { useEffect, useState, useMemo } from 'react';
import DataTable from "react-data-table-component";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { useSession } from '../contexts/SessionContext';
import { useToast } from '../contexts/ToastContext';
import { usePermissions } from '../hooks/usePermissions';
import { get } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, FileEdit } from "lucide-react";
import ModernModal from "../components/ModernModal";
import Loader from "../components/Loader";
import { FilterSelect } from "../components/ui/Select";
import LinkifiedText from "../components/LinkifiedText";
import {
  ModernPageShell,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  ToolbarCard,
  TableCard,
  SearchField,
  modernTableStyles,
  ActionIconButton,
  StatusChip,
} from "../components/layout/ModernPageUI";

export default function RolesList() {
  const { session, loading: sessionLoading } = useSession();
  const { showToast } = useToast();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [viewRole, setViewRole] = useState(null);

  const tenantId = session?.tenant_id || '00000000-0000-0000-0000-000000000001';

  useEffect(() => {
    const fetchRoles = async () => {
      if (!session && !sessionLoading) return;
      try {
        setLoading(true);
        const json = await get(`/roles?tenant_id=${tenantId}`);
        if (json.error) throw new Error(json.error);
        setRoles(json.data || []);
      } catch (err) {
        showToast(`Failed to load roles: ${err.message}`, 'error');
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    if (!sessionLoading && session) {
      fetchRoles();
    }
  }, [session, sessionLoading, tenantId, showToast]);

  // Export functions
  const exportToCSV = () => {
    if (!filteredRoles.length) return alert("No data to export!");
    const headers = Object.keys(filteredRoles[0]);
    const rows = filteredRoles.map((r) => headers.map((h) => JSON.stringify(r[h] || "")));
    const blob = new Blob(
      [headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n")],
      { type: "text/csv" }
    );
    saveAs(blob, "roles.csv");
  };

  const exportToExcel = async () => {
    if (!filteredRoles.length) return alert("No data to export!");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Roles");
    
    // Add headers from first object keys
    if (filteredRoles.length > 0) {
      const headers = Object.keys(filteredRoles[0]);
      worksheet.addRow(headers);
      
      // Add data rows
      filteredRoles.forEach(row => {
        worksheet.addRow(headers.map(key => row[key]));
      });
    }
    
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "roles.xlsx");
  };

  // Filtered data
  const filteredRoles = useMemo(() => {
    let filtered = roles;

    // Apply search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((r) => {
        return (
          (r.role_name && r.role_name.toLowerCase().includes(searchLower)) ||
          (r.role_description && r.role_description.toLowerCase().includes(searchLower))
        );
      });
    }

    // Apply type filter
    if (filterType) {
      if (filterType === "System") {
        filtered = filtered.filter((r) => r.is_system_role === true);
      } else if (filterType === "Custom") {
        filtered = filtered.filter((r) => r.is_system_role === false);
      }
    }

    // Apply status filter
    if (filterStatus) {
      if (filterStatus === "Active") {
        filtered = filtered.filter((r) => r.is_active === true);
      } else if (filterStatus === "Inactive") {
        filtered = filtered.filter((r) => r.is_active === false);
      }
    }

    return filtered;
  }, [roles, searchText, filterType, filterStatus]);

  // Columns — fixed widths (grow: 0) so Description does not stretch across the row
  const columns = [
    {
      name: "Role Name",
      selector: (r) => r.role_name || "",
      sortable: true,
      width: "16%",
      minWidth: "140px",
      grow: 0,
      cell: (r) => (
        <button
          onClick={() => setViewRole(r)}
          className="text-purple-600 hover:underline font-medium truncate block max-w-full text-left"
          title={r.role_name || ""}
        >
          {r.role_name}
        </button>
      ),
    },
    {
      name: "Description",
      selector: (r) => r.role_description || "",
      sortable: true,
      width: "34%",
      minWidth: "200px",
      grow: 0,
      cell: (r) => (
        <span className="block truncate max-w-full" title={r.role_description || ""}>
          {r.role_description || "—"}
        </span>
      ),
    },
    {
      name: "Type",
      selector: (r) => (r.is_system_role ? "System" : "Custom"),
      sortable: true,
      width: "12%",
      minWidth: "90px",
      grow: 0,
      center: true,
      cell: (r) => {
        const type = r.is_system_role ? "System" : "Custom";
        return (
          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
            r.is_system_role ? 'bg-purple-100 text-purple-800' : 'bg-[color:var(--surface-secondary,var(--kz-surface-secondary))] text-[color:var(--text-primary,var(--kz-text-primary))] border border-[color:var(--border-color,var(--kz-border))]'
          }`}>
            {type}
          </span>
        );
      },
    },
    {
      name: "Status",
      selector: (r) => (r.is_active ? "Active" : "Inactive"),
      sortable: true,
      width: "12%",
      minWidth: "90px",
      grow: 0,
      center: true,
      cell: (r) => {
        const status = r.is_active ? "Active" : "Inactive";
        const statusColors = {
          Active: "text-green-600",
          Inactive: "text-red-600",
        };
        return (
          <span className={`font-semibold whitespace-nowrap ${statusColors[status] || "text-[color:var(--text-primary,var(--kz-text-primary))]"}`}>
            {status}
          </span>
        );
      },
    },
    {
      name: "Actions",
      width: "26%",
      minWidth: "220px",
      grow: 0,
      center: true,
      cell: (r) => (
        <div className="flex items-center justify-center gap-1 flex-nowrap shrink-0 w-full mx-auto">
          {hasPermission('roles', 'retrieve') && (
            <ActionIconButton onClick={() => setViewRole(r)} title="View" variant="view">
              <Eye size={16} />
            </ActionIconButton>
          )}
          {hasPermission('roles', 'update') && (
            <>
              <PrimaryButton
                onClick={() => navigate(`/roles/${r.id}`)}
                className="h-8 px-3 text-xs shrink-0"
              >
                Permissions
              </PrimaryButton>
              <ActionIconButton
                onClick={() => navigate(`/roles/${r.id}/edit`)}
                title="Edit"
                variant="edit"
              >
                <FileEdit size={16} />
              </ActionIconButton>
            </>
          )}
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  if (sessionLoading || loading) {
    return <Loader skeleton="table" message="Loading roles..." />;
  }

  return (
    <ModernPageShell>
      <PageHeader
        title="Roles"
        subtitle="Manage role definitions and access"
        action={
          hasPermission('roles', 'create') ? (
            <PrimaryButton onClick={() => navigate("/roles/new")} icon={Plus}>
              Create Role
            </PrimaryButton>
          ) : null
        }
      />

      <ToolbarCard>
        <div className="flex flex-wrap items-center gap-3">
          <SearchField
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search roles..."
          />
          <FilterSelect
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            placeholder="All Types"
            options={[
              { value: "", label: "All Types" },
              { value: "System", label: "System" },
              { value: "Custom", label: "Custom" },
            ]}
          />
          <FilterSelect
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            placeholder="All Statuses"
            options={[
              { value: "", label: "All Statuses" },
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
            ]}
          />
          {(filterType || filterStatus || searchText) && (
            <SecondaryButton
              onClick={() => {
                setFilterType("");
                setFilterStatus("");
                setSearchText("");
              }}
            >
              Clear Filters
            </SecondaryButton>
          )}
        </div>
      </ToolbarCard>

      <TableCard className="kz-roles-table-wrap">
        <DataTable
          columns={columns}
          data={filteredRoles}
          pagination
          highlightOnHover
          striped
          dense
          responsive={false}
          sortIcon={<span>⇅</span>}
          customStyles={modernTableStyles}
        />
      </TableCard>

      {/* View Modal */}
      {viewRole && (
        <ModernModal
          open={!!viewRole}
          onClose={() => setViewRole(null)}
          title="Role Details"
          maxWidth="max-w-3xl"
          footer={
            <div className="flex justify-end gap-2">
              {hasPermission('roles', 'update') && (
                <>
                  <PrimaryButton
                    onClick={() => {
                      navigate(`/roles/${viewRole.id}`);
                      setViewRole(null);
                    }}
                  >
                    Manage Permissions
                  </PrimaryButton>
                  <PrimaryButton
                    onClick={() => {
                      navigate(`/roles/${viewRole.id}/edit`);
                      setViewRole(null);
                    }}
                  >
                    Edit
                  </PrimaryButton>
                </>
              )}
              <SecondaryButton onClick={() => setViewRole(null)}>
                Close
              </SecondaryButton>
            </div>
          }
        >
          <div className="bug-detail-meta-grid">
            <div className="bug-detail-meta">
              <div className="min-w-0">
                <p className="bug-detail-meta-label">Role name</p>
                <p className="bug-detail-meta-value">{viewRole.role_name || "—"}</p>
              </div>
            </div>
            <div className="bug-detail-meta">
              <div className="min-w-0">
                <p className="bug-detail-meta-label">Type</p>
                <p className="bug-detail-meta-value mt-1">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      viewRole.is_system_role
                        ? "bg-violet-50 text-violet-800 border-violet-200"
                        : "bg-[color:var(--surface-secondary,var(--kz-surface-secondary))] text-[color:var(--text-primary,var(--kz-text-primary))] border-[color:var(--border-color,var(--kz-border))]"
                    }`}
                  >
                    {viewRole.is_system_role ? "System" : "Custom"}
                  </span>
                </p>
              </div>
            </div>
            <div className="bug-detail-meta">
              <div className="min-w-0">
                <p className="bug-detail-meta-label">Status</p>
                <p className="bug-detail-meta-value mt-1">
                  <StatusChip status={viewRole.is_active ? "Active" : "Inactive"} />
                </p>
              </div>
            </div>
            <div className="bug-detail-meta md:col-span-2 lg:col-span-3">
              <div className="min-w-0">
                <p className="bug-detail-meta-label">Description</p>
                <p className="bug-detail-meta-value whitespace-pre-wrap">
                  <LinkifiedText text={viewRole.role_description || "—"} />
                </p>
              </div>
            </div>
            {viewRole.created_at && (
              <div className="bug-detail-meta">
                <div className="min-w-0">
                  <p className="bug-detail-meta-label">Created at</p>
                  <p className="bug-detail-meta-value text-[13px]">
                    {String(viewRole.created_at).replace("T", " ").substring(0, 19)}
                  </p>
                </div>
              </div>
            )}
            {viewRole.updated_at && (
              <div className="bug-detail-meta">
                <div className="min-w-0">
                  <p className="bug-detail-meta-label">Updated at</p>
                  <p className="bug-detail-meta-value text-[13px]">
                    {String(viewRole.updated_at).replace("T", " ").substring(0, 19)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ModernModal>
      )}
    </ModernPageShell>
  );
}
