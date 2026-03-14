import { NextResponse } from "next/server";

import { updateAccountStatusRecord } from "@/services/account-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as {
    status?: string;
  };

  if (
    body.status !== "active" &&
    body.status !== "paid" &&
    body.status !== "suppressed" &&
    body.status !== "closed"
  ) {
    return NextResponse.json({ error: "Invalid account status." }, { status: 400 });
  }

  try {
    const account = await updateAccountStatusRecord(id, body.status);
    return NextResponse.json({ data: account });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update account." },
      { status: 400 },
    );
  }
}
