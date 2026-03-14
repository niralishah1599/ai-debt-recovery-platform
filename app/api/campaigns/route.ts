import { NextResponse } from "next/server";

import { createCampaignRecord, listCampaignsForStaff } from "@/services/campaign-service";
import { parseCampaignInput } from "@/utils/validation/phase3";

export async function GET() {
  try {
    const campaigns = await listCampaignsForStaff();
    return NextResponse.json({ data: campaigns });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load campaigns." },
      { status: 403 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const campaign = await createCampaignRecord(parseCampaignInput(body));
    return NextResponse.json({ data: campaign }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create campaign." },
      { status: 400 },
    );
  }
}
