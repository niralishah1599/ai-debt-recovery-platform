import Link from "next/link";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  asideTitle: string;
  asideBody: string;
  alternateHref: string;
  alternateLabel: string;
};

const FEATURES = [
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 4l10 4L2 12V4z" />
        <path d="M12 8h2M10.5 5.5l1.5-1.5M10.5 10.5l1.5 1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Automated Outreach",
    body: "AI-triggered email and SMS campaigns reach borrowers at the right time, on the right channel — without manual effort from your team.",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 1L2 3.5v4C2 11.5 5 14.5 8 15c3-.5 6-3.5 6-7.5v-4L8 1z" />
        <path d="M5.5 8l2 2 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Built-in Compliance",
    body: "Every message is automatically validated against your compliance rules — quiet hours, consent checks, and account eligibility — before it is ever sent.",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 12l4-5 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Recovery Analytics",
    body: "Track collection rates, payment recovery, delivery performance, and compliance pressure across all your portfolios in one real-time dashboard.",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="5" r="3" />
        <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" strokeLinecap="round" />
      </svg>
    ),
    title: "Borrower-First Experience",
    body: "Self-serve payment options, clear account summaries, and respectful communication preserve consumer relationships while improving recovery outcomes.",
  },
];

export function AuthShell({
  title,
  description,
  children,
  asideTitle,
  asideBody,
  alternateHref,
  alternateLabel,
}: AuthShellProps) {
  return (
    <main className="shell auth-shell" id="main-content">
      <div className="hero-grid auth-grid">

        {/* ── Left panel — product content ── */}
        <section className="hero-card" style={{ background: "var(--bg-surface)", border: "1px solid var(--line-strong)" }}>
          {/* Brand header */}
          <div
            style={{
              padding: "28px 28px 24px",
              borderBottom: "1px solid var(--line)",
              background: "linear-gradient(to bottom, var(--bg-elevated), var(--bg-surface))",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <div
                style={{
                  width: "30px", height: "30px",
                  borderRadius: "7px",
                  background: "var(--bg-overlay)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L3 5.5V10c0 4.5 3 7.5 7 8 4-.5 7-3.5 7-8V5.5L10 2z" fill="var(--accent)" opacity="0.9" />
                  <path d="M7 10.5l2.5 2.5L13 8" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>
                  NextGen AI Debt Recovery
                </div>
                <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 500 }}>
                  Digital-first collections platform
                </div>
              </div>
            </div>

            <h1 className="heading-xl" style={{ marginBottom: "10px" }}>
              Smart Debt Recovery
            </h1>
            <p className="body-copy" style={{ fontSize: "13.5px" }}>
              The end-to-end platform for modern debt recovery — combining AI-driven outreach,
              automated compliance enforcement, and full payment tracking so your team collects
              more while doing less manual work.
            </p>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              borderBottom: "1px solid var(--line)",
            }}
          >
            {[
              { value: "3×", label: "Recovery lift", sub: "vs. legacy methods" },
              { value: "100%", label: "Compliance", sub: "automated pre-send" },
              { value: "24 hr", label: "First contact", sub: "from assignment" },
            ].map((s, i) => (
              <div
                key={s.label}
                style={{
                  padding: "14px 16px",
                  borderRight: i < 2 ? "1px solid var(--line)" : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    color: "var(--accent)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    marginBottom: "3px",
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {s.label}
                </div>
                <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "1px" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{ padding: "20px 24px" }}>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: "14px",
              }}
            >
              What you get
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              {FEATURES.map((f) => (
                <div key={f.title} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "28px", height: "28px",
                      borderRadius: "6px",
                      background: "var(--accent-soft)",
                      border: "1px solid rgba(59,130,246,0.18)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      color: "var(--accent)",
                      marginTop: "1px",
                    }}
                    aria-hidden="true"
                  >
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)", marginBottom: "2px" }}>
                      {f.title}
                    </div>
                    <p className="body-copy" style={{ fontSize: "12px" }}>{f.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Aside content from page */}
            <div
              style={{
                marginTop: "18px",
                padding: "14px 16px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-raised)",
                border: "1px solid var(--line-strong)",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--ink)", marginBottom: "5px" }}>
                {asideTitle}
              </div>
              <p className="body-copy" style={{ fontSize: "12px" }}>{asideBody}</p>
            </div>

            <div style={{ marginTop: "14px" }}>
              <Link className="button-secondary" href={alternateHref} style={{ fontSize: "12.5px", minHeight: "32px" }}>
                {alternateLabel}
              </Link>
            </div>
          </div>
        </section>

        {/* ── Right panel — auth form ── */}
        <section className="panel auth-card">
          <span className="eyebrow eyebrow-soft">Secure Access</span>
          <h2 style={{ margin: "12px 0 6px", fontSize: "1.45rem", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--ink)" }}>
            {title}
          </h2>
          <p style={{ margin: "0 0 18px", color: "var(--muted)", fontSize: "13.5px", lineHeight: 1.6 }}>
            {description}
          </p>
          {children}
        </section>

      </div>
    </main>
  );
}
