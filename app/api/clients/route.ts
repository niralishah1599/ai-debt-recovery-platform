import { NextResponse } from "next/server";

import { createClientRecord, listClientsForStaff } from "@/services/client-service";
import { parseClientInput } from "@/utils/validation/phase2";

export async function GET() {
  try {
    const clients = await listClientsForStaff();
    return NextResponse.json({ data: clients });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load clients." },
      { status: 403 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const client = await createClientRecord(parseClientInput(body));
    return NextResponse.json({ data: client }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create client." },
      { status: 400 },
    );
  }
}
