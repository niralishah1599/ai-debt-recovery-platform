import { NextResponse } from "next/server";

import { getDebtorPortalSummary } from "@/services/debtor-portal-service";

export async function GET() {
  try {
    const summary = await getDebtorPortalSummary();
    return NextResponse.json({ data: summary });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load debtor portal summary." },
      { status: 403 },
    );
  }
}
