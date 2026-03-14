import { NextResponse } from "next/server";

import {
  createComplianceRuleRecord,
  listComplianceRulesForStaff,
} from "@/services/compliance-service";
import { parseComplianceRuleInput } from "@/utils/validation/phase4";

export async function GET() {
  try {
    const rules = await listComplianceRulesForStaff();
    return NextResponse.json({ data: rules });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load compliance rules." },
      { status: 403 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const rule = await createComplianceRuleRecord(parseComplianceRuleInput(body));
    return NextResponse.json({ data: rule }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create compliance rule." },
      { status: 400 },
    );
  }
}
