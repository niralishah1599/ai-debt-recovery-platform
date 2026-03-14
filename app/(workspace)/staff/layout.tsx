import { redirect } from "next/navigation";

import { PortalShell } from "@/components/workspace/portal-shell";
import { getCurrentAuthUser, getPortalHomePath } from "@/services/auth-service";
import { getPortalUserForCurrentSession } from "@/services/portal-user-service";

const staffLinks = [
  { href: "/staff/dashboard", label: "Dashboard" },
  { href: "/staff/clients", label: "Clients" },
  { href: "/staff/debtors", label: "Debtors" },
  { href: "/staff/accounts", label: "Accounts" },
  { href: "/staff/campaigns", label: "Campaigns" },
  { href: "/staff/compliance", label: "Compliance" },
  { href: "/staff/analytics", label: "Analytics" },
];

export default async function StaffLayout({
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

  if (portalUser.role !== "staff") {
    redirect(getPortalHomePath(portalUser.role));
  }

  return (
    <PortalShell
      email={authUser.email ?? "unknown"}
      links={staffLinks}
      role={portalUser.role}
    >
      {children}
    </PortalShell>
  );
}
