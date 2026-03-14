"use server";

import { revalidatePath } from "next/cache";

import { createClientRecord, updateClientRecord } from "@/services/client-service";
import { parseClientInput } from "@/utils/validation/phase2";

export async function createClientAction(formData: FormData) {
  await createClientRecord(parseClientInput(formData));
  revalidatePath("/staff/dashboard");
  revalidatePath("/staff/clients");
}

export async function updateClientAction(formData: FormData) {
  const clientId = formData.get("clientId");

  if (typeof clientId !== "string" || !clientId.trim()) {
    throw new Error("Missing client identifier.");
  }

  await updateClientRecord(clientId, parseClientInput(formData));
  revalidatePath("/staff/dashboard");
  revalidatePath("/staff/clients");
}
