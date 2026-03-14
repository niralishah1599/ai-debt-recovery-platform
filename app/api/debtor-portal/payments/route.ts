import { NextResponse } from "next/server";

import { listDebtorPortalPayments } from "@/services/debtor-portal-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const parsedLimit = limitParam ? Number(limitParam) : 30;
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 30;

  try {
    const payments = await listDebtorPortalPayments(limit);
    return NextResponse.json({ data: payments });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load debtor payments." },
      { status: 403 },
    );
  }
}
