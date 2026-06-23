import { KZ } from "./designTokens";
import { MODULE_ICONS } from "./moduleIcons";
import { CheckSquare, GitBranch, Home, LayoutDashboard, Mail, PenLine, Ticket, User } from "lucide-react";

export const MENU_GROUPS = {
  REGULAR: "regular",
  ADMIN: "admin",
};

export const MENU_CONFIG = {
  [MENU_GROUPS.REGULAR]: [
    {
      name: "Home",
      path: "/",
      icon: Home,
      module: "home",
      permission: "retrieve",
      alwaysVisible: true,
    },
    {
      name: "Dashboard",
      path: "/tasks/dashboard",
      icon: LayoutDashboard,
      module: "kaizen_tasks",
      permission: "retrieve",
    },
    {
      name: "Tickets",
      icon: CheckSquare,
      module: "kaizen_tasks",
      permission: "retrieve",
      children: [
        {
          name: "All Tickets",
          path: "/tasks",
          icon: Ticket,
          module: "kaizen_tasks",
          permission: "retrieve",
        },
        {
          name: "My Tickets",
          path: "/tasks/my",
          icon: User,
          module: "kaizen_tasks",
          permission: "retrieve",
        },
        {
          name: "Raised Tickets",
          path: "/tasks/raised-by-me",
          icon: PenLine,
          module: "kaizen_tasks",
          permission: "retrieve",
        },
      ],
    },
  ],
  [MENU_GROUPS.ADMIN]: [
    {
      name: "Teams",
      path: "/teams",
      icon: MODULE_ICONS.users,
      module: "teams",
      permission: "retrieve",
      superAdminOnly: true,
    },
    {
      name: "Users",
      path: "/users",
      icon: MODULE_ICONS.users,
      module: "users",
      permission: "retrieve",
      superAdminOnly: true,
    },
    {
      name: "Roles",
      path: "/roles",
      icon: MODULE_ICONS.roles,
      module: "roles",
      permission: "retrieve",
      superAdminOnly: true,
    },
    {
      name: "Workflows",
      path: "/workflows/definitions",
      icon: GitBranch,
      module: "workflows",
      permission: "retrieve",
      superAdminOnly: true,
    },
    {
      name: "Email Configuration",
      path: "/email/configuration",
      icon: Mail,
      module: "email",
      permission: "retrieve",
      superAdminOnly: true,
    },
    {
      name: "Email Notifications",
      path: "/email/notifications",
      icon: Mail,
      module: "email",
      permission: "retrieve",
      superAdminOnly: true,
    },
    {
      name: "Email Templates",
      path: "/email/templates",
      icon: Mail,
      module: "email",
      permission: "retrieve",
      superAdminOnly: true,
    },
  ],
};
