import Link from "next/link";

import { getStaffDashboardMetrics } from "@/services/staff-dashboard-service";

const MODULES = [
  {
    href: "/staff/clients",
    label: "Client Management",
    description: "Onboard and manage creditor clients. Every recovery portfolio is scoped to a client so your team works multiple creditors from one workspace.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="12" height="10" rx="2" />
        <path d="M5 7h6M5 10h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/staff/debtors",
    label: "Borrower Profiles",
    description: "Maintain verified borrower contact records. Accurate profiles are the foundation for compliant, deliverable outreach across every channel.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="5" r="3" />
        <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/staff/accounts",
    label: "Debt Accounts",
    description: "Track outstanding balances, status changes, and payment progress across the full collection lifecycle — from active to fully resolved.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 4h12M2 8h8M2 12h5" strokeLinecap="round" />
        <circle cx="12.5" cy="11.5" r="2.5" />
        <path d="M12.5 10v1.5l1 1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/staff/campaigns",
    label: "Campaign Engine",
    description: "Send AI-assisted email and SMS outreach at scale. Every message is personalized, timed for maximum response, and logged for full audit visibility.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 4l10 4L2 12V4z" />
        <path d="M12 8h2M10.5 5.5l1.5-1.5M10.5 10.5l1.5 1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/staff/compliance",
    label: "Compliance Engine",
    description: "Automated pre-send rule evaluation enforces quiet hours, consent requirements, and account status checks — so every message sent is legally defensible.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 1L2 3.5v4C2 11.5 5 14.5 8 15c3-.5 6-3.5 6-7.5v-4L8 1z" />
        <path d="M5.5 8l2 2 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/staff/analytics",
    label: "Recovery Analytics",
    description: "Real-time visibility into portfolio recovery rates, payment collection, campaign delivery, and compliance pressure across every client and account.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 12l4-5 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const CAPABILITIES = [
  {
    title: "Automated Multi-Channel Outreach",
    body: "Reach borrowers on the channels they actually respond to. Email and SMS campaigns are triggered automatically based on account status, with send timing optimized for response rates.",
  },
  {
    title: "Compliance-First by Design",
    body: "Every outbound message is evaluated against your compliance rule set before it leaves the platform. Quiet hours, consent status, and account eligibility are checked automatically — no manual review required.",
  },
  {
    title: "Consumer-Friendly Recovery",
    body: "Modern borrowers expect respectful, digital-first communication. The platform replaces aggressive legacy collection tactics with clear messaging, self-serve payment options, and transparent account visibility.",
  },
  {
    title: "Full Audit Trail",
    body: "Every message sent, payment received, compliance decision made, and status change recorded is permanently logged. Give your compliance team and clients complete visibility with no gaps.",
  },
];

export default async function StaffDashboardPage() {
  const metrics = await getStaffDashboardMetrics();

  return (
    <>
      {/* ── Hero ── */}
      <section className="panel" style={{ borderTop: "2px solid var(--accent)", overflow: "hidden" }}>
        <div className="panel-body" style={{ paddingBottom: "0" }}>
          <span className="eyebrow eyebrow-soft">Operations Workspace</span>
          <h1 className="heading-xl" style={{ marginBottom: "10px" }}>
            AI-Powered Debt Recovery
          </h1>
          <p className="body-copy" style={{ maxWidth: "70ch", fontSize: "14px" }}>
            NextGen AI Debt Recovery Platform automates the full collections lifecycle — from
            first borrower contact to final payment — using intelligent outreach, real-time
            compliance validation, and data-driven recovery analytics.
          </p>
        </div>

        {/* Value strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            borderTop: "1px solid var(--line)",
            marginTop: "20px",
          }}
        >
          {[
            { label: "Recovery Rate", value: "Up to 3×", sub: "vs. traditional outreach" },
            { label: "Compliance Coverage", value: "100%", sub: "automated pre-send checks" },
            { label: "First Contact", value: "< 24 hrs", sub: "from account assignment" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              style={{
                padding: "16px 20px",
                borderRight: i < 2 ? "1px solid var(--line)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  color: "var(--accent)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {stat.label}
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--muted)", marginTop: "2px" }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live KPIs ── */}
      <section className="metric-grid" aria-label="Live portfolio metrics">
        <article className="metric-card metric-card-blue">
          <span className="metric-label">Active Clients</span>
          <span className="metric-value">{metrics.clientCount}</span>
          <span className="metric-delta">Creditor portfolios under management</span>
        </article>
        <article className="metric-card metric-card-teal">
          <span className="metric-label">Borrower Profiles</span>
          <span className="metric-value">{metrics.debtorCount}</span>
          <span className="metric-delta">Verified contact records</span>
        </article>
        <article className="metric-card metric-card-amber">
          <span className="metric-label">Total Accounts</span>
          <span className="metric-value">{metrics.accountCount}</span>
          <span className="metric-delta">Across all portfolios</span>
        </article>
        <article className="metric-card metric-card-danger">
          <span className="metric-label">Pending Recovery</span>
          <span className="metric-value">{metrics.activeAccountCount}</span>
          <span className="metric-delta">Active accounts awaiting resolution</span>
        </article>
      </section>

      {/* ── What the platform does ── */}
      <section className="panel panel-body">
        <h2 className="section-title">Platform Capabilities</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1px",
            background: "var(--line)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}
        >
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.title}
              style={{
                padding: "18px 20px",
                background: "var(--bg-raised)",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  marginBottom: "10px",
                }}
                aria-hidden="true"
              />
              <strong style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginBottom: "6px" }}>
                {cap.title}
              </strong>
              <p className="body-copy" style={{ fontSize: "12.5px" }}>
                {cap.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Module navigation ── */}
      <section className="panel panel-body">
        <h2 className="section-title">Workspace Modules</h2>
        <div className="resource-grid">
          {MODULES.map((mod) => (
            <Link key={mod.href} className="resource-card" href={mod.href}>
              <div style={{ color: "var(--accent)" }} aria-hidden="true">
                {mod.icon}
              </div>
              <strong>{mod.label}</strong>
              <p className="body-copy" style={{ fontSize: "12.5px" }}>
                {mod.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
