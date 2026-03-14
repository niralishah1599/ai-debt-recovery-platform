import Link from "next/link";

import {
  getClientPortalSummary,
  listClientPortalCampaignSummaries,
  listClientPortalComplianceEvents,
  listClientPortalPayments,
} from "@/services/client-portal-service";
import { formatDateTimeLabel } from "@/utils/format-date";
import { formatCurrency, formatPercent } from "@/utils/format-number";

export default async function ClientDashboardPage() {
  const [summary, payments, campaigns, complianceEvents] = await Promise.all([
    getClientPortalSummary(),
    listClientPortalPayments(5),
    listClientPortalCampaignSummaries(),
    listClientPortalComplianceEvents(5),
  ]);

  return (
    <>
      <section className="panel panel-body">
        <span className="eyebrow eyebrow-soft">Client portal</span>
        <h1 className="heading-lg" >
          {summary.clientName}
        </h1>
        <p className="body-copy">
          Review current portfolio status, payment recovery, campaign activity, and recent
          compliance incidents for your organization.
        </p>
      </section>

      <section className="metric-grid">
        <article className="metric-card metric-card-emphasis">
          <span className="metric-label">Outstanding balance</span>
          <span className="metric-value">{formatCurrency(summary.outstandingBalance)}</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Collected amount</span>
          <span className="metric-value">{formatCurrency(summary.collectedAmount)}</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Collection rate</span>
          <span className="metric-value">{formatPercent(summary.collectionRate)}</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Active accounts</span>
          <span className="metric-value">{summary.activeAccounts}</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Debtors</span>
          <span className="metric-value">{summary.totalDebtors}</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Compliance incidents</span>
          <span className="metric-value">{summary.complianceIncidents}</span>
        </article>
      </section>

      <section className="two-column-grid">
        <div className="panel panel-body">
          <div className="split">
            <h2 className="section-title">Recent payments</h2>
            <Link className="button-secondary" href="/client/payments">
              View all payments
            </Link>
          </div>
          <div className="record-stack">
            {payments.map((payment) => (
              <article className="record-card" key={payment.id}>
                <div className="split">
                  <strong>{payment.accounts?.debtors?.name ?? "Unknown debtor"}</strong>
                  <span className="chip">{payment.payment_status}</span>
                </div>
                <div className="record-meta">
                  <span className="muted">{formatCurrency(Number(payment.amount))}</span>
                  <span className="muted">{formatDateTimeLabel(payment.created_at)}</span>
                </div>
              </article>
            ))}
            {payments.length === 0 ? (
              <div className="status-note">Payments will appear here once debtors complete transactions.</div>
            ) : null}
          </div>
        </div>

        <div className="panel panel-body">
          <div className="split">
            <h2 className="section-title">Campaign performance</h2>
            <Link className="button-secondary" href="/client/campaigns">
              View campaigns
            </Link>
          </div>
          <div className="record-stack">
            {campaigns.slice(0, 5).map((campaign) => (
              <article className="record-card" key={campaign.campaignId}>
                <div className="split">
                  <strong>{campaign.campaignName}</strong>
                  <span className="chip">{campaign.totalMessages} messages</span>
                </div>
                <div className="record-meta">
                  <span className="muted">Delivered {campaign.deliveredMessages}</span>
                  <span className="muted">Blocked {campaign.blockedMessages}</span>
                </div>
              </article>
            ))}
            {campaigns.length === 0 ? (
              <div className="status-note">Campaign activity will appear once staff sends outbound messages.</div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="panel panel-body">
        <div className="split">
          <h2 className="section-title">Recent compliance incidents</h2>
          <Link className="button-secondary" href="/client/campaigns">
            Review campaign activity
          </Link>
        </div>
        <div className="record-stack">
          {complianceEvents.map((event) => (
            <article className="record-card" key={event.id}>
              <div className="split">
                <strong>{event.compliance_rules?.rule_name ?? "Unknown rule"}</strong>
                <span className="chip">{event.result}</span>
              </div>
              <p className="body-copy">
                {event.accounts?.debtors?.name ?? "Unknown debtor"} ·{" "}
                {event.campaigns?.name ?? "No campaign linked"}
              </p>
              <p className="body-copy">{event.detail}</p>
            </article>
          ))}
          {complianceEvents.length === 0 ? (
            <div className="status-note">Compliance events will appear here after campaign activity is evaluated.</div>
          ) : null}
        </div>
      </section>
    </>
  );
}
