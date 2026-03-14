"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useState } from "react";

import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { registerAction } from "./actions";

type ClientOption = { id: string; name: string };

export function RegisterForm({
  clients,
  error: initialError,
}: {
  clients: ClientOption[];
  error?: string;
}) {
  const [role, setRole] = useState("staff");

  return (
    <form action={registerAction} className="form-stack">
      {initialError ? <div className="error-note">{decodeURIComponent(initialError)}</div> : null}

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
        <select
          defaultValue="staff"
          id="role"
          name="role"
          required
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="staff">Staff</option>
          <option value="client">Client</option>
        </select>
      </div>

      {role === "client" && (
        <div className="field">
          <label htmlFor="client_id">Client organization</label>
          <select defaultValue="" id="client_id" name="client_id" required>
            <option disabled value="">
              Select your organization
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {clients.length === 0 && (
            <span className="muted" style={{ fontSize: "0.8rem" }}>
              No client organizations found. Ask staff to create one first.
            </span>
          )}
        </div>
      )}

      <div className="button-row">
        <AuthSubmitButton idleLabel="Create account" pendingLabel="Creating..." />
        <Link className="button-secondary" href="/login">
          Have an account?
        </Link>
      </div>
    </form>
  );
}
