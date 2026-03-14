import { NextResponse } from "next/server";

import { signOut } from "@/services/auth-service";

export async function POST(request: Request) {
  const loginUrl = new URL("/login?message=" + encodeURIComponent("Signed out."), request.url);

  try {
    await signOut();
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent("Unable to sign out cleanly."), request.url),
    );
  }

  return NextResponse.redirect(loginUrl);
}
