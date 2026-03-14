import { NextResponse } from "next/server";

import { listDebtorPortalAccounts } from "@/services/debtor-portal-service";

export async function GET() {
  try {
    const accounts = await listDebtorPortalAccounts();
    return NextResponse.json({ data: accounts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load debtor accounts." },
      { status: 403 },
    );
  }
}
