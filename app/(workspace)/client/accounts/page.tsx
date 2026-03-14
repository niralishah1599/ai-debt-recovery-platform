import { listClientPortalAccounts } from "@/services/client-portal-service";
import { formatDateLabel } from "@/utils/format-date";
import { formatCurrency } from "@/utils/format-number";

export default async function ClientAccountsPage() {
  const accounts = await listClientPortalAccounts();

  return (
    <>
      <section className="panel panel-body">
        <h1 className="heading-lg" >
          Accounts
        </h1>
        <p className="body-copy">
          Review the accounts currently assigned to your portfolio, including debtor identity,
          status, balance, and creation date.
        </p>
      </section>

      <section className="panel panel-body">
        <div className="record-stack">
          {accounts.map((account) => (
            <article className="record-card" key={account.id}>
              <div className="split">
                <strong>{account.debtors?.name ?? "Unknown debtor"}</strong>
                <span className="chip">{account.status}</span>
              </div>
              <p className="body-copy">
                {account.debtors?.email ?? "No email"} · {account.debtors?.phone ?? "No phone"}
              </p>
              <div className="record-meta">
                <span className="muted">{formatCurrency(Number(account.balance))}</span>
                <span className="muted">Created {formatDateLabel(account.created_at)}</span>
              </div>
            </article>
          ))}
          {accounts.length === 0 ? (
            <div className="status-note">No accounts are currently assigned to this client.</div>
          ) : null}
        </div>
      </section>
    </>
  );
}
