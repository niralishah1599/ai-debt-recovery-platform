import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";

import { registerAction } from "./actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const error = resolvedSearchParams?.error;

  return (
    <AuthShell
      alternateHref="/login"
      alternateLabel="Already have an account? Sign in"
      asideBody="Staff accounts get full operations access — clients, debtors, campaigns, compliance, and analytics. Client accounts get a scoped view of their own portfolio performance and payment activity."
      asideTitle="Choosing your role"
      description="Create your account to start managing debt recovery portfolios with AI-assisted outreach and automated compliance."
      title="Create account"
    >
      <form action={registerAction} className="form-stack">
        {error ? <div className="error-note">{decodeURIComponent(error)}</div> : null}

        <div className="field">
          <label htmlFor="email">Work email</label>
          <input autoComplete="email" id="email" name="email" required type="email" />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
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
          <label htmlFor="role">Portal role</label>
          <select defaultValue="staff" id="role" name="role" required>
            <option value="staff">Staff</option>
            <option value="client">Client</option>
          </select>
        </div>

        <div className="button-row">
          <AuthSubmitButton idleLabel="Create account" pendingLabel="Creating..." />
          <Link className="button-secondary" href="/login">
            Have an account?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
