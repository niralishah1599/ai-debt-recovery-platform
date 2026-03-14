import { assignPortalUserAction, createClientAction, updateClientAction } from "@/app/(workspace)/staff/clients/actions";
import { listClientsForStaff } from "@/services/client-service";
import { listClientPortalUsers } from "@/services/portal-user-service";
import { formatDateLabel } from "@/utils/format-date";

export default async function StaffClientsPage() {
  const [clients, portalUsers] = await Promise.all([
    listClientsForStaff(),
    listClientPortalUsers(),
  ]);

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

      <section className="panel panel-body">
        <h2 className="section-title">Portal user assignments</h2>
        <p className="body-copy">
          Assign client portal users to a creditor organization. Users without an assignment cannot access the client portal.
        </p>
        <div className="record-stack">
          {portalUsers.length === 0 && (
            <p className="muted">No client portal users found.</p>
          )}
          {portalUsers.map((user) => (
            <form action={assignPortalUserAction} className="record-card" key={user.id}>
              <input name="portalUserId" type="hidden" value={user.id} />
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
                <span className="body-copy" style={{ fontWeight: 600 }}>{user.email}</span>
                <span className="muted" style={{ fontSize: "0.8rem" }}>
                  {user.client_id
                    ? `Assigned to: ${clients.find((c) => c.id === user.client_id)?.name ?? user.client_id}`
                    : "No client assigned"}
                </span>
              </div>
              <div className="field" style={{ minWidth: "200px" }}>
                <label htmlFor={`assign-client-${user.id}`}>Assign to client</label>
                <select
                  defaultValue={user.client_id ?? ""}
                  id={`assign-client-${user.id}`}
                  name="clientId"
                  required
                >
                  <option disabled value="">
                    Select a client
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="record-meta">
                <span className="muted">Registered {formatDateLabel(user.created_at)}</span>
                <button className="button-secondary" type="submit">
                  Assign
                </button>
              </div>
            </form>
          ))}
        </div>
      </section>
    </>
  );
}
