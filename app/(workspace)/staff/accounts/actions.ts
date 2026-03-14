"use server";

import { revalidatePath } from "next/cache";

import { createAccountRecord, updateAccountStatusRecord } from "@/services/account-service";
import { parseAccountInput } from "@/utils/validation/phase2";

export async function createAccountAction(formData: FormData) {
  await createAccountRecord(parseAccountInput(formData));
  revalidatePath("/staff/dashboard");
  revalidatePath("/staff/accounts");
}

export async function updateAccountStatusAction(formData: FormData) {
  const accountId = formData.get("accountId");
  const status = formData.get("status");

  if (typeof accountId !== "string" || !accountId.trim()) {
    throw new Error("Missing account identifier.");
  }

  if (
    status !== "active" &&
    status !== "paid" &&
    status !== "suppressed" &&
    status !== "closed"
  ) {
    throw new Error("Invalid account status.");
  }

  await updateAccountStatusRecord(accountId, status);
  revalidatePath("/staff/dashboard");
  revalidatePath("/staff/accounts");
}
