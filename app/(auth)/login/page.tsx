import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";

import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; message?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const error = resolvedSearchParams?.error;
  const message = resolvedSearchParams?.message;

  return (
    <AuthShell
      alternateHref="/register"
      alternateLabel="Create an account"
      asideBody="Role-based access gives staff, clients, and borrowers exactly the right level of visibility — nothing more, nothing less. Your data stays secure and scoped at every level."
      asideTitle="Role-based access control"
      description="Sign in to your workspace to manage portfolios, run campaigns, and track recovery performance."
      title="Welcome back"
    >
      <form action={loginAction} className="form-stack">
        {message ? <div className="success-note">{message}</div> : null}
        {error ? <div className="error-note">{decodeURIComponent(error)}</div> : null}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input autoComplete="email" id="email" name="email" required type="email" />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            autoComplete="current-password"
            id="password"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </div>

        <div className="button-row">
          <AuthSubmitButton idleLabel="Sign in" pendingLabel="Signing in..." />
          <Link className="button-secondary" href="/register">
            Need an account?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
