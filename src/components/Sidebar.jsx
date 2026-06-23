import React, { useEffect, useState } from "react";
import { ChevronRight, GitBranch, Mail } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useSession } from "../contexts/SessionContext";
import { usePermissions } from "../hooks/usePermissions";
import { MENU_CONFIG, MENU_GROUPS } from "../constants/menuConfig";
import { SIDEBAR_WIDTH } from "../constants/layout";
import { isNavItemActive } from "../utils/navActive";
import Logo from "./Logo";
import "../styles/sidebar-redesign.css";

const ICON_SIZE = 18;

function SvgIcon({ d, size = 15, strokeWidth = 1.7, className, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {d.map((p, i) => (
        <path key={i} d={p} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

const IconTaskSquare = (props) => (
  <SvgIcon {...props} d={[
    "M9 8H15",
    "M9 12H13",
    "M9 16H12",
    "M7 4H17C18.1046 4 19 4.89543 19 6V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V6C5 4.89543 5.89543 4 7 4Z",
  ]} />
);

const IconUsers = (props) => (
  <SvgIcon {...props} d={[
    "M16 11C18.2091 11 20 9.20914 20 7C20 4.79086 18.2091 3 16 3C13.7909 3 12 4.79086 12 7C12 9.20914 13.7909 11 16 11Z",
    "M8 13C10.2091 13 12 11.2091 12 9C12 6.79086 10.2091 5 8 5C5.79086 5 4 6.79086 4 9C4 11.2091 5.79086 13 8 13Z",
    "M2 21V19C2 16.7909 3.79086 15 6 15H10C12.2091 15 14 16.7909 14 19V21",
    "M14 21V19C14 16.7909 15.7909 15 18 15H19",
  ]} />
);

const IconUser = (props) => (
  <SvgIcon {...props} d={[
    "M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z",
    "M4 22V20C4 17.7909 5.79086 16 8 16H16C18.2091 16 20 17.7909 20 20V22",
  ]} />
);

const IconKey = (props) => (
  <SvgIcon {...props} d={[
    "M15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7Z",
    "M12 10L4 18",
    "M4 18H8",
    "M6 16V20",
  ]} />
);

const IconGear = (props) => (
  <SvgIcon {...props} d={[
    "M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z",
    "M19.4 15A1 1 0 0 0 20 14V10A1 1 0 0 0 19.4 9L17.4 7L17 5A1 1 0 0 0 16 4H8A1 1 0 0 0 7 5L6.6 7L4.6 9A1 1 0 0 0 4 10V14A1 1 0 0 0 4.6 15L6.6 17L7 19A1 1 0 0 0 8 20H16A1 1 0 0 0 17 19L17.4 17L19.4 15Z",
  ]} />
);

function NavIconWrap({ children, active = false }) {
  return (
    <span
      className={`kz-nav-icon-badge${active ? " kz-nav-icon-badge--active" : ""}`}
    >
      <span className="kz-nav-icon flex items-center justify-center">{children}</span>
    </span>
  );
}

const NavItem = ({ item, isChild = false, onClose }) => {
  const location = useLocation();
  const Icon = item.icon;
  const active = isNavItemActive(item.path, location.pathname);

  return (
    <NavLink
      to={item.path}
      end
      aria-current={active ? "page" : undefined}
      onClick={() => {
        if (onClose) onClose();
      }}
      className={`kz-nav-item${isChild ? " kz-nav-item--child" : ""}${active ? " kz-nav-item--active" : ""}`}
    >
      {isChild ? (
        <span className="kz-nav-child-marker" aria-hidden="true" />
      ) : (
        <NavIconWrap active={active}>
          {Icon ? (
            <Icon size={ICON_SIZE} strokeWidth={active ? 2.25 : 2} />
          ) : (
            <span className="kz-nav-icon-dot" />
          )}
        </NavIconWrap>
      )}
      <span className="kz-nav-item__label">{item.name}</span>
    </NavLink>
  );
};

const NavGroup = ({ title, icon: Icon, children, isOpen, onToggle, isActive, nested = false }) => {
  const groupActive = isActive && !isOpen;
  return (
    <div className={`kz-nav-group${nested ? " kz-nav-group--nested" : ""}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        aria-expanded={isOpen}
        className={`kz-nav-item kz-nav-group-toggle${groupActive ? " kz-nav-group-active" : ""}${nested ? " kz-nav-item--child kz-nav-group-toggle--nested" : ""}`}
      >
        {!nested ? (
          <NavIconWrap active={groupActive || isOpen}>
            {Icon ? <Icon size={ICON_SIZE} strokeWidth={groupActive || isOpen ? 2.25 : 2} /> : null}
          </NavIconWrap>
        ) : (
          <span className="kz-nav-child-marker" aria-hidden="true" />
        )}
        <span className="kz-nav-item__label">{title}</span>
        <ChevronRight
          size={16}
          strokeWidth={2}
          className={`kz-nav-chevron${isOpen ? " kz-nav-chevron--open" : ""}`}
          aria-hidden
        />
      </button>

      <div className={`kz-nav-submenu${isOpen ? " kz-nav-submenu--open" : ""}`}>
        <div className="kz-nav-nested-group">
          <div className="kz-nav-nested-list">{children}</div>
        </div>
      </div>
    </div>
  );
};

function resolveExpandedFromRoute(pathname, ticketsChildren, adminItems) {
  const ticketsActive = ticketsChildren.some((child) =>
    isNavItemActive(child.path, pathname)
  );
  if (ticketsActive) {
    return { top: "Tickets", nested: null };
  }

  for (const item of adminItems) {
    if (item.children?.some((child) => isNavItemActive(child.path, pathname))) {
      return { top: "Access", nested: `Access-${item.name}` };
    }
  }

  const accessActive = adminItems.some((item) => isNavItemActive(item.path, pathname));
  if (accessActive) {
    return { top: "Access", nested: null };
  }

  return { top: null, nested: null };
}

export default function Sidebar({ open, onClose, isDesktop = false }) {
  const location = useLocation();
  const { tenantId } = useSession();
  const { hasPermission, loading: permsLoading, isSuperAdmin } = usePermissions(tenantId);
  const [expandedTopKey, setExpandedTopKey] = useState(null);
  const [expandedNestedKey, setExpandedNestedKey] = useState(null);

  const filterItems = (items) =>
    items.filter((item) => {
      if (item.superAdminOnly) return isSuperAdmin;
      if (isSuperAdmin) return true;
      if (item.alwaysVisible) return true;
      if (item.customAccessCheck) return item.customAccessCheck();
      return hasPermission(item.module, item.permission);
    });

  const visibleNavItems = filterItems(MENU_CONFIG[MENU_GROUPS.REGULAR]);
  const visibleAdminItems = isSuperAdmin ? filterItems(MENU_CONFIG[MENU_GROUPS.ADMIN]) : [];
  const hasAdminAccess = visibleAdminItems.length > 0;

  const ticketsMenuItem = visibleNavItems.find((item) => item.name === "Tickets");
  const visibleTicketsChildren = ticketsMenuItem?.children
    ? filterItems(ticketsMenuItem.children)
    : [];
  const isTicketsRouteActive = visibleTicketsChildren.some((child) =>
    isNavItemActive(child.path, location.pathname)
  );

  const isAccessRouteActive = visibleAdminItems.some((item) => {
    if (isNavItemActive(item.path, location.pathname)) return true;
    return item.children?.some((child) => isNavItemActive(child.path, location.pathname));
  });

  /** Sync open group to current route; only one top-level section expanded at a time. */
  useEffect(() => {
    if (permsLoading) return;
    const navItems = filterItems(MENU_CONFIG[MENU_GROUPS.REGULAR]);
    const adminItems = isSuperAdmin ? filterItems(MENU_CONFIG[MENU_GROUPS.ADMIN]) : [];
    const ticketsMenu = navItems.find((item) => item.name === "Tickets");
    const ticketsChildren = ticketsMenu?.children ? filterItems(ticketsMenu.children) : [];
    const { top, nested } = resolveExpandedFromRoute(
      location.pathname,
      ticketsChildren,
      adminItems
    );
    setExpandedTopKey(top);
    setExpandedNestedKey(nested);
  }, [location.pathname, permsLoading, isSuperAdmin]);

  const toggleTopGroup = (groupKey) => {
    setExpandedTopKey((prev) => {
      if (prev === groupKey) {
        setExpandedNestedKey(null);
        return null;
      }
      setExpandedNestedKey(null);
      return groupKey;
    });
  };

  const toggleNestedGroup = (groupKey) => {
    setExpandedTopKey("Access");
    setExpandedNestedKey((prev) => (prev === groupKey ? null : groupKey));
  };

  const sidebarStyle = {
    width: `${SIDEBAR_WIDTH}px`,
    top: isDesktop ? 0 : "var(--app-top-nav-height, 60px)",
    bottom: 0,
    height: isDesktop ? "100vh" : "auto",
    zIndex: 1045,
    transition: "transform 0.25s ease",
    transform: open || isDesktop ? "translateX(0)" : "translateX(-100%)",
  };

  return (
      <aside className="enterprise-sidebar enterprise-sidebar--redesign fixed left-0 flex flex-col min-h-0" style={sidebarStyle}>
        <div className="absolute inset-0 pointer-events-none enterprise-sidebar-surface" />
        <div className="enterprise-sidebar__inner relative flex flex-col h-full">
          <div className="enterprise-sidebar__brand">
            <NavLink to="/" end className="enterprise-sidebar__brand-link" onClick={onClose} aria-label="Master Minds home">
              <Logo variant="icon" size="auto" className="enterprise-sidebar__logo" />
              <span className="enterprise-sidebar__brand-name">Master Minds</span>
            </NavLink>
          </div>
          <div className="flex-1 overflow-y-auto enterprise-nav-scroll">
            {permsLoading ? (
              <div className="kz-sidebar-skeleton px-3 py-4 flex flex-col gap-3 animate-pulse">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-200" />
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-200" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            ) : (
              <nav className="kz-nav-stack" aria-label="Main navigation">
                <div className="kz-nav-section">
                {visibleNavItems.map((item) => {
                  if (item.children?.length) {
                    const visibleChildren = filterItems(item.children);
                    if (visibleChildren.length === 0) return null;

                    const childActive = visibleChildren.some((child) =>
                      isNavItemActive(child.path, location.pathname)
                    );

                    return (
                      <NavGroup
                        key={item.name}
                        title={item.name}
                        icon={item.icon || IconTaskSquare}
                        isOpen={expandedTopKey === item.name}
                        onToggle={() => toggleTopGroup(item.name)}
                        isActive={childActive}
                      >
                        {visibleChildren.map((child) => (
                          <NavItem
                            key={child.path}
                            item={child}
                            isChild
                            onClose={onClose}
                          />
                        ))}
                      </NavGroup>
                    );
                  }

                  return (
                    <NavItem
                      key={item.path}
                      item={{
                        ...item,
                        icon: item.icon || IconTaskSquare,
                      }}
                      onClose={onClose}
                    />
                  );
                })}

                {hasAdminAccess && (
                  <NavGroup
                    title="Access"
                    icon={IconGear}
                    isOpen={expandedTopKey === "Access"}
                    onToggle={() => toggleTopGroup("Access")}
                    isActive={isAccessRouteActive}
                  >
                    {visibleAdminItems.map((item) => {
                      const name = String(item.name).toLowerCase();
                      let icon = IconUsers;
                      if (name.includes("user") && !name.includes("workflow")) icon = IconUser;
                      if (name.includes("role")) icon = IconKey;
                      if (name.includes("email")) icon = Mail;
                      else if (name.includes("workflow")) icon = GitBranch;

                      if (item.children?.length) {
                        const groupKey = `Access-${item.name}`;
                        const childActive = item.children.some((c) =>
                          isNavItemActive(c.path, location.pathname)
                        );
                        return (
                          <NavGroup
                            key={item.path || item.name}
                            title={item.name}
                            icon={icon}
                            nested
                            isOpen={expandedTopKey === "Access" && expandedNestedKey === groupKey}
                            onToggle={() => toggleNestedGroup(groupKey)}
                            isActive={childActive}
                          >
                            {item.children.map((child) => (
                              <NavItem
                                key={child.path}
                                item={{ ...child, icon: null }}
                                isChild
                                onClose={onClose}
                              />
                            ))}
                          </NavGroup>
                        );
                      }

                      return (
                        <NavItem
                          key={item.path}
                          item={{ ...item, icon }}
                          isChild
                          onClose={onClose}
                        />
                      );
                    })}
                  </NavGroup>
                )}
                </div>
              </nav>
            )}
          </div>
        </div>
      </aside>
  );
}
