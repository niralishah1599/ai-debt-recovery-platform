import {
  createComplianceRuleAction,
  updateComplianceRuleAction,
} from "@/app/(workspace)/staff/compliance/actions";
import {
  listComplianceEventsForStaff,
  listComplianceRulesForStaff,
} from "@/services/compliance-service";
import { formatDateLabel, formatDateTimeLabel } from "@/utils/format-date";

export default async function StaffCompliancePage() {
  const [rules, events] = await Promise.all([
    listComplianceRulesForStaff(),
    listComplianceEventsForStaff(),
  ]);

  const blockedCount = events.filter((e) => e.result === "blocked").length;
  const allowedCount = events.filter((e) => e.result === "allowed").length;
  const activeRules  = rules.filter((r) => r.is_active).length;

  return (
    <>
      {/* ── Header ── */}
      <section className="panel panel-body" style={{ borderTop: "2px solid var(--accent)" }}>
        <span className="eyebrow eyebrow-soft">Compliance Engine</span>
        <h1 className="heading-xl">Regulatory Guard Rails</h1>
        <p className="body-copy">
          Define deterministic compliance rules and audit every allow or block decision
          produced during campaign execution. Full event trail with timestamps.
        </p>
      </section>

      {/* ── Stats ── */}
      <section className="metric-grid" aria-label="Compliance metrics">
        <article className="metric-card metric-card-accent">
          <span className="metric-label">Active Rules</span>
          <span className="metric-value">{activeRules}</span>
        </article>
        <article className="metric-card metric-card-success">
          <span className="metric-label">Allowed Events</span>
          <span className="metric-value">{allowedCount}</span>
        </article>
        <article className="metric-card metric-card-danger">
          <span className="metric-label">Blocked Events</span>
          <span className="metric-value">{blockedCount}</span>
        </article>
        <article className="metric-card metric-card-ai">
          <span className="metric-label">Total Rules</span>
          <span className="metric-value">{rules.length}</span>
        </article>
      </section>

      {/* ── Create + Manage ── */}
      <section className="two-column-grid">
        <div className="panel panel-body">
          <h2 className="section-title">Create Rule</h2>
          <form action={createComplianceRuleAction} className="form-stack">
            <div className="field">
              <label htmlFor="rule-name">Rule Name</label>
              <input id="rule-name" name="ruleName" placeholder="Quiet Hours Enforcement" required type="text" />
            </div>
            <div className="field">
              <label htmlFor="rule-type">Rule Type</label>
              <select defaultValue="contact_window" id="rule-type" name="ruleType" required>
                <option value="account_status">Account Status</option>
                <option value="contact_window">Contact Window</option>
                <option value="consent">Consent</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="rule-active">Status</label>
              <select defaultValue="true" id="rule-active" name="isActive" required>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <button className="button" type="submit">Create Rule</button>
          </form>
        </div>

        <div className="panel panel-body">
          <h2 className="section-title">Manage Rules ({rules.length})</h2>
          <div className="record-stack">
            {rules.map((rule) => (
              <form action={updateComplianceRuleAction} className="record-card" key={rule.id}>
                <input name="ruleId" type="hidden" value={rule.id} />
                <div className="split">
                  <strong>{rule.rule_name}</strong>
                  <span className="chip" data-status={rule.is_active ? "active" : "failed"}>
                    {rule.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="two-column-grid" style={{ gap: "10px" }}>
                  <div className="field">
                    <label htmlFor={`rule-name-${rule.id}`}>Name</label>
                    <input
                      defaultValue={rule.rule_name}
                      id={`rule-name-${rule.id}`}
                      name="ruleName"
                      required
                      type="text"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`rule-type-${rule.id}`}>Type</label>
                    <select defaultValue={rule.rule_type} id={`rule-type-${rule.id}`} name="ruleType" required>
                      <option value="account_status">Account Status</option>
                      <option value="contact_window">Contact Window</option>
                      <option value="consent">Consent</option>
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor={`rule-active-${rule.id}`}>Status</label>
                  <select defaultValue={String(rule.is_active)} id={`rule-active-${rule.id}`} name="isActive" required>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div className="record-meta">
                  <span className="muted">Created {formatDateLabel(rule.created_at)}</span>
                  <button className="button-secondary" type="submit">Save Changes</button>
                </div>
              </form>
            ))}
          </div>
        </div>
      </section>

      {/* ── Audit trail ── */}
      <section className="panel panel-body">
        <h2 className="section-title">Compliance Event Audit Trail ({events.length})</h2>
        <div className="record-stack">
          {events.map((event) => (
            <article className="record-card" key={event.id}>
              <div className="split">
                <strong>{event.compliance_rules?.rule_name ?? "Unknown rule"}</strong>
                <span className="chip" data-status={event.result}>{event.result}</span>
              </div>
              <p className="body-copy" style={{ fontSize: "12.5px" }}>
                {event.accounts?.debtors?.name ?? "Unknown debtor"} ·{" "}
                {event.accounts?.clients?.name ?? "Unknown client"} ·{" "}
                {event.campaigns?.name ?? "No campaign linked"}
              </p>
              {event.detail && (
                <p className="body-copy" style={{ fontSize: "12.5px" }}>{event.detail}</p>
              )}
              <div className="record-meta">
                <span className="muted">{event.channel ? `Channel: ${event.channel}` : "Channel not set"}</span>
                <span className="muted">{formatDateTimeLabel(event.created_at)}</span>
              </div>
            </article>
          ))}
          {events.length === 0 && (
            <div className="status-note">
              Compliance events will appear here after campaign sends are evaluated by the rule engine.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
