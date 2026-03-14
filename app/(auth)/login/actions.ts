"use server";

import { redirect } from "next/navigation";
import { unstable_rethrow } from "next/navigation";

import { getCurrentPortalUser, getPortalHomePath, signIn } from "@/services/auth-service";
import { parseLoginForm } from "@/utils/validation/auth";

export async function loginAction(formData: FormData) {
  try {
    const credentials = parseLoginForm(formData);

    await signIn(credentials);
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error ? error.message : "Unable to sign in with those credentials.";

    redirect("/login?error=" + encodeURIComponent(message));
  }

  const portalUser = await getCurrentPortalUser();
  const homePath = portalUser ? getPortalHomePath(portalUser.role) : "/login";

  redirect(homePath);
}
