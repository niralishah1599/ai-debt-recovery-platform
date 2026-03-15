import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { changePasswordAction } from "./actions";

export default async function DebtorSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const error = (params as { error?: string }).error;
  const success = (params as { success?: string }).success;

  return (
    <>
      <section className="panel panel-body" style={{ borderTop: "2px solid var(--accent)" }}>
        <span className="eyebrow eyebrow-soft">Account Settings</span>
        <h1 className="heading-xl">Change Password</h1>
        <p className="body-copy">Update your password to keep your account secure.</p>
      </section>

      <section className="panel panel-body" style={{ maxWidth: "480px" }}>
        {error && <div className="error-note" style={{ marginBottom: "1rem" }}>{decodeURIComponent(error)}</div>}
        {success && <div className="success-note" style={{ marginBottom: "1rem" }}>{decodeURIComponent(success)}</div>}

        <form action={changePasswordAction} className="form-stack">
          <div className="field">
            <label htmlFor="newPassword">New password</label>
            <input
              autoComplete="new-password"
              id="newPassword"
              minLength={8}
              name="newPassword"
              required
              type="password"
            />
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm new password</label>
            <input
              autoComplete="new-password"
              id="confirmPassword"
              minLength={8}
              name="confirmPassword"
              required
              type="password"
            />
          </div>

          <AuthSubmitButton idleLabel="Update password" pendingLabel="Updating..." />
        </form>
      </section>
    </>
  );
}
