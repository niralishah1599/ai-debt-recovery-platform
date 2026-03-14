import { listDebtorPortalAccounts } from "@/services/debtor-portal-service";
import { listDebtorPortalPayments } from "@/services/debtor-portal-service";
import { formatDateTimeLabel } from "@/utils/format-date";
import { formatCurrency } from "@/utils/format-number";

import { submitPaymentAction } from "./actions";

export default async function DebtorPaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const params  = searchParams ? await searchParams : {};
  const error   = params.error   ? decodeURIComponent(params.error) : null;
  const success = params.success === "1";

  const [accounts, payments] = await Promise.all([
    listDebtorPortalAccounts(),
    listDebtorPortalPayments(),
  ]);

  const activeAccounts = accounts.filter((a) => a.status === "active");
  const totalOutstanding = activeAccounts.reduce((sum, a) => sum + Number(a.balance), 0);

  return (
    <>
      {/* ── Header ── */}
      <section className="panel panel-body" style={{ borderTop: "2px solid var(--accent)" }}>
        <span className="eyebrow eyebrow-soft">Payments</span>
        <h1 className="heading-xl">Make a Payment</h1>
        <p className="body-copy">
          Pay down your outstanding balance securely. Payments are applied immediately and
          your account balance is updated in real time.
        </p>
      </section>

      {/* ── Outstanding summary ── */}
      <section className="metric-grid" aria-label="Balance summary">
        <article className="metric-card metric-card-danger">
          <span className="metric-label">Total Outstanding</span>
          <span className="metric-value">{formatCurrency(totalOutstanding)}</span>
          <span className="metric-delta">Across {activeAccounts.length} active account{activeAccounts.length !== 1 ? "s" : ""}</span>
        </article>
        <article className="metric-card metric-card-success">
          <span className="metric-label">Payments Made</span>
          <span className="metric-value">{payments.filter((p) => p.payment_status === "succeeded").length}</span>
          <span className="metric-delta">Successful transactions</span>
        </article>
        <article className="metric-card metric-card-teal">
          <span className="metric-label">Accounts Cleared</span>
          <span className="metric-value">{accounts.filter((a) => a.status === "paid").length}</span>
          <span className="metric-delta">Fully paid off</span>
        </article>
      </section>

      <div className="two-column-grid">
        {/* ── Payment form ── */}
        <section className="panel panel-body">
          <h2 className="section-title">Payment Details</h2>

          {success && (
            <div className="success-note" style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="8" cy="8" r="7" />
                <path d="M5 8.5l2.5 2L11 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Payment submitted successfully. Your balance has been updated.
            </div>
          )}

          {error && (
            <div className="error-note" style={{ marginBottom: "16px" }}>
              {error}
            </div>
          )}

          {activeAccounts.length === 0 ? (
            <div className="status-note">
              You have no active accounts with an outstanding balance. All accounts are cleared.
            </div>
          ) : (
            <form action={submitPaymentAction} className="form-stack">
              {/* Account selector */}
              <div className="field">
                <label htmlFor="accountId">Select Account</label>
                <select id="accountId" name="accountId" required defaultValue="">
                  <option value="" disabled>Choose an account…</option>
                  {activeAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.clients?.name ?? "Unknown client"} — Balance {formatCurrency(Number(account.balance))}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="field">
                <label htmlFor="amount">Payment Amount (USD)</label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
                <span className="helper-text">Enter the amount you wish to pay. Cannot exceed account balance.</span>
              </div>

              {/* Card info — UI only */}
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--line-strong)",
                  background: "var(--bg-raised)",
                  display: "grid",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "2px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                    }}
                  >
                    Card Information
                  </span>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {/* Visa */}
                    <div style={{ padding: "2px 6px", borderRadius: "4px", background: "var(--bg-overlay)", border: "1px solid var(--line-strong)", fontSize: "10px", fontWeight: 800, color: "#1a56f0", letterSpacing: "0.05em" }}>VISA</div>
                    {/* MC */}
                    <div style={{ display: "flex", gap: "0" }}>
                      <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#eb001b", opacity: 0.9 }} />
                      <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#f79e1b", opacity: 0.9, marginLeft: "-5px" }} />
                    </div>
                  </div>
                </div>

                <div className="field" style={{ gap: "4px" }}>
                  <label htmlFor="cardName">Name on Card</label>
                  <input
                    id="cardName"
                    name="cardName"
                    type="text"
                    placeholder="John Smith"
                    autoComplete="cc-name"
                    required
                  />
                </div>

                <div className="field" style={{ gap: "4px" }}>
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    autoComplete="cc-number"
                    required
                    style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="field" style={{ gap: "4px" }}>
                    <label htmlFor="cardExpiry">Expiry Date</label>
                    <input
                      id="cardExpiry"
                      name="cardExpiry"
                      type="text"
                      placeholder="MM / YY"
                      maxLength={7}
                      autoComplete="cc-exp"
                      required
                      style={{ fontFamily: "var(--font-mono)" }}
                    />
                  </div>
                  <div className="field" style={{ gap: "4px" }}>
                    <label htmlFor="cardCvv">CVV</label>
                    <input
                      id="cardCvv"
                      name="cardCvv"
                      type="text"
                      placeholder="•••"
                      maxLength={4}
                      autoComplete="cc-csc"
                      required
                      style={{ fontFamily: "var(--font-mono)" }}
                    />
                  </div>
                </div>
              </div>

              {/* Reference (auto-generated hint) */}
              <div className="field">
                <label htmlFor="paymentReference">Payment Reference <span style={{ color: "var(--muted)", fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
                <input
                  id="paymentReference"
                  name="paymentReference"
                  type="text"
                  placeholder="e.g. INV-2026-001"
                />
              </div>

              {/* Secure notice */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "9px 12px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--success-soft)",
                  border: "1px solid rgba(34,197,94,0.18)",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="var(--success)" strokeWidth="1.5" aria-hidden="true">
                  <rect x="3" y="7" width="10" height="8" rx="1.5" />
                  <path d="M5 7V5a3 3 0 016 0v2" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: 500 }}>
                  Payments are processed securely. Your balance updates immediately.
                </span>
              </div>

              <button className="button" type="submit" style={{ width: "100%", minHeight: "42px", fontSize: "14px" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" />
                  <path d="M8 5v3l2 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Submit Payment
              </button>
            </form>
          )}
        </section>

        {/* ── Payment history ── */}
        <section className="panel panel-body">
          <h2 className="section-title">Payment History ({payments.length})</h2>
          <div className="record-stack">
            {payments.map((payment) => (
              <article className="record-card" key={payment.id}>
                <div className="split">
                  <strong style={{ fontFamily: "var(--font-mono)", fontSize: "1.05rem" }}>
                    {formatCurrency(Number(payment.amount))}
                  </strong>
                  <span className="chip" data-status={payment.payment_status}>
                    {payment.payment_status}
                  </span>
                </div>
                <p className="body-copy" style={{ fontSize: "12.5px" }}>
                  Ref: {payment.payment_reference ?? "—"} · Account balance after:{" "}
                  {payment.accounts ? formatCurrency(Number(payment.accounts.balance)) : "—"}
                </p>
                <div className="record-meta">
                  <span className="muted">
                    {payment.accounts ? `Status: ${payment.accounts.status}` : "No account"}
                  </span>
                  <span className="muted">{formatDateTimeLabel(payment.created_at)}</span>
                </div>
              </article>
            ))}
            {payments.length === 0 && (
              <div className="status-note">No payments recorded yet. Use the form to make your first payment.</div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
