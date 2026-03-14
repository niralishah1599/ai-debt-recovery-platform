import Link from "next/link";

import { listDebtorPortalAccounts } from "@/services/debtor-portal-service";
import { formatDateLabel } from "@/utils/format-date";
import { formatCurrency } from "@/utils/format-number";

export default async function DebtorAccountsPage() {
  const accounts = await listDebtorPortalAccounts();

  return (
    <>
      <section className="panel panel-body" style={{ borderTop: "2px solid var(--accent)" }}>
        <span className="eyebrow eyebrow-soft">Accounts</span>
        <h1 className="heading-xl">Your Accounts</h1>
        <p className="body-copy">
          Review each account linked to your profile, including the responsible client, account
          state, and current balance. Select an active account to make a payment.
        </p>
      </section>

      <section className="panel panel-body">
        <div className="record-stack">
          {accounts.map((account) => {
            const balance         = Number(account.balance);
            const originalBalance = Number(account.original_balance);
            const paid            = originalBalance > 0 ? originalBalance - balance : 0;
            const pctPaid         = originalBalance > 0 ? Math.min(100, (paid / originalBalance) * 100) : 0;
            const isPaid          = account.status === "paid";

            return (
              <article className="record-card" key={account.id}>
                <div className="split">
                  <strong>{account.clients?.name ?? "Unknown client"}</strong>
                  <span className="chip" data-status={account.status}>{account.status}</span>
                </div>

                {/* Progress bar */}
                <div style={{ margin: "10px 0 6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Repayment Progress
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: isPaid ? "var(--success)" : "var(--fg)" }}>
                      {pctPaid.toFixed(0)}%
                    </span>
                  </div>
                  <div style={{
                    height: "8px",
                    borderRadius: "99px",
                    background: "var(--bg-overlay)",
                    overflow: "hidden",
                    border: "1px solid var(--line-soft)",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${pctPaid}%`,
                      borderRadius: "99px",
                      background: isPaid
                        ? "var(--success)"
                        : pctPaid >= 75
                          ? "var(--teal)"
                          : pctPaid >= 50
                            ? "var(--accent)"
                            : "var(--amber)",
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
                    <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                      Paid {formatCurrency(paid)}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                      {isPaid ? "Fully cleared" : `${formatCurrency(balance)} remaining`}
                    </span>
                  </div>
                </div>

                {/* Milestone markers */}
                <div style={{ display: "flex", gap: "6px", margin: "4px 0 8px", flexWrap: "wrap" }}>
                  {[
                    { pct: 25,  label: "25%",  color: "var(--amber)" },
                    { pct: 50,  label: "50%",  color: "var(--accent)" },
                    { pct: 75,  label: "75%",  color: "var(--teal)" },
                    { pct: 100, label: "100%", color: "var(--success)" },
                  ].map(({ pct, label, color }) => (
                    <span key={pct} style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      padding: "2px 7px",
                      borderRadius: "99px",
                      border: `1px solid ${pctPaid >= pct ? color : "var(--line-soft)"}`,
                      color: pctPaid >= pct ? color : "var(--muted)",
                      background: pctPaid >= pct ? `color-mix(in srgb, ${color} 12%, transparent)` : "transparent",
                    }}>
                      {label}
                    </span>
                  ))}
                </div>

                <div className="record-meta">
                  <span className="muted">Created {formatDateLabel(account.created_at)}</span>
                  {account.status === "active" ? (
                    <Link
                      href="/debtor/payments"
                      className="button-secondary"
                      style={{ fontSize: "12px", padding: "3px 10px" }}
                    >
                      Pay Now
                    </Link>
                  ) : (
                    <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: 600 }}>Paid off</span>
                  )}
                </div>
              </article>
            );
          })}
          {accounts.length === 0 ? (
            <div className="status-note">No accounts are currently visible for this debtor profile.</div>
          ) : null}
        </div>
      </section>
    </>
  );
}
