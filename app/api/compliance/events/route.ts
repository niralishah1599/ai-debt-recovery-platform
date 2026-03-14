import { NextResponse } from "next/server";

import { listComplianceEventsForStaff } from "@/services/compliance-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const parsedLimit = limitParam ? Number(limitParam) : 40;
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 40;

  try {
    const events = await listComplianceEventsForStaff(limit);
    return NextResponse.json({ data: events });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load compliance events." },
      { status: 403 },
    );
  }
}
