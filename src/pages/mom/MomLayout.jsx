import React from "react";
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { Typography } from "@material-tailwind/react";
import { THEME_COLORS } from "../../constants/colors";

const PAGE_TITLES = {
  "/mom": "Meetings",
};

export default function MomLayout() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const legacyViewId = searchParams.get("view");

  if (legacyViewId) {
    return <Navigate to={`/mom/${encodeURIComponent(legacyViewId)}`} replace />;
  }

  const pathParts = location.pathname.split("/").filter(Boolean);
  const momSegment = pathParts[1];
  const isMeetingDetailPage = pathParts[0] === "mom" && momSegment && momSegment !== "mom";

  const pageTitle = PAGE_TITLES[location.pathname] || (isMeetingDetailPage ? "Meetings" : "Minutes of Meeting");

  return (
    <div className="app-page-shell p-4 md:p-6 w-full min-w-0 max-w-full box-border">
      <div className="mb-4">
        <Typography variant="h4" className="font-bold" style={{ color: THEME_COLORS.deepBlue }}>
          {pageTitle}
        </Typography>
        <p className="text-sm mt-1" style={{ color: THEME_COLORS.copper }}>
          Track meetings, action items, and follow-ups
        </p>
      </div>
      <Outlet />
    </div>
  );
}
