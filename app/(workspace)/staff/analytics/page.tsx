import { AnimatedChart } from "@/components/workspace/animated-chart";
import { getAnalyticsDashboardData } from "@/services/analytics-service";
import { formatCurrency, formatDecimal, formatPercent } from "@/utils/format-number";

export default async function StaffAnalyticsPage() {
  const analytics = await getAnalyticsDashboardData();

  const maxPaymentValue = Math.max(...analytics.activity.payments.map((i) => i.value), 1);
  const maxMessageValue = Math.max(...analytics.activity.messages.map((i) => i.value), 1);
  const maxBlockValue   = Math.max(...analytics.activity.blocks.map((i) => i.value), 1);

  return (
    <>
      {/* ── Header ── */}
      <section className="panel panel-body" style={{ borderTop: "2px solid var(--accent)" }}>
        <span className="eyebrow eyebrow-soft">Analytics</span>
        <h1 className="heading-xl">Portfolio Intelligence</h1>
        <p className="body-copy">
          Live portfolio health, payment recovery, communication throughput, and compliance
          pressure derived from current platform activity.
        </p>
      </section>

      {/* ── KPIs ── */}
      <section className="metric-grid" aria-label="Analytics KPIs">
        <article className="metric-card metric-card-danger">
          <span className="metric-label">Outstanding Balance</span>
          <span className="metric-value">{formatCurrency(analytics.summary.outstandingBalance)}</span>
        </article>
        <article className="metric-card metric-card-success">
          <span className="metric-label">Collected Amount</span>
          <span className="metric-value">{formatCurrency(analytics.summary.collectedAmount)}</span>
        </article>
        <article className="metric-card metric-card-accent">
          <span className="metric-label">Collection Rate</span>
          <span className="metric-value">{formatPercent(analytics.summary.collectionRate)}</span>
        </article>
        <article className="metric-card metric-card-ai">
          <span className="metric-label">Avg Days to Payment</span>
          <span className="metric-value">
            {analytics.summary.averageDaysToFirstPayment === null
              ? "N/A"
              : formatDecimal(analytics.summary.averageDaysToFirstPayment)}
          </span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Messages Sent</span>
          <span className="metric-value">{analytics.summary.messagesSent}</span>
        </article>
        <article className="metric-card metric-card-success">
          <span className="metric-label">Delivery Rate</span>
          <span className="metric-value">{formatPercent(analytics.summary.deliveryRate)}</span>
        </article>
        <article className="metric-card metric-card-danger">
          <span className="metric-label">Compliance Blocks</span>
          <span className="metric-value">{analytics.summary.complianceBlockedCount}</span>
        </article>
        <article className="metric-card metric-card-ai">
          <span className="metric-label">Paid Accounts</span>
          <span className="metric-value">{analytics.summary.paidAccounts}</span>
        </article>
      </section>

      {/* ── Charts row 1 ── */}
      <section className="two-column-grid">
        <div className="panel panel-body">
          <h2 className="section-title">7-Day Payment Volume</h2>
          <AnimatedChart
            ariaLabel="Payment volume over the last seven days"
            colorVar="var(--success)"
            format="currency"
            max={maxPaymentValue}
            points={analytics.activity.payments}
          />
        </div>

        <div className="panel panel-body">
          <h2 className="section-title">7-Day Communication Activity</h2>
          <AnimatedChart
            ariaLabel="Message sends over the last seven days"
            colorVar="var(--teal)"
            format="number"
            max={maxMessageValue}
            points={analytics.activity.messages}
          />
        </div>
      </section>

      {/* ── Charts row 2 ── */}
      <section className="two-column-grid">
        <div className="panel panel-body">
          <h2 className="section-title">7-Day Compliance Blocks</h2>
          <AnimatedChart
            ariaLabel="Compliance blocks over the last seven days"
            colorVar="var(--danger)"
            format="number"
            max={maxBlockValue}
            points={analytics.activity.blocks}
          />
        </div>

        <div className="panel panel-body">
          <h2 className="section-title">Campaign Performance</h2>
          <div className="record-stack">
            {analytics.campaignPerformance.map((campaign) => (
              <article className="record-card" key={campaign.campaignId}>
                <div className="split">
                  <strong>{campaign.campaignName}</strong>
                  <span className="chip">{campaign.totalMessages} msgs</span>
                </div>
                <div className="record-meta">
                  <span className="muted">Delivered {campaign.deliveredMessages}</span>
                  <span className="muted">Blocked {campaign.blockedMessages}</span>
                </div>
              </article>
            ))}
            {analytics.campaignPerformance.length === 0 && (
              <div className="status-note">Campaign performance will populate after communication activity is recorded.</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
