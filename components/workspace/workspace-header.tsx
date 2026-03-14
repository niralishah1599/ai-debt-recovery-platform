"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ICONS: Record<string, React.ReactNode> = {
  "/staff/dashboard": (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  ),
  "/staff/clients": (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="10" rx="2" />
      <path d="M5 7h6M5 10h4" strokeLinecap="round" />
    </svg>
  ),
  "/staff/debtors": (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" strokeLinecap="round" />
    </svg>
  ),
  "/staff/accounts": (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12M2 8h8M2 12h5" strokeLinecap="round" />
      <circle cx="12.5" cy="11.5" r="2.5" />
      <path d="M12.5 10v1.5l1 1" strokeLinecap="round" />
    </svg>
  ),
  "/staff/campaigns": (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4l10 4L2 12V4z" />
      <path d="M12 8h2M10.5 5.5l1.5-1.5M10.5 10.5l1.5 1.5" strokeLinecap="round" />
    </svg>
  ),
  "/staff/compliance": (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1L2 3.5v4C2 11.5 5 14.5 8 15c3-.5 6-3.5 6-7.5v-4L8 1z" />
      <path d="M5.5 8l2 2 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/staff/analytics": (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 12l4-5 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/client/dashboard": (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  ),
  "/client/accounts": (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12M2 8h8M2 12h5" strokeLinecap="round" />
    </svg>
  ),
  "/client/payments": (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="4" width="14" height="9" rx="2" />
      <path d="M1 7h14" strokeLinecap="round" />
      <circle cx="4.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  "/client/campaigns": (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4l10 4L2 12V4z" />
      <path d="M12 8h2" strokeLinecap="round" />
    </svg>
  ),
  "/debtor/dashboard": (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  ),
  "/debtor/accounts": (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12M2 8h8M2 12h5" strokeLinecap="round" />
    </svg>
  ),
  "/debtor/payments": (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="4" width="14" height="9" rx="2" />
      <path d="M1 7h14" strokeLinecap="round" />
    </svg>
  ),
};

const PAGE_LABELS: Record<string, string> = {
  "/staff/dashboard":  "Dashboard",
  "/staff/clients":    "Clients",
  "/staff/debtors":    "Debtors",
  "/staff/accounts":   "Accounts",
  "/staff/campaigns":  "Campaigns",
  "/staff/compliance": "Compliance",
  "/staff/analytics":  "Analytics",
  "/client/dashboard": "Dashboard",
  "/client/accounts":  "Accounts",
  "/client/payments":  "Payments",
  "/client/campaigns": "Campaigns",
  "/debtor/dashboard": "Dashboard",
  "/debtor/accounts":  "Accounts",
  "/debtor/payments":  "Payments",
};

function getInitials(email: string): string {
  const local = email.split("@")[0];
  const parts  = local.split(/[._\-+]/);
  return parts
    .slice(0, 2)
    .map((p) => (p[0] ?? "").toUpperCase())
    .join("");
}

/* ── Sidebar only ───────────────────────────────────────────────── */
export function WorkspaceHeader({
  email,
  role,
  links = [],
}: {
  email: string;
  role: "staff" | "client" | "debtor";
  links?: Array<{ href: string; label: string }>;
}) {
  const pathname = usePathname();

  const portalLabel =
    role === "staff" ? "Operations" : role === "client" ? "Client Portal" : "Debtor Portal";

  return (
    <aside className="sidebar" aria-label="Main navigation">
      {/* Brand */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2L3 5.5V10c0 4.5 3 7.5 7 8 4-.5 7-3.5 7-8V5.5L10 2z"
                fill="var(--accent)"
                opacity="0.9"
              />
              <path
                d="M7 10.5l2.5 2.5L13 8"
                stroke="var(--bg)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">NextGen AI Debt Recovery Platform</span>
            <span className="sidebar-brand-sub">{portalLabel}</span>
          </div>
        </div>

        {/* AI pulse */}
        <div className="ai-status" role="status" aria-label="AI engine active">
          <span className="ai-dot" aria-hidden="true" />
          <span className="ai-status-label">DIGITAL-FIRST RECOVERY</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav" aria-label="Workspace sections">
        <span className="nav-group-label">Menu</span>
        <div className="sub-nav">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="sub-nav-link"
                data-active={active ? "true" : "false"}
                aria-current={active ? "page" : undefined}
              >
                {NAV_ICONS[link.href] ?? (
                  <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="8" cy="8" r="5" />
                  </svg>
                )}
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer: user + signout */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar" aria-hidden="true">
            {getInitials(email)}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-email" title={email}>{email}</span>
            <span className={`role-badge role-badge-${role}`}>{role}</span>
          </div>
        </div>

        <form action="/api/auth/signout" method="post">
          <button className="sidebar-signout" type="submit">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M6 3H3a1 1 0 00-1 1v8a1 1 0 001 1h3M10 5l3 3-3 3M13 8H6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

/* ── Topbar (rendered inside content-shell by PortalShell) ──────── */
export function WorkspaceTopbar({
  email,
  role,
}: {
  email: string;
  role: "staff" | "client" | "debtor";
}) {
  const pathname   = usePathname();
  const pageLabel  = PAGE_LABELS[pathname] ?? "Workspace";
  const portalLabel =
    role === "staff" ? "Operations" : role === "client" ? "Client Portal" : "Debtor Portal";

  return (
    <header className="topbar" role="banner">
      <nav className="topbar-breadcrumb" aria-label="Breadcrumb">
        <span className="topbar-section">{portalLabel}</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" style={{ opacity: 0.35 }}>
          <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="topbar-page">{pageLabel}</span>
      </nav>

      <div className="topbar-right">
        <span className={`role-badge role-badge-${role}`}>{role}</span>
        <span className="topbar-email">{email}</span>
      </div>
    </header>
  );
}
