import { NextResponse } from "next/server";

import { getAnalyticsDashboardData } from "@/services/analytics-service";

export async function GET() {
  try {
    const analytics = await getAnalyticsDashboardData();
    return NextResponse.json({ data: analytics });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load analytics." },
      { status: 403 },
    );
  }
}
