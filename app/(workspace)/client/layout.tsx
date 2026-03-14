import { redirect } from "next/navigation";

import { PortalShell } from "@/components/workspace/portal-shell";
import { getCurrentAuthUser, getPortalHomePath } from "@/services/auth-service";
import { getPortalUserForCurrentSession } from "@/services/portal-user-service";

const clientLinks = [
  { href: "/client/dashboard", label: "Dashboard" },
  { href: "/client/accounts", label: "Accounts" },
  { href: "/client/payments", label: "Payments" },
  { href: "/client/campaigns", label: "Campaigns" },
];

export default async function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authUser = await getCurrentAuthUser();

  if (!authUser) {
    redirect("/login");
  }

  const portalUser = await getPortalUserForCurrentSession();

  if (!portalUser) {
    redirect("/login?error=" + encodeURIComponent("Portal user profile is missing."));
  }

  if (portalUser.role !== "client") {
    redirect(getPortalHomePath(portalUser.role));
  }

  if (!portalUser.client_id) {
    redirect("/login?error=" + encodeURIComponent("Client assignment is missing."));
  }

  return (
    <PortalShell email={authUser.email ?? "unknown"} links={clientLinks} role={portalUser.role}>
      {children}
    </PortalShell>
  );
}
