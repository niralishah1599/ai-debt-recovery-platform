import { createAccountAction, updateAccountStatusAction } from "@/app/(workspace)/staff/accounts/actions";
import { listAccountsForStaff } from "@/services/account-service";
import { listClientsForSelect } from "@/services/client-service";
import { listDebtorsForSelect } from "@/services/debtor-service";
import { formatDateLabel } from "@/utils/format-date";

export default async function StaffAccountsPage() {
  const [clients, debtors, accounts] = await Promise.all([
    listClientsForSelect(),
    listDebtorsForSelect(),
    listAccountsForStaff(),
  ]);

  return (
    <>
      <section className="panel panel-body" style={{ borderTop: "2px solid var(--accent)" }}>
        <span className="eyebrow eyebrow-soft">Debt Accounts</span>
        <h1 className="heading-xl">Account<br />Lifecycle</h1>
        <p className="body-copy">
          Create debt accounts and control their operational status throughout the full
          collection lifecycle.
        </p>
      </section>

      <section className="two-column-grid">
        <div className="panel panel-body">
          <h2 className="section-title">Create account</h2>
          <form action={createAccountAction} className="form-stack">
            <div className="field">
              <label htmlFor="account-client">Client</label>
              <select defaultValue="" id="account-client" name="clientId" required>
                <option disabled value="">
                  Select client
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="account-debtor">Debtor</label>
              <select defaultValue="" id="account-debtor" name="debtorId" required>
                <option disabled value="">
                  Select debtor
                </option>
                {debtors.map((debtor) => (
                  <option key={debtor.id} value={debtor.id}>
                    {debtor.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="account-balance">Balance</label>
              <input id="account-balance" min="0" name="balance" required step="0.01" type="number" />
            </div>
            <div className="field">
              <label htmlFor="account-status">Status</label>
              <select defaultValue="active" id="account-status" name="status" required>
                <option value="active">Active</option>
                <option value="paid">Paid</option>
                <option value="suppressed">Suppressed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <button className="button" type="submit">
              Create account
            </button>
          </form>
        </div>

        <div className="panel panel-body">
          <h2 className="section-title">Existing accounts</h2>
          <div className="record-stack">
            {accounts.map((account) => (
              <form action={updateAccountStatusAction} className="record-card" key={account.id}>
                <input name="accountId" type="hidden" value={account.id} />
                <div className="split">
                  <strong>{account.debtors?.name ?? "Unknown debtor"}</strong>
                  <span className="chip">{account.clients?.name ?? "Unknown client"}</span>
                </div>
                <p className="body-copy">Balance ${Number(account.balance).toFixed(2)}</p>
                <div className="field">
                  <label htmlFor={`account-status-${account.id}`}>Status</label>
                  <select
                    defaultValue={account.status}
                    id={`account-status-${account.id}`}
                    name="status"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="paid">Paid</option>
                    <option value="suppressed">Suppressed</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="record-meta">
                  <span className="muted">Created {formatDateLabel(account.created_at)}</span>
                  <button className="button-secondary" type="submit">
                    Save
                  </button>
                </div>
              </form>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
