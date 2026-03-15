import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { ensurePortalUserProfile } from "@/services/portal-user-service";

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const role = user.user_metadata?.role ?? user.app_metadata?.role ?? "debtor";
  const clientId = user.user_metadata?.client_id;
  const debtorId = user.user_metadata?.debtor_id;

  await ensurePortalUserProfile(user, role, clientId, debtorId);

  return NextResponse.json({ ok: true });
}
