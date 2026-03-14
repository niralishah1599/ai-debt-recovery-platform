"use server";

import { revalidatePath } from "next/cache";

import {
  createComplianceRuleRecord,
  updateComplianceRuleRecord,
} from "@/services/compliance-service";
import { parseComplianceRuleInput } from "@/utils/validation/phase4";

export async function createComplianceRuleAction(formData: FormData) {
  await createComplianceRuleRecord(parseComplianceRuleInput(formData));
  revalidatePath("/staff/compliance");
}

export async function updateComplianceRuleAction(formData: FormData) {
  const ruleId = formData.get("ruleId");

  if (typeof ruleId !== "string" || !ruleId.trim()) {
    throw new Error("Missing compliance rule identifier.");
  }

  await updateComplianceRuleRecord(ruleId, parseComplianceRuleInput(formData));
  revalidatePath("/staff/compliance");
}
