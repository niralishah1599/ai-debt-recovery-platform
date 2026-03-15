import { createClient } from "@/lib/supabase/server";
import { ensurePortalUserProfile } from "@/services/portal-user-service";
import { getPortalUserForCurrentSession } from "@/services/portal-user-service";
import type { AuthFormInput, PortalUserRole, RegistrationFormInput } from "@/utils/validation/auth";

export async function getCurrentAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (isMissingSessionError(error.message)) {
      return null;
    }

    throw new Error(`Unable to load authenticated user: ${error.message}`);
  }

  return user;
}

export async function signIn(input: AuthFormInput): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(input);

  if (error) {
    throw new Error(error.message);
  }

  const role =
    readPortalUserRole(data.user?.user_metadata.role) ??
    readPortalUserRole(data.user?.app_metadata.role) ??
    "staff";

  const clientId =
    typeof data.user?.user_metadata.client_id === "string"
      ? data.user.user_metadata.client_id
      : undefined;

  if (data.user) {
    await ensurePortalUserProfile(data.user, role, clientId);
  }
}

export async function signUp(input: RegistrationFormInput, callbackUrl: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: callbackUrl,
      data: {
        role: input.role,
        ...(input.client_id ? { client_id: input.client_id } : {}),
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function finalizeAuthFromOtp({
  tokenHash,
  type,
}: {
  tokenHash: string;
  type: "email" | "recovery" | "invite" | "email_change";
}): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Supabase did not return a user after email confirmation.");
  }

  const role =
    readPortalUserRole(data.user.user_metadata.role) ??
    readPortalUserRole(data.user.app_metadata.role) ??
    "client";

  const clientId =
    typeof data.user.user_metadata.client_id === "string"
      ? data.user.user_metadata.client_id
      : undefined;

  const debtorId =
    typeof data.user.user_metadata.debtor_id === "string"
      ? data.user.user_metadata.debtor_id
      : undefined;

  await ensurePortalUserProfile(data.user, role, clientId, debtorId);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentPortalUser() {
  const authUser = await getCurrentAuthUser();

  if (!authUser) {
    return null;
  }

  return getPortalUserForCurrentSession();
}

export async function requirePortalUser() {
  const authUser = await getCurrentAuthUser();

  if (!authUser) {
    throw new Error("Authentication required.");
  }

  const portalUser = await getPortalUserForCurrentSession();

  if (!portalUser) {
    throw new Error("Portal user profile is missing.");
  }

  return { authUser, portalUser };
}

export async function requirePortalRole(role: PortalUserRole) {
  const session = await requirePortalUser();

  if (session.portalUser.role !== role) {
    throw new Error("You do not have access to this area.");
  }

  return session;
}

export function getPortalHomePath(role: PortalUserRole): string {
  if (role === "staff") {
    return "/staff/dashboard";
  }

  if (role === "client") {
    return "/client/dashboard";
  }

  return "/debtor/dashboard";
}

function readPortalUserRole(value: unknown): PortalUserRole | null {
  if (value === "staff" || value === "client" || value === "debtor") {
    return value;
  }

  return null;
}

function isMissingSessionError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("auth session missing") ||
    normalized.includes("invalid jwt") ||
    normalized.includes("jwt expired")
  );
}
