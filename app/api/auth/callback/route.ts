import { NextRequest, NextResponse } from "next/server";

import { finalizeAuthFromOtp } from "@/services/auth-service";

const allowedOtpTypes = new Set(["email", "recovery", "invite", "email_change"]);

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

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

  return NextResponse.redirect(
    new URL(
      "/dashboard?message=" + encodeURIComponent("Email confirmed. Session activated."),
      request.url,
    ),
  );
}
