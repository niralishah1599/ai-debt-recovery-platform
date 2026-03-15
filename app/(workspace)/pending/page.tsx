import Link from "next/link";

export default function ClientPendingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "var(--surface)",
      }}
    >
      <div
        className="panel panel-body"
        style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⏳</div>

        <h1 className="heading-xl" style={{ marginBottom: "0.5rem" }}>
          Account pending assignment
        </h1>

        <p className="body-copy" style={{ marginBottom: "1.5rem", color: "var(--muted)" }}>
          Your account has been created successfully. A staff member needs to assign your
          organization before you can access the client portal.
        </p>

        <p className="body-copy" style={{ marginBottom: "2rem" }}>
          Please contact your platform administrator and provide your registered email address.
          Once assigned, log in again to access your dashboard.
        </p>

        <Link className="button-secondary" href="/login">
          Back to login
        </Link>
      </div>
    </div>
  );
}
