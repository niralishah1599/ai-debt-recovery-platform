"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createDebtorRecord, updateDebtorRecord } from "@/services/debtor-service";
import { inviteDebtorByEmail } from "@/services/debtor-invite-service";
import { parseDebtorInput } from "@/utils/validation/phase2";

export async function createDebtorAction(formData: FormData) {
  const debtor = await createDebtorRecord(parseDebtorInput(formData));

  const tempPassword = await inviteDebtorByEmail(
    debtor.email,
    debtor.name,
    debtor.id,
    debtor.client_id,
  );

  revalidatePath("/staff/dashboard");
  revalidatePath("/staff/debtors");

  redirect(
    "/staff/debtors?created=" +
      encodeURIComponent(debtor.email) +
      "&pwd=" +
      encodeURIComponent(tempPassword),
  );
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
