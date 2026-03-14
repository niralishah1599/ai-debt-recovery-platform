import Link from "next/link";

import {
  getDebtorPortalSummary,
  listDebtorPortalMessages,
  listDebtorPortalPayments,
} from "@/services/debtor-portal-service";
import { formatDateTimeLabel } from "@/utils/format-date";
import { formatCurrency } from "@/utils/format-number";

export default async function DebtorDashboardPage() {
  const [summary, payments, messages] = await Promise.all([
    getDebtorPortalSummary(),
    listDebtorPortalPayments(5),
    listDebtorPortalMessages(5),
  ]);

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
