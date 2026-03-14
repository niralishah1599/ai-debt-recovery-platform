import { NextResponse } from "next/server";

import { listMessagesForStaff } from "@/services/message-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const parsedLimit = limitParam ? Number(limitParam) : 24;
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 24;

  try {
    const messages = await listMessagesForStaff(limit);
    return NextResponse.json({ data: messages });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load messages." },
      { status: 403 },
    );
  }
}
