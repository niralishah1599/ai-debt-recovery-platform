import { NextResponse } from "next/server";

import { updateComplianceRuleRecord } from "@/services/compliance-service";
import { parseComplianceRuleInput } from "@/utils/validation/phase4";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const rule = await updateComplianceRuleRecord(id, parseComplianceRuleInput(body));
    return NextResponse.json({ data: rule });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update compliance rule." },
      { status: 400 },
    );
  }
}
