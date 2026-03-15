import { createDebtorAction, updateDebtorAction } from "@/app/(workspace)/staff/debtors/actions";
import { listClientsForSelect } from "@/services/client-service";
import { listDebtorsForStaff } from "@/services/debtor-service";

export default async function StaffDebtorsPage({
  searchParams,
}: {
  searchParams?: Promise<{ created?: string; pwd?: string }>;
}) {
  const [clients, debtors, params] = await Promise.all([
    listClientsForSelect(),
    listDebtorsForStaff(),
    searchParams ?? Promise.resolve({}),
  ]);

  const createdEmail = (params as { created?: string; pwd?: string }).created;
  const tempPassword = (params as { created?: string; pwd?: string }).pwd;

  return (
    <>
      <section className="panel panel-body" style={{ borderTop: "2px solid var(--accent)" }}>
        <span className="eyebrow eyebrow-soft">Borrower Profiles</span>
        <h1 className="heading-xl">Debtor Management</h1>
        <p className="body-copy">
          Maintain debtor identities, contact details, and compliance preferences linked to the
          responsible creditor client.
        </p>
      </section>

      {createdEmail && tempPassword && (
        <section className="panel panel-body" style={{ borderLeft: "4px solid var(--accent)", background: "var(--surface-raised)" }}>
          <h2 className="section-title">Debtor account created</h2>
          <p className="body-copy">Share these login credentials with the debtor. The password is shown only once.</p>
          <div style={{ display: "flex", gap: "2rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
            <div>
              <span className="muted" style={{ fontSize: "0.8rem" }}>Email</span>
              <p className="body-copy" style={{ fontWeight: 600, marginTop: "0.2rem" }}>{decodeURIComponent(createdEmail)}</p>
            </div>
            <div>
              <span className="muted" style={{ fontSize: "0.8rem" }}>Temporary password</span>
              <p className="body-copy" style={{ fontWeight: 600, marginTop: "0.2rem", fontFamily: "monospace", letterSpacing: "0.05em" }}>{decodeURIComponent(tempPassword)}</p>
            </div>
          </div>
          <p className="muted" style={{ fontSize: "0.8rem", marginTop: "0.75rem" }}>The debtor can change their password after logging in from the debtor portal.</p>
        </section>
      )}

      <section className="two-column-grid">
        <div className="panel panel-body">
          <h2 className="section-title">Create debtor</h2>
          <form action={createDebtorAction} className="form-stack">
            <div className="field">
              <label htmlFor="debtor-name">Name</label>
              <input id="debtor-name" name="name" required type="text" />
            </div>
            <div className="field">
              <label htmlFor="debtor-email">Email</label>
              <input id="debtor-email" name="email" required type="email" />
            </div>
            <div className="field">
              <label htmlFor="debtor-phone">Phone</label>
              <input id="debtor-phone" name="phone" required type="text" />
            </div>
            <div className="two-column-grid">
              <div className="field">
                <label htmlFor="debtor-email-consent">Email consent</label>
                <select defaultValue="true" id="debtor-email-consent" name="emailConsent" required>
                  <option value="true">Granted</option>
                  <option value="false">Not granted</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="debtor-sms-consent">SMS consent</label>
                <select defaultValue="true" id="debtor-sms-consent" name="smsConsent" required>
                  <option value="true">Granted</option>
                  <option value="false">Not granted</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="debtor-timezone">Timezone</label>
              <input defaultValue="UTC" id="debtor-timezone" name="timezone" required type="text" />
            </div>
            <div className="two-column-grid">
              <div className="field">
                <label htmlFor="debtor-window-start">Contact window start</label>
                <input
                  defaultValue="8"
                  id="debtor-window-start"
                  max="23"
                  min="0"
                  name="contactWindowStart"
                  required
                  type="number"
                />
              </div>
              <div className="field">
                <label htmlFor="debtor-window-end">Contact window end</label>
                <input
                  defaultValue="20"
                  id="debtor-window-end"
                  max="24"
                  min="1"
                  name="contactWindowEnd"
                  required
                  type="number"
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="debtor-client">Client</label>
              <select defaultValue="" id="debtor-client" name="clientId" required>
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
            <button className="button" type="submit">
              Create debtor
            </button>
          </form>
        </div>

        <div className="panel panel-body">
          <h2 className="section-title">Existing debtors</h2>
          <div className="record-stack">
            {debtors.map((debtor) => (
              <form action={updateDebtorAction} className="record-card" key={debtor.id}>
                <input name="debtorId" type="hidden" value={debtor.id} />
                <div className="field">
                  <label htmlFor={`debtor-name-${debtor.id}`}>Name</label>
                  <input
                    defaultValue={debtor.name}
                    id={`debtor-name-${debtor.id}`}
                    name="name"
                    required
                    type="text"
                  />
                </div>
                <div className="field">
                  <label htmlFor={`debtor-email-${debtor.id}`}>Email</label>
                  <input
                    defaultValue={debtor.email}
                    id={`debtor-email-${debtor.id}`}
                    name="email"
                    required
                    type="email"
                  />
                </div>
                <div className="field">
                  <label htmlFor={`debtor-phone-${debtor.id}`}>Phone</label>
                  <input
                    defaultValue={debtor.phone ?? ""}
                    id={`debtor-phone-${debtor.id}`}
                    name="phone"
                    required
                    type="text"
                  />
                </div>
                <div className="two-column-grid">
                  <div className="field">
                    <label htmlFor={`debtor-email-consent-${debtor.id}`}>Email consent</label>
                    <select
                      defaultValue={String(debtor.email_consent)}
                      id={`debtor-email-consent-${debtor.id}`}
                      name="emailConsent"
                      required
                    >
                      <option value="true">Granted</option>
                      <option value="false">Not granted</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor={`debtor-sms-consent-${debtor.id}`}>SMS consent</label>
                    <select
                      defaultValue={String(debtor.sms_consent)}
                      id={`debtor-sms-consent-${debtor.id}`}
                      name="smsConsent"
                      required
                    >
                      <option value="true">Granted</option>
                      <option value="false">Not granted</option>
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor={`debtor-timezone-${debtor.id}`}>Timezone</label>
                  <input
                    defaultValue={debtor.timezone}
                    id={`debtor-timezone-${debtor.id}`}
                    name="timezone"
                    required
                    type="text"
                  />
                </div>
                <div className="two-column-grid">
                  <div className="field">
                    <label htmlFor={`debtor-window-start-${debtor.id}`}>Contact window start</label>
                    <input
                      defaultValue={String(debtor.contact_window_start)}
                      id={`debtor-window-start-${debtor.id}`}
                      max="23"
                      min="0"
                      name="contactWindowStart"
                      required
                      type="number"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`debtor-window-end-${debtor.id}`}>Contact window end</label>
                    <input
                      defaultValue={String(debtor.contact_window_end)}
                      id={`debtor-window-end-${debtor.id}`}
                      max="24"
                      min="1"
                      name="contactWindowEnd"
                      required
                      type="number"
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor={`debtor-client-${debtor.id}`}>Client</label>
                  <select
                    defaultValue={debtor.client_id}
                    id={`debtor-client-${debtor.id}`}
                    name="clientId"
                    required
                  >
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="record-meta">
                  <span className="muted">
                    {debtor.clients?.name ?? "Unknown client"} · {debtor.timezone} ·{" "}
                    {debtor.contact_window_start}:00-{debtor.contact_window_end}:00
                  </span>
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
