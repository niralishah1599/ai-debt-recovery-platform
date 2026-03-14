import { createClient } from "@/lib/supabase/server";
import { requirePortalRole } from "@/services/auth-service";
import type { DebtorInput } from "@/utils/validation/phase2";

export type DebtorRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  client_id: string;
  email_consent: boolean;
  sms_consent: boolean;
  timezone: string;
  contact_window_start: number;
  contact_window_end: number;
  created_at: string;
  clients: {
    id: string;
    name: string;
  } | null;
};

type DebtorQueryRow = Omit<DebtorRecord, "clients"> & {
  clients: DebtorRecord["clients"] | DebtorRecord["clients"][];
};

function normalizeClientRelation(
  relation: DebtorRecord["clients"] | DebtorRecord["clients"][] | undefined,
): DebtorRecord["clients"] {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function normalizeDebtorRecord(row: DebtorQueryRow): DebtorRecord {
  return {
    ...row,
    clients: normalizeClientRelation(row.clients),
  };
}

export async function listDebtorsForStaff(): Promise<DebtorRecord[]> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("debtors")
    .select(
      "id, name, email, phone, client_id, email_consent, sms_consent, timezone, contact_window_start, contact_window_end, created_at, clients(id, name)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load debtors: ${error.message}`);
  }

  return (data as DebtorQueryRow[]).map(normalizeDebtorRecord);
}

export async function listDebtorsForSelect(): Promise<
  Array<{
    id: string;
    name: string;
    client_id: string;
  }>
> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("debtors")
    .select("id, name, client_id")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load debtors: ${error.message}`);
  }

  return data as Array<{
    id: string;
    name: string;
    client_id: string;
  }>;
}

export async function createDebtorRecord(input: DebtorInput): Promise<DebtorRecord> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("debtors")
    .insert({
      name: input.name,
      email: input.email,
      phone: input.phone,
      client_id: input.clientId,
      email_consent: input.emailConsent,
      sms_consent: input.smsConsent,
      timezone: input.timezone,
      contact_window_start: input.contactWindowStart,
      contact_window_end: input.contactWindowEnd,
    })
    .select(
      "id, name, email, phone, client_id, email_consent, sms_consent, timezone, contact_window_start, contact_window_end, created_at, clients(id, name)",
    )
    .single();

  if (error) {
    throw new Error(`Unable to create debtor: ${error.message}`);
  }

  return normalizeDebtorRecord(data as DebtorQueryRow);
}

export async function updateDebtorRecord(id: string, input: DebtorInput): Promise<DebtorRecord> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("debtors")
    .update({
      name: input.name,
      email: input.email,
      phone: input.phone,
      client_id: input.clientId,
      email_consent: input.emailConsent,
      sms_consent: input.smsConsent,
      timezone: input.timezone,
      contact_window_start: input.contactWindowStart,
      contact_window_end: input.contactWindowEnd,
    })
    .eq("id", id)
    .select(
      "id, name, email, phone, client_id, email_consent, sms_consent, timezone, contact_window_start, contact_window_end, created_at, clients(id, name)",
    )
    .single();

  if (error) {
    throw new Error(`Unable to update debtor: ${error.message}`);
  }

  return normalizeDebtorRecord(data as DebtorQueryRow);
}
