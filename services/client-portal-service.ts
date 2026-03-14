import { createClient } from "@/lib/supabase/server";
import { requirePortalRole } from "@/services/auth-service";

type DebtorRelation = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

export type ClientPortalSummary = {
  clientName: string;
  outstandingBalance: number;
  collectedAmount: number;
  collectionRate: number;
  activeAccounts: number;
  totalAccounts: number;
  totalDebtors: number;
  paymentsReceived: number;
  campaignMessages: number;
  complianceIncidents: number;
};

export type ClientPortalAccountRecord = {
  id: string;
  balance: string;
  status: "active" | "paid" | "suppressed" | "closed";
  created_at: string;
  debtors: DebtorRelation | null;
};

export type ClientPortalPaymentRecord = {
  id: string;
  amount: string;
  payment_status: "pending" | "succeeded" | "failed" | "canceled";
  payment_reference: string | null;
  created_at: string;
  accounts: {
    id: string;
    balance: string;
    debtors: DebtorRelation | null;
  } | null;
};

export type ClientPortalMessageRecord = {
  id: string;
  account_id: string;
  campaign_id: string;
  channel: "email" | "sms";
  status: "queued" | "sent" | "delivered" | "failed" | "blocked";
  sent_at: string | null;
  campaigns: {
    id: string;
    name: string;
  } | null;
  accounts: {
    id: string;
    balance: string;
    debtors: DebtorRelation | null;
  } | null;
};

export type ClientPortalCampaignSummary = {
  campaignId: string;
  campaignName: string;
  totalMessages: number;
  deliveredMessages: number;
  blockedMessages: number;
  lastActivityAt: string | null;
};

export type ClientPortalComplianceEventRecord = {
  id: string;
  result: "allowed" | "blocked" | "flagged";
  detail: string;
  channel: "email" | "sms" | null;
  created_at: string;
  compliance_rules: {
    id: string;
    rule_name: string;
    rule_type: string;
  } | null;
  campaigns: {
    id: string;
    name: string;
  } | null;
  accounts: {
    id: string;
    balance: string;
    debtors: DebtorRelation | null;
  } | null;
};

type AccountQueryRow = Omit<ClientPortalAccountRecord, "debtors"> & {
  debtors: ClientPortalAccountRecord["debtors"] | ClientPortalAccountRecord["debtors"][];
};

type PaymentQueryRow = Omit<ClientPortalPaymentRecord, "accounts"> & {
  accounts:
    | (Omit<NonNullable<ClientPortalPaymentRecord["accounts"]>, "debtors"> & {
        debtors:
          | NonNullable<ClientPortalPaymentRecord["accounts"]>["debtors"]
          | NonNullable<ClientPortalPaymentRecord["accounts"]>["debtors"][];
      })
    | Array<
        Omit<NonNullable<ClientPortalPaymentRecord["accounts"]>, "debtors"> & {
          debtors:
            | NonNullable<ClientPortalPaymentRecord["accounts"]>["debtors"]
            | NonNullable<ClientPortalPaymentRecord["accounts"]>["debtors"][];
        }
      >;
};

type MessageQueryRow = Omit<ClientPortalMessageRecord, "campaigns" | "accounts"> & {
  campaigns: ClientPortalMessageRecord["campaigns"] | ClientPortalMessageRecord["campaigns"][];
  accounts:
    | (Omit<NonNullable<ClientPortalMessageRecord["accounts"]>, "debtors"> & {
        debtors:
          | NonNullable<ClientPortalMessageRecord["accounts"]>["debtors"]
          | NonNullable<ClientPortalMessageRecord["accounts"]>["debtors"][];
      })
    | Array<
        Omit<NonNullable<ClientPortalMessageRecord["accounts"]>, "debtors"> & {
          debtors:
            | NonNullable<ClientPortalMessageRecord["accounts"]>["debtors"]
            | NonNullable<ClientPortalMessageRecord["accounts"]>["debtors"][];
        }
      >;
};

