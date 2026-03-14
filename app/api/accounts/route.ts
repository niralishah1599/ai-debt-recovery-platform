import { NextResponse } from "next/server";

import { createAccountRecord, listAccountsForStaff } from "@/services/account-service";
import { parseAccountInput } from "@/utils/validation/phase2";

export async function GET() {
  try {
    const accounts = await listAccountsForStaff();
    return NextResponse.json({ data: accounts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load accounts." },
      { status: 403 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const account = await createAccountRecord(parseAccountInput(body));
    return NextResponse.json({ data: account }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create account." },
      { status: 400 },
    );
  }
}
