import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { finalizeAuthFromOtp, getCurrentPortalUser, getPortalHomePath } from "@/services/auth-service";
import { ensurePortalUserProfile } from "@/services/portal-user-service";

const allowedOtpTypes = new Set(["email", "recovery", "invite", "email_change"]);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  // ── PKCE flow (invite emails use this) ─────────────────────────────────────
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL("/login?error=" + encodeURIComponent(error.message), request.url),
      );
    }

    // Create portal_users profile if not yet created (invite flow)
    if (data.user) {
      const role = data.user.user_metadata?.role ?? data.user.app_metadata?.role ?? "debtor";
      const clientId = data.user.user_metadata?.client_id;
      const debtorId = data.user.user_metadata?.debtor_id;
      await ensurePortalUserProfile(data.user, role, clientId, debtorId);
    }

    const portalUser = await getCurrentPortalUser();

    // Debtor invite → set password first
    if (!portalUser || portalUser.role === "debtor") {
      return NextResponse.redirect(new URL("/set-password", request.url));
    }

    if (portalUser.role === "client" && !portalUser.client_id) {
      return NextResponse.redirect(new URL("/pending", request.url));
    }

    return NextResponse.redirect(new URL(getPortalHomePath(portalUser.role), request.url));
  }

  // ── OTP / token_hash flow (email confirmation) ──────────────────────────────
  if (!tokenHash || !type || !allowedOtpTypes.has(type)) {
    return NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent("Invalid confirmation link."), request.url),
    );
  }

  try {
    await finalizeAuthFromOtp({
      tokenHash,
      type: type as "email" | "recovery" | "invite" | "email_change",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to confirm account.";
    return NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent(message), request.url),
    );
  }

  if (type === "invite") {
    return NextResponse.redirect(new URL("/set-password", request.url));
  }

  const portalUser = await getCurrentPortalUser();

  if (!portalUser) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (portalUser.role === "client" && !portalUser.client_id) {
    return NextResponse.redirect(new URL("/pending", request.url));
  }

  return NextResponse.redirect(new URL(getPortalHomePath(portalUser.role), request.url));
}
