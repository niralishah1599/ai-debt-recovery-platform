"use server";

import { revalidatePath } from "next/cache";

import { createDebtorRecord, updateDebtorRecord } from "@/services/debtor-service";
import { parseDebtorInput } from "@/utils/validation/phase2";

export async function createDebtorAction(formData: FormData) {
  await createDebtorRecord(parseDebtorInput(formData));
  revalidatePath("/staff/dashboard");
  revalidatePath("/staff/debtors");
}

export async function updateDebtorAction(formData: FormData) {
  const debtorId = formData.get("debtorId");

  if (typeof debtorId !== "string" || !debtorId.trim()) {
    throw new Error("Missing debtor identifier.");
  }

  await updateDebtorRecord(debtorId, parseDebtorInput(formData));
  revalidatePath("/staff/dashboard");
  revalidatePath("/staff/debtors");
}
