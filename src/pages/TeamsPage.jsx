import React, { useState, useEffect, useMemo } from "react";
import { get, post, del } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import { useConfirm } from "../contexts/ConfirmContext";
import ModernModal from "../components/ModernModal";
import FormField from "../components/FormField";
import {
  ModernPageShell,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  ToolbarCard,
  TableCard,
  SearchField,
  ModernDataTable,
  ActionIconButton,
} from "../components/layout/ModernPageUI";
import { Plus, Trash, Users } from "lucide-react";
import Loader from "../components/Loader";
import UserAutocomplete from "../components/UserAutocomplete";

export default function TeamsPage() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });
  
  const [manageTeam, setManageTeam] = useState(null);
  const [manageModalOpen, setManageModalOpen] = useState(false);

  const [teamUsers, setTeamUsers] = useState([]);
  const [selectedUserEmails, setSelectedUserEmails] = useState([]);
  const [memberFilter, setMemberFilter] = useState("");

  const [searchText, setSearchText] = useState("");
  const [teamStats, setTeamStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await get("/teams");
      if (!res.error) {
        setTeams(res.data || []);
      }
    } catch {
      showToast("Failed to fetch teams", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      if (!teams || teams.length === 0) {
        setTeamStats({});
        return;
      }
      setStatsLoading(true);
      try {
        const results = await Promise.all(
          teams.map(async (t) => {
            try {
              const uRes = await get(`/teams/${t.id}/users`);
              const members = Array.isArray(uRes?.data) ? uRes.data.length : 0;
              return { id: t.id, members };
            } catch {
              return { id: t.id, members: 0 };
            }
          })
        );
        const map = {};
        results.forEach((r) => {
          map[r.id] = { members: r.members };
        });
        setTeamStats(map);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, [teams]);

  const handleCreateTeam = async () => {
    if (!newTeam.name) {
      showToast("Team name is required", "error");
      return;
    }
    try {
      await post("/teams", newTeam);
      showToast("Team created successfully", "success");
      setIsCreateModalOpen(false);
      setNewTeam({ name: "", description: "" });
      fetchTeams();
    } catch {
      showToast("Failed to create team", "error");
    }
  };

  const handleDeleteTeam = async (id, teamName) => {
    const ok = await confirm({
      title: "Delete team",
      message: teamName
        ? `Are you sure you want to delete "${teamName}"? This action cannot be undone.`
        : "Are you sure you want to delete this team? This action cannot be undone.",
    });
    if (!ok) return;
    try {
      await del(`/teams/${id}`);
      showToast("Team deleted successfully", "success");
      fetchTeams();
    } catch {
      showToast("Failed to delete team", "error");
    }
  };

  const refreshTeamMembers = async (teamId) => {
    try {
      const uRes = await get(`/teams/${teamId}/users`);
      if (!uRes.error) {
        const users = uRes.data || [];
        setTeamUsers(users);
        setTeamStats((prev) => ({
          ...prev,
          [teamId]: { members: users.length },
        }));
      }
    } catch {
      showToast("Failed to fetch team details", "error");
    }
  };

  const openManageModal = async (team) => {
    setManageTeam(team);
    setManageModalOpen(true);
    setMemberFilter("");
    setSelectedUserEmails([]);
    await refreshTeamMembers(team.id);
  };

  const handleAddUser = async () => {
    if (!selectedUserEmails || selectedUserEmails.length === 0) return;
    try {
      await Promise.all(
        selectedUserEmails.map(email =>
          post(`/teams/${manageTeam.id}/users`, { user_id: email })
        )
      );
      showToast("Selected users added to team", "success");
      setSelectedUserEmails([]);
      await refreshTeamMembers(manageTeam.id);
    } catch {
      showToast("Failed to add one or more users", "error");
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await del(`/teams/${manageTeam.id}/users/${userId}`);
      showToast("User removed from team", "success");
      await refreshTeamMembers(manageTeam.id);
    } catch {
      showToast("Failed to remove user", "error");
    }
  };

  const filteredTeamUsers = useMemo(() => {
    const q = memberFilter.trim().toLowerCase();
    if (!q) return teamUsers;
    return teamUsers.filter((u) =>
      String(u.user_id || "").toLowerCase().includes(q)
    );
  }, [teamUsers, memberFilter]);

  const columns = [
    {
      name: <span className="pl-12">Team</span>,
      selector: (row) => row.name,
      sortable: true,
      grow: 2,
      minWidth: "240px",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-semibold" style={{ background: "var(--surface-secondary, var(--kz-surface-secondary))", color: "var(--accent-color, var(--kz-accent-vibrant))" }}>
            {String(row.name || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-[color:var(--text-primary,var(--kz-text-primary))]">{row.name}</div>
            <div className="text-xs text-[color:var(--text-secondary,var(--kz-text-secondary))]">{row.description || "—"}</div>
          </div>
        </div>
      ),
    },
    {
      name: "Members",
      selector: (row) => teamStats[row.id]?.members || 0,
      sortable: true,
      grow: 1,
      minWidth: "140px",
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          {(teamStats[row.id]?.members || 0)} members
        </span>
      ),
    },
    {
      name: "Created",
      selector: (row) => new Date(row.created_at).toLocaleDateString(),
      sortable: true,
      grow: 1,
      minWidth: "120px",
    },
    {
      name: "Actions",
      center: true,
      grow: 1,
      minWidth: "160px",
      cell: (row) => (
        <div className="flex gap-1 justify-center w-full">
          <ActionIconButton onClick={() => openManageModal(row)} title="Manage Team" variant="view">
            <Users size={16} />
          </ActionIconButton>
          <ActionIconButton onClick={() => handleDeleteTeam(row.id, row.name)} title="Delete Team" variant="delete">
            <Trash size={16} />
          </ActionIconButton>
        </div>
      ),
    },
  ];

  const filteredTeams = useMemo(() => {
    const s = (searchText || "").trim().toLowerCase();
    return teams.filter((t) => {
      return (
        !s ||
        (t.name || "").toLowerCase().includes(s) ||
        (t.description || "").toLowerCase().includes(s)
      );
    });
  }, [teams, searchText]);

  if (loading) return <Loader skeleton="table" message="Loading teams..." />;

  return (
    <ModernPageShell>
      <PageHeader
        title="Teams"
        subtitle="Manage teams"
        action={
          <PrimaryButton onClick={() => setIsCreateModalOpen(true)} icon={Plus}>
            Create Team
          </PrimaryButton>
        }
      />

      <ToolbarCard>
        <SearchField
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search teams..."
        />
      </ToolbarCard>

      <TableCard>
        <ModernDataTable
          columns={columns}
          data={filteredTeams}
          progressPending={statsLoading}
          progressComponent={<Loader message="Loading teams..." fullScreen={false} />}
          pagination
          highlightOnHover
        />
      </TableCard>

      <ModernModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Team"
        size="sm"
      >
        <div className="space-y-4">
          <FormField
            label="Team Name"
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            required
            placeholder="e.g. QA Team A"
          />
          <FormField
            label="Description"
            value={newTeam.description}
            onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
            type="textarea"
            placeholder="Optional description"
          />
          <div className="flex justify-end gap-3 mt-6">
            <SecondaryButton onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleCreateTeam}>
              Create
            </PrimaryButton>
          </div>
        </div>
      </ModernModal>

      <ModernModal
        open={manageModalOpen}
        onClose={() => setManageModalOpen(false)}
        title={manageTeam ? `Manage Team — ${manageTeam.name}` : "Manage Team"}
        size="sm"
      >
        <div className="space-y-5">
          <section className="space-y-3">
            <UserAutocomplete
              value={selectedUserEmails}
              onChange={(arr) => setSelectedUserEmails(Array.isArray(arr) ? arr : [])}
              label="Add Users to Team"
              placeholder="Search users by email..."
              multiple
              selectionOnly
            />
            <div className="flex justify-end">
              <PrimaryButton onClick={handleAddUser} disabled={!selectedUserEmails.length}>
                Add Selected
              </PrimaryButton>
            </div>
          </section>

          <section className="space-y-3 pt-1 border-t border-[color:var(--kz-border)]">
            <h3 className="text-sm font-semibold text-[color:var(--kz-text-primary)]">
              Current Members
            </h3>
            <SearchField
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              placeholder="Filter members by email"
              className="max-w-none w-full"
            />
            {filteredTeamUsers.length === 0 ? (
              <p className="text-sm text-[color:var(--kz-text-muted)] py-2">
                No members in this team.
              </p>
            ) : (
              <div className="max-h-52 overflow-auto rounded-xl border border-[color:var(--kz-border)] bg-[color:var(--kz-surface)]">
                <ul className="divide-y divide-[color:var(--kz-border)]">
                  {filteredTeamUsers.map((u) => (
                    <li
                      key={u.id}
                      className="kz-list-item py-2.5 px-3 flex justify-between items-center gap-2"
                    >
                      <span className="text-sm font-medium text-[color:var(--kz-text-primary)] truncate min-w-0">
                        {u.user_id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(u.user_id)}
                        className="shrink-0 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md border border-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </ModernModal>
    </ModernPageShell>
  );
}
