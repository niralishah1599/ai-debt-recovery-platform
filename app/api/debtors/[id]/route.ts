import { NextResponse } from "next/server";

import { updateDebtorRecord } from "@/services/debtor-service";
import { parseDebtorInput } from "@/utils/validation/phase2";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const debtor = await updateDebtorRecord(id, parseDebtorInput(body));
    return NextResponse.json({ data: debtor });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update debtor." },
      { status: 400 },
    );
  }
}
