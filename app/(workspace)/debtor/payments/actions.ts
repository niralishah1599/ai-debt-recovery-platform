"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { requirePortalRole } from "@/services/auth-service";

export async function submitPaymentAction(formData: FormData): Promise<void> {
  await requirePortalRole("debtor");

  const accountId        = formData.get("accountId")?.toString().trim() ?? "";
  const amountRaw        = formData.get("amount")?.toString().trim() ?? "";
  const paymentReference = formData.get("paymentReference")?.toString().trim() || null;

  if (!accountId) {
    redirect("/debtor/payments?error=" + encodeURIComponent("Please select an account."));
  }

  const amount = parseFloat(amountRaw);

  if (!Number.isFinite(amount) || amount <= 0) {
    redirect("/debtor/payments?error=" + encodeURIComponent("Enter a valid payment amount."));
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("process_debtor_payment", {
    p_account_id:        accountId,
    p_amount:            amount,
    p_payment_reference: paymentReference,
  });

  if (error) {
    redirect("/debtor/payments?error=" + encodeURIComponent(error.message));
  }

  redirect("/debtor/payments?success=1");
}
