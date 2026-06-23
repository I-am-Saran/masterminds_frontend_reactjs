import React from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, Lock, Menu, Plus, User } from "lucide-react";
import { useSession } from "../contexts/SessionContext";
import { usePermissions } from "../hooks/usePermissions";
import { get } from "../services/api";
import { resolveUserDisplayName } from "../utils/displayName";
import PermissionGuard from "./PermissionGuard";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { NO_ACTIVE_WORKFLOWS_MSG } from "../constants/workflowConstants";
import { useActiveTicketCategories } from "../hooks/useActiveTicketCategories";
import { THEME_STORAGE_KEY } from "../themes/initTheme";
import "../styles/header-refinement.css";

export default function TopNavBar({ onMenuToggle, showMenuButton = false }) {
  const navigate = useNavigate();
  const { session, setSession, tenantId } = useSession();
  const { userRoles, loading: permsLoading } = usePermissions(tenantId);

  const [roleNamesFromApi, setRoleNamesFromApi] = React.useState([]);

  const performLogout = () => {
    setSession(null);
    try {
      const preservedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      sessionStorage.clear();
      localStorage.clear();
      if (preservedTheme) {
        localStorage.setItem(THEME_STORAGE_KEY, preservedTheme);
      }
      localStorage.removeItem("password_changed");
    } catch {
      /* ignore */
    }
    window.location.replace("/login");
    window.location.reload();
  };

  React.useEffect(() => {
    const fetchRoleNames = async () => {
      if (permsLoading || !userRoles || userRoles.length === 0) return;

      const extractedNames = userRoles
        .map((userRole) => {
          if (userRole?.roles?.role_name) return userRole.roles.role_name;
          if (Array.isArray(userRole?.roles) && userRole.roles.length > 0) {
            return userRole.roles[0]?.role_name;
          }
          if (userRole?.role_name) return userRole.role_name;
          return null;
        })
        .filter(Boolean);

      if (extractedNames.length > 0) {
        setRoleNamesFromApi(extractedNames);
        return;
      }

      const roleIds = userRoles
        .map((userRole) => {
          if (userRole.role_id) return userRole.role_id;
          if (userRole?.roles?.id) return userRole.roles.id;
          if (Array.isArray(userRole?.roles) && userRole.roles.length > 0) {
            return userRole.roles[0]?.id;
          }
          return null;
        })
        .filter(Boolean);

      if (roleIds.length === 0) {
        setRoleNamesFromApi([]);
        return;
      }

      try {
        const roleNamePromises = roleIds.map(async (roleId) => {
          try {
            const roleJson = await get(`/api/roles/${roleId}?tenant_id=${tenantId}`);
            return roleJson?.data?.role_name || null;
          } catch {
            return null;
          }
        });
        const names = await Promise.all(roleNamePromises);
        setRoleNamesFromApi(names.filter(Boolean));
      } catch {
        setRoleNamesFromApi([]);
      }
    };

    fetchRoleNames();
  }, [userRoles, permsLoading, tenantId]);

  const roleNames = React.useMemo(() => {
    if (permsLoading) return "Loading…";
    if (!userRoles || userRoles.length === 0) return "No Role";

    const names = userRoles
      .map((userRole) => {
        if (userRole?.roles?.role_name) return userRole.roles.role_name;
        if (Array.isArray(userRole?.roles) && userRole.roles.length > 0) {
          return userRole.roles[0]?.role_name;
        }
        if (userRole?.role_name) return userRole.role_name;
        return null;
      })
      .filter(Boolean);

    if (names.length === 0 && roleNamesFromApi.length > 0) {
      return roleNamesFromApi.join(", ");
    }
    return names.length > 0 ? names.join(", ") : "No Role";
  }, [userRoles, permsLoading, roleNamesFromApi]);

  const { hasActiveCategories, isLoading: categoriesLoading } = useActiveTicketCategories();
  const createDisabled = categoriesLoading || !hasActiveCategories;

  const [profileOpen, setProfileOpen] = React.useState(false);
  const [profileMenuStyle, setProfileMenuStyle] = React.useState(null);
  const profileTriggerRef = React.useRef(null);
  const profileMenuRef = React.useRef(null);

  const updateProfileMenuPosition = React.useCallback(() => {
    const trigger = profileTriggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const menuWidth = 280;
    const left = Math.min(
      Math.max(12, rect.right - menuWidth),
      window.innerWidth - menuWidth - 12
    );

    setProfileMenuStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left,
      width: menuWidth,
      zIndex: 1200,
    });
  }, []);

  const closeProfileMenu = React.useCallback(() => {
    setProfileOpen(false);
  }, []);

  const toggleProfileMenu = React.useCallback(
    (event) => {
      event.stopPropagation();
      if (profileOpen) {
        closeProfileMenu();
        return;
      }
      updateProfileMenuPosition();
      setProfileOpen(true);
    },
    [profileOpen, closeProfileMenu, updateProfileMenuPosition]
  );

  React.useEffect(() => {
    if (!profileOpen) return undefined;

    updateProfileMenuPosition();

    const handleOutsideClick = (event) => {
      const target = event.target;
      if (
        profileTriggerRef.current?.contains(target) ||
        profileMenuRef.current?.contains(target)
      ) {
        return;
      }
      closeProfileMenu();
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") closeProfileMenu();
    };

    const handleLayout = () => updateProfileMenuPosition();

    const attachTimer = window.setTimeout(() => {
      document.addEventListener("click", handleOutsideClick);
    }, 0);

    window.addEventListener("resize", handleLayout);
    window.addEventListener("scroll", handleLayout, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.clearTimeout(attachTimer);
      document.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("resize", handleLayout);
      window.removeEventListener("scroll", handleLayout, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileOpen, closeProfileMenu, updateProfileMenuPosition]);

  const userName = resolveUserDisplayName(session?.user, "User");
  const userEmail = session?.user?.email || "";
  const userInitials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") || "U";

  return (
    <header className="enterprise-top-nav enterprise-top-nav--v2">
      <div className="enterprise-top-nav-inner">
        <div className="enterprise-top-nav-left">
          {showMenuButton && onMenuToggle ? (
            <button
              type="button"
              className="enterprise-icon-btn enterprise-top-nav-menu-btn"
              onClick={onMenuToggle}
              aria-label="Open menu"
            >
              <Menu size={18} strokeWidth={2} />
            </button>
          ) : null}
          <Link to="/" className="enterprise-top-nav-brand" aria-label="Master Minds Home">
            <span className="enterprise-top-nav-logo-wrap">
              <Logo variant="login" size="auto" className="enterprise-top-nav-logo" />
            </span>
          </Link>
        </div>

        {session ? (
          <div className="enterprise-top-nav-right">
            <PermissionGuard module="kaizen_tasks" action="create">
              <button
                type="button"
                className="kz-btn-primary hidden sm:inline-flex"
                onClick={() => navigate("/tasks?create=1")}
                disabled={createDisabled}
                title={createDisabled && !categoriesLoading ? NO_ACTIVE_WORKFLOWS_MSG : "Create Ticket"}
              >
                <Plus size={17} strokeWidth={2.5} />
                Create Ticket
              </button>
            </PermissionGuard>

            <div className="enterprise-top-nav-actions" role="group" aria-label="Header actions">
              <button
                type="button"
                className="enterprise-icon-btn kz-nav-notify-btn"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell size={18} strokeWidth={2} />
              </button>

              <ThemeToggle />

              <div className="enterprise-profile-menu">
                <button
                  ref={profileTriggerRef}
                  type="button"
                  className={`enterprise-icon-btn enterprise-profile-trigger${profileOpen ? " enterprise-profile-trigger--open" : ""}`}
                  onClick={toggleProfileMenu}
                  aria-label="Profile menu"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  title="Profile"
                >
                  <User size={18} strokeWidth={2} />
                </button>

              {profileOpen && profileMenuStyle
                ? createPortal(
                    <div
                      ref={profileMenuRef}
                      className="enterprise-profile-dropdown kz-dropdown-panel"
                      role="menu"
                      style={profileMenuStyle}
                    >
                      <div className="enterprise-profile-dropdown-header">
                        <div className="enterprise-user-avatar" aria-hidden>
                          {userInitials}
                        </div>
                        <div className="enterprise-profile-dropdown-details">
                          <span className="enterprise-user-name">{userName}</span>
                          <span className="enterprise-user-role">{roleNames}</span>
                          {userEmail ? (
                            <span className="enterprise-user-meta">{userEmail}</span>
                          ) : null}
                        </div>
                      </div>

                      <div className="enterprise-profile-dropdown-divider" role="separator" />

                      <button
                        type="button"
                        role="menuitem"
                        className="enterprise-profile-dropdown-item"
                        onClick={() => {
                          closeProfileMenu();
                          navigate("/change-password");
                        }}
                      >
                        <Lock size={16} strokeWidth={2} aria-hidden />
                        Change Password
                      </button>

                      <button
                        type="button"
                        role="menuitem"
                        className="enterprise-profile-dropdown-item enterprise-profile-dropdown-item--danger"
                        onClick={() => {
                          closeProfileMenu();
                          performLogout();
                        }}
                      >
                        <LogOut size={16} strokeWidth={2} aria-hidden />
                        Logout
                      </button>
                    </div>,
                    document.body
                  )
                : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