type ComplianceEventQueryRow = Omit<
  ClientPortalComplianceEventRecord,
  "compliance_rules" | "campaigns" | "accounts"
> & {
  compliance_rules:
    | ClientPortalComplianceEventRecord["compliance_rules"]
    | ClientPortalComplianceEventRecord["compliance_rules"][];
  campaigns:
    | ClientPortalComplianceEventRecord["campaigns"]
    | ClientPortalComplianceEventRecord["campaigns"][];
  accounts:
    | (Omit<NonNullable<ClientPortalComplianceEventRecord["accounts"]>, "debtors"> & {
        debtors:
          | NonNullable<ClientPortalComplianceEventRecord["accounts"]>["debtors"]
          | NonNullable<ClientPortalComplianceEventRecord["accounts"]>["debtors"][];
      })
    | Array<
        Omit<NonNullable<ClientPortalComplianceEventRecord["accounts"]>, "debtors"> & {
          debtors:
            | NonNullable<ClientPortalComplianceEventRecord["accounts"]>["debtors"]
            | NonNullable<ClientPortalComplianceEventRecord["accounts"]>["debtors"][];
        }
      >;
};

function normalizeSingleRelation<T>(relation: T | T[] | undefined): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function normalizeAccount(row: AccountQueryRow): ClientPortalAccountRecord {
  return {
    ...row,
    debtors: normalizeSingleRelation(row.debtors),
  };
}

function normalizePayment(row: PaymentQueryRow): ClientPortalPaymentRecord {
  const account = normalizeSingleRelation(row.accounts);

  return {
    ...row,
    accounts: account
      ? {
          ...account,
          debtors: normalizeSingleRelation(account.debtors),
        }
      : null,
  };
}

function normalizeMessage(row: MessageQueryRow): ClientPortalMessageRecord {
  const account = normalizeSingleRelation(row.accounts);

  return {
    ...row,
    campaigns: normalizeSingleRelation(row.campaigns),
    accounts: account
      ? {
          ...account,
          debtors: normalizeSingleRelation(account.debtors),
        }
      : null,
  };
}

function normalizeComplianceEvent(
  row: ComplianceEventQueryRow,
): ClientPortalComplianceEventRecord {
  const account = normalizeSingleRelation(row.accounts);

  return {
    ...row,
    compliance_rules: normalizeSingleRelation(row.compliance_rules),
    campaigns: normalizeSingleRelation(row.campaigns),
    accounts: account
      ? {
          ...account,
          debtors: normalizeSingleRelation(account.debtors),
        }
      : null,
  };
}

async function requireClientContext() {
  const { portalUser } = await requirePortalRole("client");

  if (!portalUser.client_id) {
    throw new Error("Client portal user is missing a client assignment.");
  }

  return {
    clientId: portalUser.client_id,
    supabase: await createClient(),
  };
}

export async function getClientPortalSummary(): Promise<ClientPortalSummary> {
  const { clientId, supabase } = await requireClientContext();

  const [clientResult, accountsResult, debtorsResult, paymentsResult, messagesResult, complianceResult] =
    await Promise.all([
      supabase.from("clients").select("id, name").eq("id", clientId).maybeSingle(),
      supabase.from("accounts").select("id, balance, status"),
      supabase.from("debtors").select("id", { count: "exact", head: true }).eq("client_id", clientId),
      supabase.from("payments").select("id, amount, payment_status"),
      supabase.from("messages").select("id"),
      supabase.from("compliance_events").select("id"),
    ]);

  const errors = [
    clientResult.error,
    accountsResult.error,
    debtorsResult.error,
    paymentsResult.error,
    messagesResult.error,
    complianceResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(`Unable to load client portal summary: ${errors[0]?.message}`);
  }

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

  const outstandingBalance = accounts.reduce(
    (total, account) => total + Number(account.balance),
    0,
  );
  const collectedAmount = payments
    .filter((payment) => payment.payment_status === "succeeded")
    .reduce((total, payment) => total + Number(payment.amount), 0);
  const collectionRateDenominator = outstandingBalance + collectedAmount;

  return {
    clientName: clientResult.data?.name ?? "Client portfolio",
    outstandingBalance,
    collectedAmount,
    collectionRate:
      collectionRateDenominator > 0 ? collectedAmount / collectionRateDenominator : 0,
    activeAccounts: accounts.filter((account) => account.status === "active").length,
    totalAccounts: accounts.length,
    totalDebtors: debtorsResult.count ?? 0,
    paymentsReceived: payments.filter((payment) => payment.payment_status === "succeeded").length,
    campaignMessages: messagesResult.data?.length ?? 0,
    complianceIncidents: complianceResult.data?.length ?? 0,
  };
}

