import Link from "next/link";

import {
  getDebtorGamificationSummary,
  getDebtorPortalSummary,
  listDebtorPortalMessages,
  listDebtorPortalPayments,
  type MilestoneKey,
} from "@/services/debtor-portal-service";
import { formatDateTimeLabel } from "@/utils/format-date";
import { formatCurrency } from "@/utils/format-number";

const MILESTONE_META: Record<MilestoneKey, { label: string; description: string; points: number; icon: string }> = {
  first_payment:  { label: "First Step",     description: "Made your first payment",         points: 10,  icon: "⚡" },
  quarter_way:    { label: "Quarter Way",     description: "25% of balance cleared",           points: 25,  icon: "🎯" },
  halfway:        { label: "Halfway There",   description: "50% of balance cleared",           points: 50,  icon: "🔥" },
  almost_free:    { label: "Almost Free",     description: "75% of balance cleared",           points: 75,  icon: "🚀" },
  debt_free:      { label: "Debt Free",       description: "Account fully paid off",           points: 100, icon: "🏆" },
};

const MILESTONE_ORDER: MilestoneKey[] = ["first_payment", "quarter_way", "halfway", "almost_free", "debt_free"];

export default async function DebtorDashboardPage() {
  const [summary, payments, messages, gamification] = await Promise.all([
    getDebtorPortalSummary(),
    listDebtorPortalPayments(5),
    listDebtorPortalMessages(5),
    getDebtorGamificationSummary(),
  ]);

  const earnedKeys = new Set(gamification.milestones.map((m) => m.milestone_key));

  return (
    <>
      <section className="panel panel-body">
        <span className="eyebrow eyebrow-soft">Debtor portal</span>
        <h1 className="heading-lg" >
          {summary.debtorName}
        </h1>
        <p className="body-copy">
          Review your accounts, current balances, payment history, and recent communications.
          Use the Payments section to make a payment and reduce your outstanding balance.
        </p>
      </section>

      <section className="metric-grid">
        <article className="metric-card metric-card-emphasis">
          <span className="metric-label">Outstanding balance</span>
          <span className="metric-value">{formatCurrency(summary.outstandingBalance)}</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Active accounts</span>
          <span className="metric-value">{summary.activeAccounts}</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Paid accounts</span>
          <span className="metric-value">{summary.paidAccounts}</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Successful payments</span>
          <span className="metric-value">{summary.successfulPayments}</span>
        </article>
      </section>

      {/* ── Rewards & Milestones ── */}
      <section className="panel panel-body">
        <div className="split" style={{ marginBottom: "16px" }}>
          <div>
            <span className="eyebrow eyebrow-soft">Rewards Program</span>
            <h2 className="section-title" style={{ marginTop: "2px" }}>Your Progress</h2>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 18px",
            borderRadius: "var(--radius-lg)",
            background: "var(--bg-overlay)",
            border: "1px solid var(--line-strong)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--amber)", lineHeight: 1 }}>
                {gamification.totalPoints}
              </div>
              <div style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Total Points
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
          {MILESTONE_ORDER.map((key) => {
            const meta    = MILESTONE_META[key];
            const earned  = earnedKeys.has(key);
            const earnedAt = gamification.milestones.find((m) => m.milestone_key === key)?.awarded_at;
            return (
              <div key={key} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                padding: "16px 10px",
                borderRadius: "var(--radius-lg)",
                border: `1px solid ${earned ? "var(--amber)" : "var(--line-soft)"}`,
                background: earned ? "rgba(245,158,11,0.07)" : "var(--bg-raised)",
                opacity: earned ? 1 : 0.5,
                textAlign: "center",
                transition: "opacity 0.2s",
              }}>
                <span style={{ fontSize: "28px", lineHeight: 1 }} aria-hidden="true">
                  {earned ? meta.icon : "🔒"}
                </span>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: earned ? "var(--fg)" : "var(--muted)" }}>
                    {meta.label}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "2px" }}>
                    {meta.description}
                  </div>
                </div>
                <div style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: earned ? "var(--amber)" : "var(--muted)",
                  background: earned ? "rgba(245,158,11,0.12)" : "var(--bg-overlay)",
                  padding: "2px 8px",
                  borderRadius: "99px",
                }}>
                  +{meta.points} pts
                </div>
                {earned && earnedAt && (
                  <div style={{ fontSize: "10px", color: "var(--muted)" }}>
                    {new Date(earnedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {gamification.totalPoints === 0 && (
          <p className="body-copy" style={{ marginTop: "14px", color: "var(--muted)" }}>
            Make your first payment to start earning rewards and unlocking milestones.
          </p>
        )}
      </section>

      <section className="two-column-grid">
        <div className="panel panel-body">
          <div className="split">
            <h2 className="section-title">Recent payments</h2>
            <Link className="button-secondary" href="/debtor/payments">
              View all payments
            </Link>
          </div>
          <div className="record-stack">
            {payments.map((payment) => (
              <article className="record-card" key={payment.id}>
                <div className="split">
                  <strong>{formatCurrency(Number(payment.amount))}</strong>
                  <span className="chip">{payment.payment_status}</span>
                </div>
                <p className="body-copy">
                  Reference {payment.payment_reference ?? "not recorded"} · Account status{" "}
                  {payment.accounts?.status ?? "unknown"}
                </p>
                <div className="record-meta">
                  <span className="muted">
                    {payment.accounts ? `Balance ${formatCurrency(Number(payment.accounts.balance))}` : "No account"}
                  </span>
                  <span className="muted">{formatDateTimeLabel(payment.created_at)}</span>
                </div>
              </article>
            ))}
            {payments.length === 0 ? (
              <div className="status-note">Payments will appear here once transactions are recorded.</div>
            ) : null}
          </div>
        </div>

        <div className="panel panel-body">
          <div className="split">
            <h2 className="section-title">Recent communications</h2>
            <Link className="button-secondary" href="/debtor/accounts">
              View accounts
            </Link>
          </div>
          <div className="record-stack">
            {messages.map((message) => (
              <article className="record-card" key={message.id}>
                <div className="split">
                  <strong>{message.campaigns?.name ?? "Unknown campaign"}</strong>
                  <span className="chip">{message.status}</span>
                </div>
                <p className="body-copy">
                  {message.channel} ·{" "}
                  {message.accounts ? `Account balance ${formatCurrency(Number(message.accounts.balance))}` : "No account linked"}
                </p>
                <div className="record-meta">
                  <span className="muted">
                    {message.sent_at ? formatDateTimeLabel(message.sent_at) : "Not sent yet"}
                  </span>
                </div>
              </article>
            ))}
            {messages.length === 0 ? (
              <div className="status-note">Communications will appear here after campaign messages are sent.</div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
