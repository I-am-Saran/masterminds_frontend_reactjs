/** Global product branding — single source for user-facing product name. */
export const BRAND_NAME = "Master Minds";

export const BRAND_COMPANY = "CITPL";

export const BRAND_VERSION = "2.0";

export const BRAND_LOGIN_VERSION = "1.0";

export const BRAND_TAGLINE = "Enterprise ticketing platform";

export const BRAND_LOGIN_TAGLINE = "Enterprise Ticket & Workflow Platform";

export const BRAND_LOGIN_FOOTER_LINE = "Ticket & Workflow Platform";

export const BRAND_POWERED_BY = `Powered by ${BRAND_NAME}`;

export function brandCopyright(year = new Date().getFullYear()) {
  return `© ${year} ${BRAND_NAME}`;
}

export function brandLoginCopyright(year = new Date().getFullYear()) {
  return `© ${year} ${BRAND_COMPANY}`;
}

/** Page <title> and document branding */
export const BRAND_PAGE_TITLE = "Master Minds | Enterprise Ticket & Workflow Platform";

export const BRAND_DASHBOARD_SEGMENT = "Tickets";

/** localStorage key for remembered login email (UI preference only) */
export const REMEMBER_EMAIL_KEY = "mm_remembered_email";
