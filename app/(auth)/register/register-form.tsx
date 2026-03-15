"use client";

import Link from "next/link";

import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { registerAction } from "./actions";

export function RegisterForm({ error }: { error?: string }) {
  return (
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
  );
}
