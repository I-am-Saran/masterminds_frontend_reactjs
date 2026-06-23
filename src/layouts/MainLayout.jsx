import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import TopNavBar from "../components/TopNavBar";
import Sidebar from "../components/Sidebar";
import { SIDEBAR_WIDTH } from "../constants/layout";
import "../styles/app-shell-layout.css";

export default function MainLayout() {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    console.log("[MainLayout] mounted");
    return () => console.log("[MainLayout] unmounted");
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    document.body.classList.remove("auth-page-active");
  }, []);

  const columnStyle = isDesktop
    ? {
        marginLeft: SIDEBAR_WIDTH,
        width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
      }
    : {
        marginLeft: 0,
        width: "100%",
      };

  return (
    <div className="app-shell" style={{ "--sidebar-width": `${SIDEBAR_WIDTH}px` }}>
      <Sidebar open={open} onClose={() => setOpen(false)} isDesktop={isDesktop} />

      {open && !isDesktop && (
        <div
          className="app-shell-overlay d-md-none"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="app-shell-main" style={columnStyle}>
        <TopNavBar
          showMenuButton={!isDesktop}
          onMenuToggle={() => setOpen(true)}
        />

        <main className="app-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
