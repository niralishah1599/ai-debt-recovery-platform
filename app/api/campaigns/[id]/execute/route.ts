import { NextResponse } from "next/server";

import { executeCampaign } from "@/services/campaign-service";
import { parseCampaignExecutionInput } from "@/utils/validation/phase3";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const execution = await executeCampaign(
      parseCampaignExecutionInput({
        campaignId: id,
        accountIds: body.accountIds,
      }),
    );

    return NextResponse.json({ data: execution }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to execute campaign." },
      { status: 400 },
    );
  }
}
