import React from "react";
import { Moon, Sun } from "lucide-react";
import { useAppTheme } from "../contexts/AppThemeContext";
/** Sun/Moon toggle — light ↔ dark, persisted in localStorage. */
export default function ThemeToggle() {
  const { toggleTheme, isDarkTheme } = useAppTheme();
  const isDark = isDarkTheme;

  return (
    <button
      type="button"
      className="enterprise-icon-btn enterprise-theme-toggle"
      onClick={toggleTheme}
      title={isDark ? "Light Mode" : "Dark Mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
    >
      {isDark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
    </button>
  );
}
