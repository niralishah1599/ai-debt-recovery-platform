"use server";

import { revalidatePath } from "next/cache";

import { createCampaignRecord, executeCampaign } from "@/services/campaign-service";
import { parseCampaignExecutionInput, parseCampaignInput } from "@/utils/validation/phase3";

export async function createCampaignAction(formData: FormData) {
  await createCampaignRecord(parseCampaignInput(formData));
  revalidatePath("/staff/campaigns");
}

export async function executeCampaignAction(formData: FormData) {
  await executeCampaign(parseCampaignExecutionInput(formData));
  revalidatePath("/staff/campaigns");
}
