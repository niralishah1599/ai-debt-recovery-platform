import { NextResponse } from "next/server";

import {
  listClientPortalCampaignSummaries,
  listClientPortalComplianceEvents,
  listClientPortalMessages,
} from "@/services/client-portal-service";

export async function GET() {
  try {
    const [campaigns, messages, compliance] = await Promise.all([
      listClientPortalCampaignSummaries(),
      listClientPortalMessages(30),
      listClientPortalComplianceEvents(20),
    ]);

    return NextResponse.json({
      data: {
        campaigns,
        messages,
        compliance,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load client campaign activity." },
      { status: 403 },
    );
  }
}
