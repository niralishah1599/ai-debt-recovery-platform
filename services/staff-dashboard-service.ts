import { createClient } from "@/lib/supabase/server";
import { requirePortalRole } from "@/services/auth-service";

export type StaffDashboardMetrics = {
  clientCount: number;
  debtorCount: number;
  accountCount: number;
  activeAccountCount: number;
};

export async function getStaffDashboardMetrics(): Promise<StaffDashboardMetrics> {
  await requirePortalRole("staff");

  const supabase = await createClient();

  const [clientsResult, debtorsResult, accountsResult, activeAccountsResult] =
    await Promise.all([
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("debtors").select("id", { count: "exact", head: true }),
      supabase.from("accounts").select("id", { count: "exact", head: true }),
      supabase
        .from("accounts")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
    ]);

  const errors = [
    clientsResult.error,
    debtorsResult.error,
    accountsResult.error,
    activeAccountsResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(`Unable to load dashboard metrics: ${errors[0]?.message}`);
  }

  return {
    clientCount: clientsResult.count ?? 0,
    debtorCount: debtorsResult.count ?? 0,
    accountCount: accountsResult.count ?? 0,
    activeAccountCount: activeAccountsResult.count ?? 0,
  };
}
