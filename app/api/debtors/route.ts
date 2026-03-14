import { NextResponse } from "next/server";

import { createDebtorRecord, listDebtorsForStaff } from "@/services/debtor-service";
import { parseDebtorInput } from "@/utils/validation/phase2";

export async function GET() {
  try {
    const debtors = await listDebtorsForStaff();
    return NextResponse.json({ data: debtors });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load debtors." },
      { status: 403 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const debtor = await createDebtorRecord(parseDebtorInput(body));
    return NextResponse.json({ data: debtor }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create debtor." },
      { status: 400 },
    );
  }
}
