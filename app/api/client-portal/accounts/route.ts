import { NextResponse } from "next/server";

import { listClientPortalAccounts } from "@/services/client-portal-service";

export async function GET() {
  try {
    const accounts = await listClientPortalAccounts();
    return NextResponse.json({ data: accounts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load client accounts." },
      { status: 403 },
    );
  }
}
