import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
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

export async function ensurePortalUserProfile(
  user: User,
  role: PortalUserRole,
): Promise<void> {
  const supabase = await createClient();
  const existingProfile = await getPortalUserForCurrentSession();

  if (existingProfile) {
    return;
  }

  const { error } = await supabase.from("portal_users").insert({
    auth_user_id: user.id,
    email: user.email ?? "",
    role,
  });

  if (error) {
    throw new Error(`Unable to create portal user profile: ${error.message}`);
  }
}
