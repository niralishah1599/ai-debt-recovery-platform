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
          {accounts.map((account) => (
            <article className="record-card" key={account.id}>
              <div className="split">
                <strong>{account.clients?.name ?? "Unknown client"}</strong>
                <span className="chip" data-status={account.status}>{account.status}</span>
              </div>
              <p className="body-copy">Current balance {formatCurrency(Number(account.balance))}</p>
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
                  <span className="muted" style={{ color: "var(--success)" }}>Paid off</span>
                )}
              </div>
            </article>
          ))}
          {accounts.length === 0 ? (
            <div className="status-note">No accounts are currently visible for this debtor profile.</div>
          ) : null}
        </div>
      </section>
    </>
  );
}
