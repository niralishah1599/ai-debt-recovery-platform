import { createClient } from "@/lib/supabase/server";
import { requirePortalRole } from "@/services/auth-service";

type DebtorAccountRelation = {
  id: string;
  balance: string;
  status: "active" | "paid" | "suppressed" | "closed";
  created_at: string;
};

export type DebtorPortalSummary = {
  debtorName: string;
  debtorEmail: string;
  debtorPhone: string | null;
  outstandingBalance: number;
  activeAccounts: number;
  paidAccounts: number;
  totalAccounts: number;
  successfulPayments: number;
  recentMessages: number;
};

export type DebtorPortalAccountRecord = {
  id: string;
  balance: string;
  status: "active" | "paid" | "suppressed" | "closed";
  created_at: string;
  clients: {
    id: string;
    name: string;
  } | null;
};

export type DebtorPortalPaymentRecord = {
  id: string;
  amount: string;
  payment_status: "pending" | "succeeded" | "failed" | "canceled";
  payment_reference: string | null;
  created_at: string;
  accounts: DebtorAccountRelation | null;
};

export type DebtorPortalMessageRecord = {
  id: string;
  channel: "email" | "sms";
  status: "queued" | "sent" | "delivered" | "failed" | "blocked";
  sent_at: string | null;
  campaigns: {
    id: string;
    name: string;
  } | null;
  accounts: DebtorAccountRelation | null;
};

type DebtorRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

type AccountQueryRow = Omit<DebtorPortalAccountRecord, "clients"> & {
  clients: DebtorPortalAccountRecord["clients"] | DebtorPortalAccountRecord["clients"][];
};

type PaymentQueryRow = Omit<DebtorPortalPaymentRecord, "accounts"> & {
  accounts: DebtorPortalPaymentRecord["accounts"] | DebtorPortalPaymentRecord["accounts"][];
};

type MessageQueryRow = Omit<DebtorPortalMessageRecord, "campaigns" | "accounts"> & {
  campaigns: DebtorPortalMessageRecord["campaigns"] | DebtorPortalMessageRecord["campaigns"][];
  accounts: DebtorPortalMessageRecord["accounts"] | DebtorPortalMessageRecord["accounts"][];
};

function normalizeSingleRelation<T>(relation: T | T[] | undefined): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function normalizeAccount(row: AccountQueryRow): DebtorPortalAccountRecord {
  return {
    ...row,
    clients: normalizeSingleRelation(row.clients),
  };
}

function normalizePayment(row: PaymentQueryRow): DebtorPortalPaymentRecord {
  return {
    ...row,
    accounts: normalizeSingleRelation(row.accounts),
  };
}

function normalizeMessage(row: MessageQueryRow): DebtorPortalMessageRecord {
  return {
    ...row,
    campaigns: normalizeSingleRelation(row.campaigns),
    accounts: normalizeSingleRelation(row.accounts),
  };
}

async function requireDebtorContext() {
  const { portalUser } = await requirePortalRole("debtor");

  if (!portalUser.debtor_id) {
    throw new Error("Debtor portal user is missing a debtor assignment.");
  }

  return {
    debtorId: portalUser.debtor_id,
    supabase: await createClient(),
  };
}

export async function getDebtorPortalSummary(): Promise<DebtorPortalSummary> {
  const { debtorId, supabase } = await requireDebtorContext();

  const [debtorResult, accountsResult, paymentsResult, messagesResult] = await Promise.all([
    supabase.from("debtors").select("id, name, email, phone").eq("id", debtorId).maybeSingle(),
    supabase.from("accounts").select("id, balance, status"),
    supabase.from("payments").select("id, amount, payment_status"),
    supabase.from("messages").select("id"),
  ]);

  const errors = [
    debtorResult.error,
    accountsResult.error,
    paymentsResult.error,
    messagesResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(`Unable to load debtor portal summary: ${errors[0]?.message}`);
  }

  const debtor = debtorResult.data as DebtorRecord | null;
  const accounts = (accountsResult.data ?? []) as Array<{
    id: string;
    balance: string;
    status: "active" | "paid" | "suppressed" | "closed";
  }>;
  const payments = (paymentsResult.data ?? []) as Array<{
    id: string;
    amount: string;
    payment_status: "pending" | "succeeded" | "failed" | "canceled";
  }>;

  return {
    debtorName: debtor?.name ?? "Debtor account",
    debtorEmail: debtor?.email ?? "unknown",
    debtorPhone: debtor?.phone ?? null,
    outstandingBalance: accounts.reduce((total, account) => total + Number(account.balance), 0),
    activeAccounts: accounts.filter((account) => account.status === "active").length,
    paidAccounts: accounts.filter((account) => account.status === "paid").length,
    totalAccounts: accounts.length,
    successfulPayments: payments.filter((payment) => payment.payment_status === "succeeded").length,
    recentMessages: messagesResult.data?.length ?? 0,
  };
}

export async function listDebtorPortalAccounts(): Promise<DebtorPortalAccountRecord[]> {
  const { supabase } = await requireDebtorContext();
  const { data, error } = await supabase
    .from("accounts")
    .select("id, balance, status, created_at, clients(id, name)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load debtor accounts: ${error.message}`);
  }

  return (data as AccountQueryRow[]).map(normalizeAccount);
}

export async function listDebtorPortalPayments(
  limit = 30,
): Promise<DebtorPortalPaymentRecord[]> {
  const { supabase } = await requireDebtorContext();
  const { data, error } = await supabase
    .from("payments")
    .select("id, amount, payment_status, payment_reference, created_at, accounts(id, balance, status, created_at)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to load debtor payments: ${error.message}`);
  }

  return (data as PaymentQueryRow[]).map(normalizePayment);
}

export async function listDebtorPortalMessages(
  limit = 20,
): Promise<DebtorPortalMessageRecord[]> {
  const { supabase } = await requireDebtorContext();
  const { data, error } = await supabase
    .from("messages")
    .select("id, channel, status, sent_at, campaigns(id, name), accounts(id, balance, status, created_at)")
    .order("sent_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to load debtor communications: ${error.message}`);
  }

  return (data as MessageQueryRow[]).map(normalizeMessage);
}
