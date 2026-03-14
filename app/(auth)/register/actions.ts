"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_rethrow } from "next/navigation";

import { signUp } from "@/services/auth-service";
import { parseRegistrationForm } from "@/utils/validation/auth";

function buildConfirmationUrl(headersList: Headers) {
  const origin = headersList.get("origin");

  if (origin) {
    return `${origin}/api/auth/callback`;
  }

  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "http";

  if (!host) {
    return "http://localhost:3000/api/auth/callback";
  }

  return `${protocol}://${host}/api/auth/callback`;
}

export async function registerAction(formData: FormData) {
  try {
    const registration = parseRegistrationForm(formData);
    const headerStore = await headers();

    await signUp(registration, buildConfirmationUrl(headerStore));
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error ? error.message : "Unable to create the portal account.";

    redirect("/register?error=" + encodeURIComponent(message));
  }

  redirect(
    "/login?message=" +
      encodeURIComponent("Check your email to confirm the account before signing in."),
  );
}
