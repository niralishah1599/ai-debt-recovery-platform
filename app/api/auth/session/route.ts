import { NextResponse } from "next/server";

import { getCurrentAuthUser } from "@/services/auth-service";
import { getPortalUserForCurrentSession } from "@/services/portal-user-service";

export async function GET() {
  const authUser = await getCurrentAuthUser();

  if (!authUser) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const portalUser = await getPortalUserForCurrentSession();

  return NextResponse.json({
    authenticated: true,
    user: {
      id: authUser.id,
      email: authUser.email,
      role: portalUser?.role ?? null,
    },
  });
}
