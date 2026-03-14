import { createClient } from "@/lib/supabase/server";
import { requirePortalRole } from "@/services/auth-service";
import type { AccountInput, AccountStatus } from "@/utils/validation/phase2";

export type AccountRecord = {
  id: string;
  debtor_id: string;
  client_id: string;
  balance: string;
  status: AccountStatus;
  created_at: string;
  debtors: {
    id: string;
    name: string;
    email: string;
  } | null;
  clients: {
    id: string;
    name: string;
  } | null;
};

type AccountQueryRow = Omit<AccountRecord, "debtors" | "clients"> & {
  debtors: AccountRecord["debtors"] | AccountRecord["debtors"][];
  clients: AccountRecord["clients"] | AccountRecord["clients"][];
};

function normalizeSingleRelation<T>(relation: T | T[] | undefined): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function normalizeAccountRecord(row: AccountQueryRow): AccountRecord {
  return {
    ...row,
    debtors: normalizeSingleRelation(row.debtors),
    clients: normalizeSingleRelation(row.clients),
  };
}

export async function listAccountsForStaff(): Promise<AccountRecord[]> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select(
      "id, debtor_id, client_id, balance, status, created_at, debtors(id, name, email), clients(id, name)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load accounts: ${error.message}`);
  }

  return (data as AccountQueryRow[]).map(normalizeAccountRecord);
}

export async function createAccountRecord(input: AccountInput): Promise<AccountRecord> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data: debtor, error: debtorError } = await supabase
    .from("debtors")
    .select("id, client_id")
    .eq("id", input.debtorId)
    .maybeSingle();

  if (debtorError) {
    throw new Error(`Unable to validate debtor: ${debtorError.message}`);
  }

  if (!debtor) {
    throw new Error("Debtor record was not found.");
  }

  if (debtor.client_id !== input.clientId) {
    throw new Error("Selected debtor does not belong to the selected client.");
  }

  const { data, error } = await supabase
    .from("accounts")
    .insert({
      debtor_id: input.debtorId,
      client_id: input.clientId,
      balance: input.balance,
      status: input.status,
    })
    .select(
      "id, debtor_id, client_id, balance, status, created_at, debtors(id, name, email), clients(id, name)",
    )
    .single();

  if (error) {
    throw new Error(`Unable to create account: ${error.message}`);
  }

  return normalizeAccountRecord(data as AccountQueryRow);
}

export async function updateAccountStatusRecord(
  id: string,
  status: AccountStatus,
): Promise<AccountRecord> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .update({
      status,
    })
    .eq("id", id)
    .select(
      "id, debtor_id, client_id, balance, status, created_at, debtors(id, name, email), clients(id, name)",
    )
    .single();

  if (error) {
    throw new Error(`Unable to update account: ${error.message}`);
  }

  return normalizeAccountRecord(data as AccountQueryRow);
}
