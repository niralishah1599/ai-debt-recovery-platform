import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { requirePortalRole } from "@/services/auth-service";
import type { PortalUserRole } from "@/utils/validation/auth";

export type PortalUserRecord = {
  id: string;
  auth_user_id: string;
  email: string;
  role: PortalUserRole;
  client_id: string | null;
  debtor_id: string | null;
  created_at: string;
};

export async function getPortalUserForCurrentSession(): Promise<PortalUserRecord | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(`Unable to load authenticated user for portal lookup: ${authError.message}`);
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("portal_users")
    .select("id, auth_user_id, email, role, client_id, debtor_id, created_at")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load portal user profile: ${error.message}`);
  }

  return data as PortalUserRecord | null;
}

export async function ensurePortalUserProfileForUser(
  authUserId: string,
  email: string,
  role: PortalUserRole,
  clientId?: string,
  debtorId?: string,
): Promise<void> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("portal_users")
    .select("id, client_id, debtor_id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (existing) {
    const patch: Record<string, string> = {};
    if (clientId && !existing.client_id) patch.client_id = clientId;
    if (debtorId && !existing.debtor_id) patch.debtor_id = debtorId;
    if (Object.keys(patch).length > 0) {
      await supabase.from("portal_users").update(patch).eq("id", existing.id);
    }
    return;
  }

  await supabase.from("portal_users").insert({
    auth_user_id: authUserId,
    email,
    role,
    ...(clientId ? { client_id: clientId } : {}),
    ...(debtorId ? { debtor_id: debtorId } : {}),
  });
}

export async function listClientPortalUsers(): Promise<PortalUserRecord[]> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portal_users")
    .select("id, auth_user_id, email, role, client_id, debtor_id, created_at")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load client portal users: ${error.message}`);
  }

  return data as PortalUserRecord[];
}

export async function assignPortalUserToClient(
  portalUserId: string,
  clientId: string,
): Promise<void> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { error } = await supabase
    .from("portal_users")
    .update({ client_id: clientId })
    .eq("id", portalUserId)
    .eq("role", "client");

  if (error) {
    throw new Error(`Unable to assign portal user to client: ${error.message}`);
  }
}

export async function ensurePortalUserProfile(
  user: User,
  role: PortalUserRole,
  clientId?: string,
  debtorId?: string,
): Promise<void> {
  const supabase = await createClient();
  const existingProfile = await getPortalUserForCurrentSession();

  if (existingProfile) {
    const patch: Record<string, string> = {};

    if (role === "client" && clientId && !existingProfile.client_id) {
      patch.client_id = clientId;
    }

    if (role === "debtor" && debtorId && !existingProfile.debtor_id) {
      patch.debtor_id = debtorId;
    }

    if (role === "debtor" && clientId && !existingProfile.client_id) {
      patch.client_id = clientId;
    }

    if (Object.keys(patch).length > 0) {
      await supabase.from("portal_users").update(patch).eq("id", existingProfile.id);
    }

    return;
  }

  const { error } = await supabase.from("portal_users").insert({
    auth_user_id: user.id,
    email: user.email ?? "",
    role,
    ...(clientId ? { client_id: clientId } : {}),
    ...(debtorId ? { debtor_id: debtorId } : {}),
  });

  if (error) {
    throw new Error(`Unable to create portal user profile: ${error.message}`);
  }
}
