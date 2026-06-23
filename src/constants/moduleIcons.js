import React from "react";
import { LayoutDashboard, Users, UserCog } from "lucide-react";

export function TaskSquareIcon({ size = 16, className, color, style }) {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip_task_sq)">
      <path d="M12.37 8.88086H17.62" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6.38 8.88086L7.13 9.63086L9.38 7.38086" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12.37 15.8809H17.62" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6.38 15.8809L7.13 16.6309L9.38 14.3809" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip_task_sq">
        <rect width="24" height="24" fill="none"/>
      </clipPath>
    </defs>
  </svg>`;
  return React.createElement('span', {
    'aria-hidden': 'true',
    className,
    style: { display: 'inline-block', width: size, height: size, lineHeight: 0, color, ...(style || {}) },
    dangerouslySetInnerHTML: { __html: svg },
  });
}

export const MODULE_ICONS = {
  tasks: TaskSquareIcon,
  users: Users,
  roles: UserCog,
  dashboard: LayoutDashboard,
};

export function getModuleIcon(moduleName) {
  const normalizedName = moduleName.toLowerCase().replace(/[-\s]/g, "_");
  return MODULE_ICONS[normalizedName] || LayoutDashboard;
}
