import {
  listClientPortalCampaignSummaries,
  listClientPortalComplianceEvents,
  listClientPortalMessages,
} from "@/services/client-portal-service";
import { formatDateTimeLabel } from "@/utils/format-date";

export default async function ClientCampaignsPage() {
  const [campaigns, messages, complianceEvents] = await Promise.all([
    listClientPortalCampaignSummaries(),
    listClientPortalMessages(30),
    listClientPortalComplianceEvents(20),
  ]);

  return (
    <>
      <section className="panel panel-body">
        <h1 className="heading-lg" >
          Campaign activity
        </h1>
        <p className="body-copy">
          Review read-only campaign performance, message delivery history, and compliance
          incidents related to your portfolio.
        </p>
      </section>

      <section className="two-column-grid">
        <div className="panel panel-body">
          <h2 className="section-title">Campaign summary</h2>
          <div className="record-stack">
            {campaigns.map((campaign) => (
              <article className="record-card" key={campaign.campaignId}>
                <div className="split">
                  <strong>{campaign.campaignName}</strong>
                  <span className="chip">{campaign.totalMessages} messages</span>
                </div>
                <div className="record-meta">
                  <span className="muted">Delivered {campaign.deliveredMessages}</span>
                  <span className="muted">Blocked {campaign.blockedMessages}</span>
                </div>
                <div className="record-meta">
                  <span className="muted">
                    {campaign.lastActivityAt
                      ? `Last activity ${formatDateTimeLabel(campaign.lastActivityAt)}`
                      : "No activity yet"}
                  </span>
                </div>
              </article>
            ))}
            {campaigns.length === 0 ? (
              <div className="status-note">Campaign summaries will appear after outbound sends occur.</div>
            ) : null}
          </div>
        </div>

        <div className="panel panel-body">
          <h2 className="section-title">Recent message history</h2>
          <div className="record-stack">
            {messages.map((message) => (
              <article className="record-card" key={message.id}>
                <div className="split">
                  <strong>{message.campaigns?.name ?? "Unknown campaign"}</strong>
                  <span className="chip">{message.status}</span>
                </div>
                <p className="body-copy">
                  {message.accounts?.debtors?.name ?? "Unknown debtor"} · {message.channel}
                </p>
                <div className="record-meta">
                  <span className="muted">{message.accounts?.debtors?.email ?? "No email recorded"}</span>
                  <span className="muted">
                    {message.sent_at ? formatDateTimeLabel(message.sent_at) : "Not sent yet"}
                  </span>
                </div>
              </article>
            ))}
            {messages.length === 0 ? (
              <div className="status-note">Message history will populate after staff-triggered campaigns.</div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="panel panel-body">
        <h2 className="section-title">Compliance incidents</h2>
        <div className="record-stack">
          {complianceEvents.map((event) => (
            <article className="record-card" key={event.id}>
              <div className="split">
                <strong>{event.compliance_rules?.rule_name ?? "Unknown rule"}</strong>
                <span className="chip">{event.result}</span>
              </div>
              <p className="body-copy">
                {event.accounts?.debtors?.name ?? "Unknown debtor"} ·{" "}
                {event.campaigns?.name ?? "No campaign linked"} ·{" "}
                {event.channel ?? "unknown channel"}
              </p>
              <p className="body-copy">{event.detail}</p>
            </article>
          ))}
          {complianceEvents.length === 0 ? (
            <div className="status-note">No compliance incidents are currently visible for this client.</div>
          ) : null}
        </div>
      </section>
    </>
  );
}
