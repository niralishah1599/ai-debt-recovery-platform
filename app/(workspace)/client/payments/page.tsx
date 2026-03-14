import { listClientPortalPayments } from "@/services/client-portal-service";
import { formatDateTimeLabel } from "@/utils/format-date";
import { formatCurrency } from "@/utils/format-number";

export default async function ClientPaymentsPage() {
  const payments = await listClientPortalPayments();

  return (
    <>
      <section className="panel panel-body">
        <h1 className="heading-lg" >
          Payments
        </h1>
        <p className="body-copy">
          Review debtor payments tied to your accounts, including transaction state, amount,
          reference, and timing.
        </p>
      </section>

      <section className="panel panel-body">
        <div className="record-stack">
          {payments.map((payment) => (
            <article className="record-card" key={payment.id}>
              <div className="split">
                <strong>{payment.accounts?.debtors?.name ?? "Unknown debtor"}</strong>
                <span className="chip">{payment.payment_status}</span>
              </div>
              <p className="body-copy">
                Reference {payment.payment_reference ?? "not recorded"} · Account balance{" "}
                {formatCurrency(Number(payment.accounts?.balance ?? 0))}
              </p>
              <div className="record-meta">
                <span className="muted">{formatCurrency(Number(payment.amount))}</span>
                <span className="muted">{formatDateTimeLabel(payment.created_at)}</span>
              </div>
            </article>
          ))}
          {payments.length === 0 ? (
            <div className="status-note">No payments have been recorded for this client yet.</div>
          ) : null}
        </div>
      </section>
    </>
  );
}
