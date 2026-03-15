import { redirect } from "next/navigation";

import { PortalShell } from "@/components/workspace/portal-shell";
import { getCurrentAuthUser, getPortalHomePath } from "@/services/auth-service";
import { getPortalUserForCurrentSession } from "@/services/portal-user-service";

const debtorLinks = [
  { href: "/debtor/dashboard", label: "Dashboard" },
  { href: "/debtor/accounts", label: "Accounts" },
  { href: "/debtor/payments", label: "Payments" },
  { href: "/debtor/settings", label: "Change Password" },
];

export default async function DebtorLayout({
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

  if (portalUser.role !== "debtor") {
    redirect(getPortalHomePath(portalUser.role));
  }

  if (!portalUser.debtor_id) {
    redirect("/login?error=" + encodeURIComponent("Debtor assignment is missing."));
  }

  return (
    <PortalShell email={authUser.email ?? "unknown"} links={debtorLinks} role={portalUser.role}>
      {children}
    </PortalShell>
  );
}
