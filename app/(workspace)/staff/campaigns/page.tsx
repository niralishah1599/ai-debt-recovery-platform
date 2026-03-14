import {
  createCampaignAction,
  executeCampaignAction,
} from "@/app/(workspace)/staff/campaigns/actions";
import {
  listCampaignsForSelect,
  listCampaignsForStaff,
  listCampaignTargetAccountsForStaff,
} from "@/services/campaign-service";
import { listMessagesForStaff } from "@/services/message-service";
import { formatDateLabel, formatDateTimeLabel } from "@/utils/format-date";

export default async function StaffCampaignsPage() {
  const [campaigns, campaignOptions, accounts, messages] = await Promise.all([
    listCampaignsForStaff(),
    listCampaignsForSelect(),
    listCampaignTargetAccountsForStaff(),
    listMessagesForStaff(),
  ]);

  return (
    <>
      {/* ── Header ── */}
      <section className="panel panel-body" style={{ borderTop: "2px solid var(--accent)" }}>
        <span className="eyebrow eyebrow-soft">Campaign Engine</span>
        <h1 className="heading-xl">SMS &amp; Email<br />Campaigns</h1>
        <p className="body-copy">
          Build reusable templates and trigger targeted campaigns against active accounts.
          Each execution creates a durable message-history record for compliance auditing.
        </p>
      </section>

      {/* ── Create + Execute ── */}
      <section className="two-column-grid">
        <div className="panel panel-body">
          <h2 className="section-title">Create Campaign</h2>
          <form action={createCampaignAction} className="form-stack">
            <div className="field">
              <label htmlFor="campaign-name">Campaign Name</label>
              <input
                id="campaign-name"
                name="name"
                placeholder="Payment Reminder — Q1 2026"
                required
                type="text"
              />
            </div>
            <div className="field">
              <label htmlFor="campaign-channel">Channel</label>
              <select defaultValue="email" id="campaign-channel" name="channel" required>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="campaign-template">Message Template</label>
              <textarea
                className="textarea"
                id="campaign-template"
                name="messageTemplate"
                placeholder="Hello {{name}}, your account has an outstanding balance. Use your secure payment link to resolve it today."
                required
                rows={5}
              />
              <span className="helper-text">Use {"{{name}}"} for debtor name personalisation.</span>
            </div>
            <button className="button" type="submit">
              Create Campaign
            </button>
          </form>
        </div>

        <div className="panel panel-body">
          <h2 className="section-title">Execute Campaign</h2>
          <form action={executeCampaignAction} className="form-stack">
            <div className="field">
              <label htmlFor="execution-campaign">Select Campaign</label>
              <select defaultValue="" id="execution-campaign" name="campaignId" required>
                <option disabled value="">Choose a campaign…</option>
                {campaignOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Target Accounts</label>
              <span className="helper-text">
                Only active accounts are eligible. Compliance rules are evaluated per account before send.
              </span>
              <div className="checkbox-list" style={{ marginTop: "8px" }}>
                {accounts.length > 0 ? accounts.map((account) => (
                  <label className="checkbox-card" key={account.id}>
                    <input name="accountIds" type="checkbox" value={account.id} />
                    <div className="checkbox-card-body">
                      <strong>{account.debtors?.name ?? "Unknown debtor"}</strong>
                      <span className="muted">{account.clients?.name ?? "Unknown client"}</span>
                      <span className="muted">{account.debtors?.email ?? account.debtors?.phone ?? "No destination on file"}</span>
                      <span className="muted">Balance ${Number(account.balance).toFixed(2)}</span>
                    </div>
                  </label>
                )) : (
                  <div className="status-note">No active accounts available for campaign execution.</div>
                )}
              </div>
            </div>
            <button
              className="button"
              disabled={accounts.length === 0 || campaignOptions.length === 0}
              type="submit"
            >
              Send Selected Messages
            </button>
          </form>
        </div>
      </section>

      {/* ── Existing campaigns + Message history ── */}
      <section className="two-column-grid">
        <div className="panel panel-body">
          <h2 className="section-title">Existing Campaigns ({campaigns.length})</h2>
          <div className="record-stack">
            {campaigns.map((campaign) => (
              <article className="record-card" key={campaign.id}>
                <div className="split">
                  <strong>{campaign.name}</strong>
                  <span className="chip" data-status={campaign.channel}>{campaign.channel}</span>
                </div>
                <p className="body-copy" style={{ fontSize: "12.5px" }}>{campaign.message_template}</p>
                <div className="record-meta">
                  <span className="muted">Created {formatDateLabel(campaign.created_at)}</span>
                </div>
              </article>
            ))}
            {campaigns.length === 0 && (
              <div className="status-note">Create your first email or SMS campaign above to begin messaging.</div>
            )}
          </div>
        </div>

        <div className="panel panel-body">
          <h2 className="section-title">Message History ({messages.length})</h2>
          <div className="record-stack">
            {messages.map((message) => (
              <article className="record-card" key={message.id}>
                <div className="split">
                  <strong>{message.campaigns?.name ?? "Unknown campaign"}</strong>
                  <span className="chip" data-status={message.status}>{message.status}</span>
                </div>
                <p className="body-copy" style={{ fontSize: "12.5px" }}>
                  {message.accounts?.debtors?.name ?? "Unknown debtor"} ·{" "}
                  {message.accounts?.clients?.name ?? "Unknown client"} · {message.channel}
                </p>
                <div className="record-meta">
                  <span className="muted">Balance ${Number(message.accounts?.balance ?? 0).toFixed(2)}</span>
                  <span className="muted">
                    {message.sent_at ? formatDateTimeLabel(message.sent_at) : "Not sent yet"}
                  </span>
                </div>
              </article>
            ))}
            {messages.length === 0 && (
              <div className="status-note">Message execution history will appear here after a campaign is triggered.</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
