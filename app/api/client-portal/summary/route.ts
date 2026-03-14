import { NextResponse } from "next/server";

import { getClientPortalSummary } from "@/services/client-portal-service";

export async function GET() {
  try {
    const summary = await getClientPortalSummary();
    return NextResponse.json({ data: summary });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load client portal summary." },
      { status: 403 },
    );
  }
}
