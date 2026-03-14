import { redirect } from "next/navigation";

import { getCurrentAuthUser, getPortalHomePath } from "@/services/auth-service";
import { getPortalUserForCurrentSession } from "@/services/portal-user-service";

export default async function DashboardPage() {
  const authUser = await getCurrentAuthUser();

  if (!authUser) {
    redirect("/login");
  }

  const portalUser = await getPortalUserForCurrentSession();

  if (!portalUser) {
    redirect("/login?error=" + encodeURIComponent("Portal user profile is missing."));
  }

  redirect(getPortalHomePath(portalUser.role));
}
