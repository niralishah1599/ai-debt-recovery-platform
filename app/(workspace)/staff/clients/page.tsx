import { createClientAction, updateClientAction } from "@/app/(workspace)/staff/clients/actions";
import { listClientsForStaff } from "@/services/client-service";
import { formatDateLabel } from "@/utils/format-date";

export default async function StaffClientsPage() {
  const clients = await listClientsForStaff();

  return (
    <>
      <section className="panel panel-body" style={{ borderTop: "2px solid var(--accent)" }}>
        <span className="eyebrow eyebrow-soft">Client Management</span>
        <h1 className="heading-xl">Creditor Organizations</h1>
        <p className="body-copy">
          Create and maintain creditor organizations. These records scope all debtor profiles and accounts.
        </p>
      </section>

      <section className="two-column-grid">
        <div className="panel panel-body">
          <h2 className="section-title">Create client</h2>
          <form action={createClientAction} className="form-stack">
            <div className="field">
              <label htmlFor="name">Client name</label>
              <input id="name" name="name" placeholder="ABC Bank" required type="text" />
            </div>
            <button className="button" type="submit">
              Create client
            </button>
          </form>
        </div>

        <div className="panel panel-body">
          <h2 className="section-title">Existing clients</h2>
          <div className="record-stack">
            {clients.map((client) => (
              <form action={updateClientAction} className="record-card" key={client.id}>
                <input name="clientId" type="hidden" value={client.id} />
                <div className="field">
                  <label htmlFor={`client-name-${client.id}`}>Name</label>
                  <input
                    defaultValue={client.name}
                    id={`client-name-${client.id}`}
                    name="name"
                    required
                    type="text"
                  />
                </div>
                <div className="record-meta">
                  <span className="muted">Created {formatDateLabel(client.created_at)}</span>
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
