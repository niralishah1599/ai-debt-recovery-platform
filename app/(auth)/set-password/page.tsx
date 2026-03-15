import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";

import { setPasswordAction } from "./actions";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const error = resolvedParams?.error;

  return (
    <AuthShell
      alternateHref="/login"
      alternateLabel="Back to login"
      asideTitle="Welcome to the platform"
      asideBody="You have been invited to access your debt account portal. Set a password to get started — you can use it to log in anytime and check your balance, make payments, and track your progress."
      title="Set your password"
      description="Choose a secure password to activate your account and access your portal."
    >
      <form action={setPasswordAction} className="form-stack">
        {error ? <div className="error-note">{decodeURIComponent(error)}</div> : null}

        <div className="field">
          <label htmlFor="password">New password</label>
          <input
            autoComplete="new-password"
            id="password"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            autoComplete="new-password"
            id="confirmPassword"
            minLength={8}
            name="confirmPassword"
            required
            type="password"
          />
        </div>

        <AuthSubmitButton idleLabel="Set password & enter portal" pendingLabel="Saving..." />
      </form>
    </AuthShell>
  );
}
