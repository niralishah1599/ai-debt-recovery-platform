"use server";

import { redirect } from "next/navigation";
import { unstable_rethrow } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function setPasswordAction(formData: FormData) {
  const password = formData.get("password");
  const confirm = formData.get("confirmPassword");

  if (typeof password !== "string" || password.length < 8) {
    redirect("/set-password?error=" + encodeURIComponent("Password must be at least 8 characters."));
  }

  if (password !== confirm) {
    redirect("/set-password?error=" + encodeURIComponent("Passwords do not match."));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    unstable_rethrow(error);
    const message = error instanceof Error ? error.message : "Unable to set password.";
    redirect("/set-password?error=" + encodeURIComponent(message));
  }

  redirect("/debtor/dashboard");
}
