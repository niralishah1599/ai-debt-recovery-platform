import { NextResponse } from "next/server";

import { updateClientRecord } from "@/services/client-service";
import { parseClientInput } from "@/utils/validation/phase2";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const client = await updateClientRecord(id, parseClientInput(body));
    return NextResponse.json({ data: client });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update client." },
      { status: 400 },
    );
  }
}
