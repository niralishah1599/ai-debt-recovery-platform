"use server";

import { redirect } from "next/navigation";
import { unstable_rethrow } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function changePasswordAction(formData: FormData) {
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    redirect("/debtor/settings?error=" + encodeURIComponent("Password must be at least 8 characters."));
  }

  if (newPassword !== confirmPassword) {
    redirect("/debtor/settings?error=" + encodeURIComponent("Passwords do not match."));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) throw new Error(error.message);
  } catch (error) {
    unstable_rethrow(error);
    const message = error instanceof Error ? error.message : "Unable to update password.";
    redirect("/debtor/settings?error=" + encodeURIComponent(message));
  }

  redirect("/debtor/settings?success=" + encodeURIComponent("Password updated successfully."));
}