export async function listClientPortalAccounts(): Promise<ClientPortalAccountRecord[]> {
  const { clientId, supabase } = await requireClientContext();
  const { data, error } = await supabase
    .from("accounts")
    .select("id, balance, status, created_at, debtors(id, name, email, phone)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load client accounts: ${error.message}`);
  }

  return (data as AccountQueryRow[]).map(normalizeAccount);
}

export async function listClientPortalPayments(
  limit = 30,
): Promise<ClientPortalPaymentRecord[]> {
  const { supabase } = await requireClientContext();
  const { data, error } = await supabase
    .from("payments")
    .select("id, amount, payment_status, payment_reference, created_at, accounts(id, balance, debtors(id, name, email, phone))")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to load client payments: ${error.message}`);
  }

  return (data as PaymentQueryRow[]).map(normalizePayment);
}

export async function listClientPortalMessages(
  limit = 40,
): Promise<ClientPortalMessageRecord[]> {
  const { supabase } = await requireClientContext();
  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, account_id, campaign_id, channel, status, sent_at, campaigns(id, name), accounts(id, balance, debtors(id, name, email, phone))",
    )
    .order("sent_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to load client campaign activity: ${error.message}`);
  }

  return (data as MessageQueryRow[]).map(normalizeMessage);
}

export async function listClientPortalCampaignSummaries(): Promise<
  ClientPortalCampaignSummary[]
> {
  const messages = await listClientPortalMessages(120);
  const campaignMap = new Map<string, ClientPortalCampaignSummary>();

  for (const message of messages) {
    if (!message.campaigns) {
      continue;
    }

    const existing = campaignMap.get(message.campaigns.id) ?? {
      campaignId: message.campaigns.id,
      campaignName: message.campaigns.name,
      totalMessages: 0,
      deliveredMessages: 0,
      blockedMessages: 0,
      lastActivityAt: null,
    };

    existing.totalMessages += 1;

    if (message.status === "delivered") {
      existing.deliveredMessages += 1;
    }

    if (message.status === "blocked") {
      existing.blockedMessages += 1;
    }

    if (!existing.lastActivityAt || (message.sent_at && message.sent_at > existing.lastActivityAt)) {
      existing.lastActivityAt = message.sent_at;
    }

    campaignMap.set(message.campaigns.id, existing);
  }

  return Array.from(campaignMap.values()).sort(
    (left, right) => right.totalMessages - left.totalMessages,
  );
}

export async function listClientPortalComplianceEvents(
  limit = 30,
): Promise<ClientPortalComplianceEventRecord[]> {
  const { supabase } = await requireClientContext();
  const { data, error } = await supabase
    .from("compliance_events")
    .select(
      "id, result, detail, channel, created_at, compliance_rules(id, rule_name, rule_type), campaigns(id, name), accounts(id, balance, debtors(id, name, email, phone))",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to load client compliance incidents: ${error.message}`);
  }

  return (data as ComplianceEventQueryRow[]).map(normalizeComplianceEvent);
}
