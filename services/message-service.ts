import { createClient } from "@/lib/supabase/server";
import { requirePortalRole } from "@/services/auth-service";
import type { CampaignChannel } from "@/utils/validation/phase3";

export type MessageHistoryRecord = {
  id: string;
  account_id: string;
  campaign_id: string;
  channel: CampaignChannel;
  status: "queued" | "sent" | "delivered" | "failed" | "blocked";
  sent_at: string | null;
  campaigns: {
    id: string;
    name: string;
  } | null;
  accounts: {
    id: string;
    balance: string;
    debtors: {
      id: string;
      name: string;
      email: string;
    } | null;
    clients: {
      id: string;
      name: string;
    } | null;
  } | null;
};

type MessageHistoryQueryRow = Omit<MessageHistoryRecord, "campaigns" | "accounts"> & {
  campaigns: MessageHistoryRecord["campaigns"] | MessageHistoryRecord["campaigns"][];
  accounts:
    | (Omit<NonNullable<MessageHistoryRecord["accounts"]>, "debtors" | "clients"> & {
        debtors:
          | NonNullable<MessageHistoryRecord["accounts"]>["debtors"]
          | NonNullable<MessageHistoryRecord["accounts"]>["debtors"][];
        clients:
          | NonNullable<MessageHistoryRecord["accounts"]>["clients"]
          | NonNullable<MessageHistoryRecord["accounts"]>["clients"][];
      })
    | Array<
        Omit<NonNullable<MessageHistoryRecord["accounts"]>, "debtors" | "clients"> & {
          debtors:
            | NonNullable<MessageHistoryRecord["accounts"]>["debtors"]
            | NonNullable<MessageHistoryRecord["accounts"]>["debtors"][];
          clients:
            | NonNullable<MessageHistoryRecord["accounts"]>["clients"]
            | NonNullable<MessageHistoryRecord["accounts"]>["clients"][];
        }
      >;
};

function normalizeSingleRelation<T>(relation: T | T[] | undefined): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function normalizeMessageHistoryRecord(row: MessageHistoryQueryRow): MessageHistoryRecord {
  const account = normalizeSingleRelation(row.accounts);

  return {
    ...row,
    campaigns: normalizeSingleRelation(row.campaigns),
    accounts: account
      ? {
          ...account,
          debtors: normalizeSingleRelation(account.debtors),
          clients: normalizeSingleRelation(account.clients),
        }
      : null,
  };
}

export async function listMessagesForStaff(limit = 24): Promise<MessageHistoryRecord[]> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, account_id, campaign_id, channel, status, sent_at, campaigns(id, name), accounts(id, balance, debtors(id, name, email), clients(id, name))",
    )
    .order("sent_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to load messages: ${error.message}`);
  }

  return (data as MessageHistoryQueryRow[]).map(normalizeMessageHistoryRecord);
}
