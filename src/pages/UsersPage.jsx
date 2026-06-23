// src/pages/UsersPage.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import {
  ModernPageShell,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  ToolbarCard,
  TableCard,
  SectionCard,
  SearchField,
  modernTableStyles,
  ActionIconButton,
} from "../components/layout/ModernPageUI";
import Toast from "../components/Toast";
import FormField from "../components/FormField";
import { FilterSelect } from "../components/ui/Select";
import { useNavigate } from "react-router-dom";
import { post, get, put } from "../services/api.js";
import { usePermissions } from "../hooks/usePermissions";
import { useToast } from "../contexts/ToastContext";
import { useSession } from "../contexts/SessionContext";
import {
  Plus,
  Eye,
  FileEdit,
  Key,
  User,
  Mail,
  Building2,
  Shield,
  LogIn,
  Clock,
  Link2,
  Hash,
} from "lucide-react";
import ModernModal from "../components/ModernModal";
import Loader from "../components/Loader";
import UserAutocomplete from "../components/UserAutocomplete";

function formatDateTime(value) {
  if (!value) return "—";
  return String(value).replace("T", " ").substring(0, 19);
}

function UserDetailSection({ title, subtitle, icon: Icon, children }) {
  return (
    <section className="bug-detail-section">
      <div className="bug-detail-section-header">
        <div className="flex items-start gap-3 min-w-0">
          {Icon ? (
            <span className="bug-detail-section-icon" aria-hidden>
              <Icon size={17} strokeWidth={2} />
            </span>
          ) : null}
          <div className="min-w-0">
            <h3 className="bug-detail-section-title">{title}</h3>
            {subtitle ? <p className="bug-detail-section-subtitle">{subtitle}</p> : null}
          </div>
        </div>
      </div>
      <div className="bug-detail-section-body">{children}</div>
    </section>
  );
}

function UserDetailMeta({ label, value, icon: Icon, mono = false }) {
  const display = value ?? "—";
  return (
    <div className="bug-detail-meta">
      {Icon ? <Icon size={15} className="bug-detail-meta-icon shrink-0" strokeWidth={2} /> : null}
      <div className="min-w-0 flex-1">
        <p className="bug-detail-meta-label">{label}</p>
        <p className={`bug-detail-meta-value ${mono ? "font-mono text-[13px]" : ""}`}>{display}</p>
      </div>
    </div>
  );
}

function UserStatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-red-500"}`}
        aria-hidden
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function UserDetailsModalBody({ viewUser, formatUserId }) {
  const displayName =
    viewUser.name || viewUser.full_name || viewUser.email?.split("@")[0] || "—";
  const initial = (displayName.charAt(0) || "?").toUpperCase();
  const profileUrl = viewUser.profile_pic_url;

  return (
    <div className="user-detail-modal space-y-4">
      <div className="user-detail-modal-hero">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <span className="user-detail-modal-avatar" aria-hidden>
            {initial}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
              User account
            </p>
            <h3 className="text-lg font-semibold text-slate-900 truncate">{displayName}</h3>
            <p className="text-sm text-slate-600 truncate">{viewUser.email || "—"}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="bug-detail-id">{formatUserId(viewUser) || "—"}</span>
          <UserStatusBadge active={viewUser.is_active !== false} />
        </div>
      </div>

      <UserDetailSection title="Profile & access" subtitle="Identity and permissions" icon={User}>
        <div className="bug-detail-meta-grid cols-3">
          <UserDetailMeta label="Name" value={displayName} icon={User} />
          <UserDetailMeta label="Email" value={viewUser.email} icon={Mail} />
          <UserDetailMeta label="Role" value={viewUser.role} icon={Shield} />
          <UserDetailMeta
            label="Default role ID"
            value={viewUser.default_role_id}
            icon={Hash}
            mono
          />
        </div>
      </UserDetailSection>

      <UserDetailSection title="Organization" subtitle="Department assignment" icon={Building2}>
        <div className="bug-detail-meta-grid">
          <UserDetailMeta label="Department" value={viewUser.department} icon={Building2} />
          <UserDetailMeta
            label="Department owner"
            value={viewUser.department_owner}
            icon={Mail}
          />
        </div>
      </UserDetailSection>

      <UserDetailSection
        title="Authentication"
        subtitle="Single sign-on configuration"
        icon={Key}
      >
        <div className="bug-detail-meta-grid">
          <UserDetailMeta
            label="SSO provider"
            value={viewUser.sso_provider || "manual"}
            icon={Key}
          />
          <UserDetailMeta label="SSO user ID" value={viewUser.sso_user_id} icon={Hash} mono />
        </div>
      </UserDetailSection>

      <UserDetailSection title="Activity" subtitle="Login history and profile" icon={LogIn}>
        <div className="bug-detail-meta-grid cols-3">
          <UserDetailMeta
            label="First login"
            value={formatDateTime(viewUser.first_login)}
            icon={Clock}
          />
          <UserDetailMeta
            label="Last login"
            value={formatDateTime(viewUser.last_login)}
            icon={Clock}
          />
          <UserDetailMeta
            label="Login count"
            value={viewUser.login_count != null ? String(viewUser.login_count) : "—"}
            icon={LogIn}
          />
          <div className="bug-detail-meta lg:col-span-3">
            <Link2 size={15} className="bug-detail-meta-icon shrink-0" strokeWidth={2} />
            <div className="min-w-0 flex-1">
              <p className="bug-detail-meta-label">Profile picture URL</p>
              {profileUrl ? (
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bug-detail-meta-value text-[#2d5a8f] hover:underline break-all"
                >
                  {profileUrl}
                </a>
              ) : (
                <p className="bug-detail-meta-value">—</p>
              )}
            </div>
          </div>
        </div>
      </UserDetailSection>

      {(viewUser.created_at || viewUser.updated_at) && (
        <div className="bug-detail-timestamps px-1">
          {viewUser.created_at && (
            <span className="bug-detail-timestamp">
              <Clock size={12} aria-hidden />
              Created {formatDateTime(viewUser.created_at)}
            </span>
          )}
          {viewUser.updated_at && (
            <span className="bug-detail-timestamp">
              <Clock size={12} aria-hidden />
              Updated {formatDateTime(viewUser.updated_at)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function mapUserFromApi(u) {
  const t = u?.created_at || u?.updated_at || null;
  const d = t ? new Date(t) : new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return {
    id: u.id || u.email,
    name: u.name ?? u.full_name ?? (u.email ? u.email.split("@")[0] : ""),
    role: u.roles ?? u.role ?? "Viewer",
    email: u.email ?? "",
    department: u.department ?? "",
    department_owner: u.department_owner ?? "",
    is_active: u.is_active ?? true,
    created_at: u.created_at,
    updated_at: u.updated_at,
    display_id: `AB${mm}${yyyy}`,
  };
}

function extractApiErrorMessage(err, fallback) {
  const detail = err?.data?.detail ?? err?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || item?.message || String(item)).join(", ");
  }
  if (detail && typeof detail === "object") {
    return detail.message || detail.error || fallback;
  }
  return err?.message || fallback;
}

export default function UsersPage() {
  const navigate = useNavigate();
  const { hasPermission, permissions, loading: permissionsLoading, userRoles } = usePermissions();
  const { showToast } = useToast();
  const { session, loading: sessionLoading } = useSession();
  const tenantId =
    session?.tenant_id || session?.user?.tenant_id || "00000000-0000-0000-0000-000000000001";

  // Check if user is super admin
  const isSuperAdmin = useMemo(() => {
    if (!userRoles || userRoles.length === 0) return false;
    return userRoles.some((userRole) => {
      const role = userRole.roles || userRole;
      const name = role.role_name || role.roleName || role.name || "";
      const superAdminVariants = ["super admin", "superadmin", "super_admin", "global super admin"];
      return superAdminVariants.includes(String(name).toLowerCase());
    });
  }, [userRoles]);

  const formatUserId = (row) => {
    const t = row?.created_at || row?.updated_at || null;
    const d = t ? new Date(t) : new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `AB${mm}${yyyy}`;
  };

  // ============================
  // View Modes
  // ============================
  const [view, setView] = useState("list"); // list | create | invite

  // ============================
  // Shared States
  // ============================
  const [toast, setToast] = useState({ type: "", message: "" });

  // ============================
  // List View
  // ============================
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [perPage, setPerPage] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('usersPerPage');
    return saved ? Number(saved) : 20;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [passwordChangeUser, setPasswordChangeUser] = useState(null);
  const [fetchedRoles, setFetchedRoles] = useState([
    { label: "Viewer", value: "Viewer" },
    { label: "Contributor", value: "Contributor" },
    { label: "Admin", value: "Admin" },
    { label: "Super Admin", value: "Super Admin" },
  ]);

  // ============================
  // Fetch roles from backend
  // ============================
  useEffect(() => {
    const loadRoles = async () => {
      if (sessionLoading) return;

      const tenantId = session?.tenant_id || (session?.user?.tenant_id) || "00000000-0000-0000-0000-000000000001";

      try {
        const json = await get(`/roles?tenant_id=${tenantId}`);
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const mappedRoles = json.data.map(r => ({
            label: r.role_name,
            value: r.role_name
          }));

          // Ensure "Super Admin" is included if it's not in the fetched list but current user is one
          setFetchedRoles(mappedRoles);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
      }
    };

    loadRoles();
  }, [sessionLoading, session]);

  // ============================
  // Fetch users from backend
  // ============================
  useEffect(() => {
    const loadUsers = async () => {
      // Wait for session to load, but don't require session to be present
      if (sessionLoading) return;

      try {
        setLoading(true);
        const json = await get(`/users`);

        if (json.error) {
          console.warn("/users fetch failed", json.error);
          showToast(`Failed to fetch users: ${json.error}`, 'error');
          setRows([]);
          return;
        }

        // Handle both response formats: {status: "success", data: [...]} or {data: [...]}
        const usersData = json?.data || (json?.status === "success" ? json.data : null);

        if (Array.isArray(usersData)) {
          const mapped = usersData.map(mapUserFromApi);
          setRows(mapped);
        } else {
          console.warn("/users returned unexpected shape", json);
          setRows([]);
        }
      } catch (err) {
        console.error("Error fetching /users:", err);
        showToast(`Failed to fetch users: ${err.message}`, 'error');
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [sessionLoading, showToast]);

  // ============================
  // Export functions
  // ============================
  const exportToCSV = () => {
    if (!filteredUsers.length) return alert("No data to export!");
    const headers = Object.keys(filteredUsers[0]);
    const rows = filteredUsers.map((r) => headers.map((h) => JSON.stringify(r[h] || "")));
    const blob = new Blob(
      [headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n")],
      { type: "text/csv" }
    );
    saveAs(blob, "users.csv");
  };

  const exportToExcel = async () => {
    if (!filteredUsers.length) return alert("No data to export!");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    // Add headers from first object keys
    if (filteredUsers.length > 0) {
      const headers = Object.keys(filteredUsers[0]);
      worksheet.addRow(headers);

      // Add data rows
      filteredUsers.forEach(row => {
        worksheet.addRow(headers.map(key => row[key]));
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "users.xlsx");
  };

  // ============================
  // Filtered data
  // ============================
  const filteredUsers = useMemo(() => {
    let filtered = rows;

    // Apply search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((r) => {
        return (
          (r.name && r.name.toLowerCase().includes(searchLower)) ||
          (r.email && r.email.toLowerCase().includes(searchLower)) ||
          (r.role && r.role.toLowerCase().includes(searchLower)) ||
          (r.department && r.department.toLowerCase().includes(searchLower)) ||
          (r.department_owner && r.department_owner.toLowerCase().includes(searchLower))
        );
      });
    }

    // Apply role filter
    if (filterRole) {
      filtered = filtered.filter((r) => r.role === filterRole);
    }

    // Apply status filter
    if (filterStatus) {
      if (filterStatus === "Active") {
        filtered = filtered.filter((r) => r.is_active === true);
      } else if (filterStatus === "Inactive") {
        filtered = filtered.filter((r) => r.is_active === false);
      }
    }

    // Apply department filter
    if (filterDepartment) {
      filtered = filtered.filter((r) => {
        const userDept = r.department || "";
        // Match exact or case-insensitive
        return userDept === filterDepartment ||
          userDept.toLowerCase() === filterDepartment.toLowerCase();
      });
    }

    return filtered;
  }, [rows, searchText, filterRole, filterStatus, filterDepartment]);

  // Get unique values for filter dropdowns
  const uniqueRoles = useMemo(() => {
    const roles = new Set(rows.map((r) => r.role).filter(Boolean));
    return Array.from(roles).sort();
  }, [rows]);

  const uniqueDepartments = useMemo(() => {
    // Get unique department values, filtering out null, undefined, and empty strings
    const departments = new Set(
      rows
        .map((r) => r.department)
        .filter((dept) => dept && String(dept).trim() !== "")
    );
    return Array.from(departments).sort();
  }, [rows]);

  // ============================
  // View/Edit handlers
  // ============================
  const handleViewUser = async (row) => {
    if (!hasPermission('users', 'retrieve')) {
      showToast('You do not have permission to view users', 'error');
      return;
    }

    try {
      const json = await get(`/users/${encodeURIComponent(row.id)}`);
      if (!json.error && json.data) {
        setViewUser(json.data);
      } else {
        setViewUser(row);
      }
    } catch {
      setViewUser(row);
    }
  };

  const handleEditUser = (row) => {
    if (!hasPermission('users', 'update')) {
      showToast('You do not have permission to edit users', 'error');
      return;
    }
    setEditUser(row);
  };

  const handleChangePassword = (row) => {
    if (!isSuperAdmin) {
      showToast('Only Super Admin can change user passwords', 'error');
      return;
    }
    setPasswordChangeUser(row);
  };

  // ============================
  // Columns
  // ============================
  const columns = [
    {
      name: "Name",
      selector: (r) => r.name || r.full_name || "",
      sortable: true,
      sortFunction: (a, b) => {
        const av = String(a.name || a.full_name || "").toLowerCase();
        const bv = String(b.name || b.full_name || "").toLowerCase();
        return av.localeCompare(bv);
      },
      cell: (r) => (
        <button
          onClick={() => handleViewUser(r)}
          className="text-purple-600 hover:underline font-medium"
        >
          {r.name || r.full_name || ""}
        </button>
      ),
    },
    {
      name: "Email",
      selector: (r) => r.email || "",
      sortable: true,
      sortFunction: (a, b) => {
        const av = String(a.email || "").toLowerCase();
        const bv = String(b.email || "").toLowerCase();
        return av.localeCompare(bv);
      },
    },
    {
      name: "Role",
      selector: (r) => r.role || "",
      sortable: true,
      sortFunction: (a, b) => {
        const av = String(a.role || "").toLowerCase();
        const bv = String(b.role || "").toLowerCase();
        return av.localeCompare(bv);
      },
    },
    {
      name: "Department",
      selector: (r) => r.department || "",
      sortable: true,
      sortFunction: (a, b) => {
        const av = String(a.department || "").toLowerCase();
        const bv = String(b.department || "").toLowerCase();
        return av.localeCompare(bv);
      },
    },
    {
      name: "Department Owner",
      selector: (r) => r.department_owner || "",
      sortable: true,
      sortFunction: (a, b) => {
        const av = String(a.department_owner || "").toLowerCase();
        const bv = String(b.department_owner || "").toLowerCase();
        return av.localeCompare(bv);
      },
    },
    {
      name: "Status",
      selector: (r) => (r.is_active ? "Active" : "Inactive"),
      sortable: true,
      sortFunction: (a, b) => {
        const av = a.is_active ? "Active" : "Inactive";
        const bv = b.is_active ? "Active" : "Inactive";
        return av.localeCompare(bv);
      },
      cell: (r) => {
        const status = r.is_active ? "Active" : "Inactive";
        const statusColors = {
          Active: "text-green-600",
          Inactive: "text-red-600",
        };
        return (
          <span className={`font-semibold ${statusColors[status] || "text-gray-700"}`}>
            {status}
          </span>
        );
      },
    },
    {
      name: "Actions",
      minWidth: "300px",
      width: "300px",
      grow: 0,
      center: true,
      cell: (r) => (
        <div className="flex items-center justify-center gap-1 flex-nowrap shrink-0 w-full mx-auto">
          {hasPermission('users', 'retrieve') && (
            <ActionIconButton onClick={() => handleViewUser(r)} title="View" variant="view">
              <Eye size={16} />
            </ActionIconButton>
          )}
          {hasPermission('users', 'update') && (
            <ActionIconButton onClick={() => handleEditUser(r)} title="Edit" variant="edit">
              <FileEdit size={16} />
            </ActionIconButton>
          )}
          {isSuperAdmin && (
            <ActionIconButton onClick={() => handleChangePassword(r)} title="Change Password" variant="edit">
              <Key size={16} />
            </ActionIconButton>
          )}
          <SecondaryButton
            onClick={() => navigate(`/users/${r.id}/roles`)}
            className="h-8 px-2 text-xs"
          >
            Roles
          </SecondaryButton>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  // ============================
  // Create View
  // ============================
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Viewer");
  const [department, setDepartment] = useState("");
  const [departmentOwner, setDepartmentOwner] = useState("");
  const [errors, setErrors] = useState({ email: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (view === "create") {
      setUsername("");
      setPassword("");
      setEmail("");
      setRole("Viewer");
      setDepartment("");
      setDepartmentOwner("");
      setErrors({ email: "" });
    }
  }, [view]);

  const validateEmail = (val) => {
    if (!val) return "Mail ID is required.";
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(val)) return "Enter a valid email address.";
    return "";
  };

  const onCreateSubmit = async (e) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    setErrors({ email: eErr });
    if (eErr) return;

    try {
      setSubmitting(true);
      const payload = {
        username,
        password,
        email,
        role,
        department: department || null,
        department_owner: departmentOwner || null
      };
      const json = await post(`/users`, payload);
      if (json.error) {
        throw new Error(json.error || json.detail || json.message || "Failed to create user");
      }
      showToast('User created successfully', 'success');
      setView("list");
      // Reload users
      const reloadJson = await get(`/users`);
      if (reloadJson?.status === "success" && Array.isArray(reloadJson.data)) {
        setRows(reloadJson.data.map(mapUserFromApi));
      }
    } catch (err) {
      showToast(err.message || "Failed to create user", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================
  // Invite View
  // ============================
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("Viewer");
  const [inviteEmail, setInviteEmail] = useState("");

  const onInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      const json = await post(`/invite`, { name: inviteName, role: inviteRole, email: inviteEmail });
      if (json.error) {
        throw new Error(json.error || json.detail || json.message || "Failed to send invite");
      }
      showToast('Invitation sent successfully', 'success');
      setView("list");
      // Reload users
      const reloadJson = await get(`/users`);
      if (reloadJson?.status === "success" && Array.isArray(reloadJson.data)) {
        setRows(reloadJson.data.map(mapUserFromApi));
      }
    } catch (err) {
      showToast(err.message || "Failed to send invite", 'error');
    }
  };

  // ============================
  // ChangePasswordDialog component
  // ============================
  const ChangePasswordDialog = ({ user, onClose, onSuccess }) => {
    const [password, setPassword] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();

      const userEmail = (user?.email || "").trim().toLowerCase();
      const userKey = user?.id || userEmail;
      if (!user || !userKey || !userEmail) {
        showToast('Invalid user data. Please refresh and try again.', 'error');
        return;
      }
      if (!password || !password.trim()) {
        showToast('Please enter a password', 'error');
        return;
      }

      setSaving(true);
      try {
        const res = await put(
          `/users/${encodeURIComponent(userKey)}?tenant_id=${encodeURIComponent(tenantId)}`,
          { password: password.trim(), email: userEmail }
        );
        if (res?.status !== "success") {
          throw new Error(res?.error || res?.detail || "Failed to change password");
        }
        showToast('Password changed successfully', 'success');
        onSuccess();
      } catch (err) {
        showToast(extractApiErrorMessage(err, 'Failed to change password'), 'error');
      } finally {
        setSaving(false);
      }
    };

    return (
      <ModernModal
        open={!!user}
        onClose={onClose}
        title="Change Password"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <SecondaryButton type="button" onClick={onClose} disabled={saving}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" form="change-user-password-form" disabled={saving}>
              {saving ? "Changing..." : "Change Password"}
            </PrimaryButton>
          </div>
        }
      >
        <form id="change-user-password-form" className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="font-semibold text-gray-900">{user?.name || user?.full_name || "—"}</div>
              <div className="text-sm text-gray-600">{user?.email || "—"}</div>
            </div>
          </div>
          <FormField
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </form>
      </ModernModal>
    );
  };

  // ============================
  // EditUserForm component
  // ============================
  const EditUserForm = ({ user, onSave, onCancel }) => {
    const [editName, setEditName] = useState(user?.name || user?.full_name || "");
    const [editEmail, setEditEmail] = useState(user?.email || "");
    const [editRole, setEditRole] = useState(user?.role || "Viewer");
    const [editDepartment, setEditDepartment] = useState(user?.department || "");
    const [editDepartmentOwner, setEditDepartmentOwner] = useState(user?.department_owner || "");
    const [editIsActive, setEditIsActive] = useState(user?.is_active !== false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const validateEmail = (val) => {
      if (!val) return "Email is required.";
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(val)) return "Enter a valid email address.";
      return "";
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const eErr = validateEmail(editEmail);
      setErrors({ email: eErr });
      if (eErr) return;

      setSaving(true);
      try {
        await onSave({
          name: editName,
          full_name: editName,
          email: editEmail,
          role: editRole,
          department: editDepartment,
          department_owner: editDepartmentOwner || null,
          is_active: editIsActive,
        });
      } catch (err) {
        // Error handling is done in parent
      } finally {
        setSaving(false);
      }
    };

    return (
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <div>
            <FormField
              label="Email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
            {errors.email ? (
              <p className="text-sm mt-1" style={{ color: "var(--kz-alert)" }}>
                {errors.email}
              </p>
            ) : null}
          </div>
          <FormField
            label="Role"
            type="select"
            value={editRole}
            onChange={(v) => setEditRole(v)}
            options={fetchedRoles}
          />
          <FormField
            label="Department"
            type="select"
            placeholder="Select the Department"
            value={editDepartment}
            onChange={(v) => setEditDepartment(v)}
            options={[
              { label: "Infra", value: "Infra" },
              { label: "Compliance", value: "Compliance" },
              { label: "Devops", value: "Devops" },
              { label: "Technology", value: "Technology" },
              { label: "Security", value: "Security" },
              { label: "HR", value: "HR" },
              { label: "Finance", value: "Finance" },
              { label: "QA", value: "QA" },
              { label: "Development", value: "Development" },
            ]}
          />
          <div className="sm:col-span-2">
            <UserAutocomplete
              label="Department Owner"
              value={editDepartmentOwner}
              onChange={setEditDepartmentOwner}
              placeholder="Search by email..."
              fieldType="assignee"
            />
          </div>
          <div className="sm:col-span-2">
            <div className="kz-edit-user-status">
              <label className="kz-edit-user-status__label">
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="kz-edit-user-status__checkbox"
                />
                <span>{editIsActive ? "Active user" : "Inactive user"}</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[color:var(--kz-border)]">
          <SecondaryButton type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </PrimaryButton>
        </div>
      </form>
    );
  };

  // ============================
  // Render Views
  // ============================
  if (sessionLoading || (loading && view === "list")) {
    return <Loader skeleton="table" message="Loading users..." />;
  }

  const renderList = () => (
    <ModernPageShell>
      <PageHeader
        title="Users"
        subtitle="Manage user accounts, roles, and access"
        action={
          <div className="flex gap-2">
            {hasPermission('users', 'create') && (
              <PrimaryButton onClick={() => setView("create")} icon={Plus}>
                Create User
              </PrimaryButton>
            )}
            <PrimaryButton onClick={() => setView("invite")} icon={Plus}>
              Invite User
            </PrimaryButton>
          </div>
        }
      />

      <ToolbarCard>
        <div className="space-y-3">
          <SearchField
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search users..."
            className="max-w-full"
          />
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              placeholder="All Roles"
              options={[
                { value: "", label: "All Roles" },
                ...uniqueRoles.map((role) => ({ value: role, label: role })),
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
            <FilterSelect
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              placeholder="All Departments"
              options={[
                { value: "", label: "All Departments" },
                ...uniqueDepartments.map((dept) => ({ value: dept, label: dept })),
              ]}
            />
            {(filterRole || filterStatus || filterDepartment || searchText) && (
              <SecondaryButton
                onClick={() => {
                  setFilterRole("");
                  setFilterStatus("");
                  setFilterDepartment("");
                  setSearchText("");
                }}
              >
                Clear Filters
              </SecondaryButton>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-slate-600 font-medium whitespace-nowrap">
                Records per page:
              </label>
              <FilterSelect
                value={String(perPage)}
                onChange={(e) => {
                  const newPerPage = Number(e.target.value);
                  setPerPage(newPerPage);
                  setCurrentPage(1);
                  localStorage.setItem("usersPerPage", newPerPage.toString());
                }}
                options={[
                  { value: "20", label: "20" },
                  { value: "50", label: "50" },
                  { value: "100", label: "100" },
                  { value: "200", label: "200" },
                  { value: "500", label: "500" },
                ]}
              />
            </div>
          </div>
        </div>
      </ToolbarCard>

      <TableCard className="kz-users-table-wrap">
        <DataTable
          key={`table-${perPage}`}
          columns={columns}
          data={filteredUsers}
          pagination
          paginationPerPage={perPage}
          paginationDefaultPage={currentPage}
          paginationRowsPerPageOptions={[20, 50, 100, 200, 500]}
          onChangeRowsPerPage={(currentRowsPerPage) => {
            setPerPage(currentRowsPerPage);
            setCurrentPage(1);
            localStorage.setItem('usersPerPage', currentRowsPerPage.toString());
          }}
          onChangePage={(page) => {
            setCurrentPage(page);
          }}
          highlightOnHover
          striped
          dense
          responsive={false}
          sortIcon={<span>⇅</span>}
          customStyles={modernTableStyles}
        />
      </TableCard>

      {/* View Modal */}
      {viewUser && (
        <ModernModal
          open={!!viewUser}
          onClose={() => setViewUser(null)}
          title="User Details"
          size="detail"
          footer={
            <div className="flex justify-end gap-3">
              <SecondaryButton onClick={() => setViewUser(null)}>Close</SecondaryButton>
              {hasPermission("users", "update") && (
                <PrimaryButton
                  onClick={() => {
                    handleEditUser(viewUser);
                    setViewUser(null);
                  }}
                >
                  Edit user
                </PrimaryButton>
              )}
            </div>
          }
        >
          <UserDetailsModalBody viewUser={viewUser} formatUserId={formatUserId} />
        </ModernModal>
      )}

      {/* Edit Modal */}
      {editUser && (
        <ModernModal
          open={!!editUser}
          onClose={() => setEditUser(null)}
          title="Edit User"
          size="md"
        >
          <EditUserForm
            user={editUser}
            onSave={async (updatedData) => {
              if (!hasPermission('users', 'update')) {
                showToast('You do not have permission to update users', 'error');
                return;
              }

              if (!editUser || !editUser.id) {
                showToast('Invalid user data. Please refresh and try again.', 'error');
                return;
              }

              try {
                // Filter out null/empty values for optional fields
                const cleanedData = { ...updatedData };
                if (!cleanedData.department_owner) {
                  cleanedData.department_owner = null;
                }
                if (!cleanedData.department) {
                  cleanedData.department = null;
                }

                const res = await put(`/users/${encodeURIComponent(editUser.id)}`, cleanedData);
                if (res.error) throw new Error(res.error);
                showToast('User updated successfully', 'success');
                setEditUser(null);
                // Reload users
                const json = await get(`/users`);
                if (json?.status === "success" && Array.isArray(json.data)) {
                  setRows(json.data.map(mapUserFromApi));
                }
              } catch (err) {
                showToast(`Failed to update user: ${err.message}`, 'error');
              }
            }}
            onCancel={() => setEditUser(null)}
          />
        </ModernModal>
      )}

      {/* Change Password Modal */}
      {passwordChangeUser && (
        <ChangePasswordDialog
          user={passwordChangeUser}
          onClose={() => setPasswordChangeUser(null)}
          onSuccess={async () => {
            setPasswordChangeUser(null);
            // Reload users
            const reloadJson = await get(`/users`);
            if (reloadJson?.status === "success" && Array.isArray(reloadJson.data)) {
              setRows(reloadJson.data.map(mapUserFromApi));
            }
          }}
        />
      )}
    </ModernPageShell>
  );

  const renderCreate = () => (
    <ModernPageShell>
      <PageHeader
        title="Create user"
        subtitle="Add a new account with role and department"
        action={
          <SecondaryButton onClick={() => setView("list")}>Back to users</SecondaryButton>
        }
      />
      <SectionCard title="Account details" subtitle="Credentials and profile">
          <Toast type={toast.type} message={toast.message} />
          <form className="grid gap-4" onSubmit={onCreateSubmit} autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Username"
                name="new_user_name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                required
              />
              <FormField
                label="Password"
                name="new_user_password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <div>
                <FormField
                  label="Email"
                  name="new_user_email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>
              <FormField
                label="Role"
                type="select"
                value={role}
                onChange={(v) => setRole(v)}
                options={fetchedRoles}
                required
              />
              <FormField label="Department" type="select" placeholder="Select the Department" value={department} onChange={(v) => setDepartment(v)} options={[
                { label: "Infra", value: "Infra" },
                { label: "Compliance", value: "Compliance" },
                { label: "Devops", value: "Devops" },
                { label: "Technology", value: "Technology" },
                { label: "Security", value: "Security" },
                { label: "HR", value: "HR" },
                { label: "Finance", value: "Finance" },
                { label: "QA", value: "QA" },
                { label: "Development", value: "Development" },
              ]} />
              <div>
                <UserAutocomplete
                  label="Department Owner"
                  value={departmentOwner}
                  onChange={setDepartmentOwner}
                  placeholder="Search by email..."
                  fieldType="assignee"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <PrimaryButton type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create user"}
              </PrimaryButton>
              <SecondaryButton type="button" onClick={() => setView("list")}>
                Cancel
              </SecondaryButton>
            </div>
          </form>
      </SectionCard>
    </ModernPageShell>
  );

  const renderInvite = () => (
    <ModernPageShell>
      <PageHeader
        title="Invite user"
        subtitle="Send an invitation email with assigned role"
        action={
          <SecondaryButton onClick={() => setView("list")}>Back to users</SecondaryButton>
        }
      />
      <SectionCard title="Invitation" subtitle="Recipient details">
          <form className="grid gap-4 max-w-lg" onSubmit={onInviteSubmit}>
            <FormField label="Name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
            <FormField label="Role" type="select" value={inviteRole} onChange={(v) => setInviteRole(v)} options={fetchedRoles} />
            <FormField label="Email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <PrimaryButton type="submit">Send invite</PrimaryButton>
              <SecondaryButton type="button" onClick={() => setView("list")}>
                Cancel
              </SecondaryButton>
            </div>
          </form>
      </SectionCard>
    </ModernPageShell>
  );

  return (
    <div className="app-page-shell min-h-screen w-full min-w-0 max-w-full box-border">
      {view === "list" && renderList()}
      {view === "create" && renderCreate()}
      {view === "invite" && renderInvite()}
    </div>
  );
}
