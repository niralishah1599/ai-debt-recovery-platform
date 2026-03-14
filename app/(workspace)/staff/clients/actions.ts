"use server";

import { revalidatePath } from "next/cache";

import { createClientRecord, updateClientRecord } from "@/services/client-service";
import { assignPortalUserToClient } from "@/services/portal-user-service";
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

export async function assignPortalUserAction(formData: FormData) {
  const portalUserId = formData.get("portalUserId");
  const clientId = formData.get("clientId");

  if (typeof portalUserId !== "string" || !portalUserId.trim()) {
    throw new Error("Missing portal user identifier.");
  }

  if (typeof clientId !== "string" || !clientId.trim()) {
    throw new Error("Missing client identifier.");
  }

  await assignPortalUserToClient(portalUserId, clientId);
  revalidatePath("/staff/clients");
}
