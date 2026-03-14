import { createClient } from "@/lib/supabase/server";
import { requirePortalRole } from "@/services/auth-service";
import { evaluateComplianceForCampaignTargets } from "@/services/compliance-service";
import type {
  CampaignChannel,
  CampaignExecutionInput,
  CampaignInput,
} from "@/utils/validation/phase3";

export type CampaignRecord = {
  id: string;
  name: string;
  channel: CampaignChannel;
  message_template: string;
  created_at: string;
};

export type CampaignTargetAccount = {
  id: string;
  balance: string;
  status: "active" | "paid" | "suppressed" | "closed";
  client_id: string;
  debtors: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    email_consent: boolean;
    sms_consent: boolean;
    timezone: string;
    contact_window_start: number;
    contact_window_end: number;
  } | null;
  clients: {
    id: string;
    name: string;
  } | null;
};

type CampaignTargetAccountQueryRow = Omit<CampaignTargetAccount, "debtors" | "clients"> & {
  debtors: CampaignTargetAccount["debtors"] | CampaignTargetAccount["debtors"][];
  clients: CampaignTargetAccount["clients"] | CampaignTargetAccount["clients"][];
};

function normalizeSingleRelation<T>(relation: T | T[] | undefined): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function normalizeCampaignTargetAccount(
  row: CampaignTargetAccountQueryRow,
): CampaignTargetAccount {
  return {
    ...row,
    debtors: normalizeSingleRelation(row.debtors),
    clients: normalizeSingleRelation(row.clients),
  };
}

export async function listCampaignsForStaff(): Promise<CampaignRecord[]> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("id, name, channel, message_template, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load campaigns: ${error.message}`);
  }

  return data as CampaignRecord[];
}

export async function listCampaignsForSelect(): Promise<Array<Pick<CampaignRecord, "id" | "name">>> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load campaigns: ${error.message}`);
  }

  return data as Array<Pick<CampaignRecord, "id" | "name">>;
}

export async function createCampaignRecord(input: CampaignInput): Promise<CampaignRecord> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      name: input.name,
      channel: input.channel,
      message_template: input.messageTemplate,
    })
    .select("id, name, channel, message_template, created_at")
    .single();

  if (error) {
    throw new Error(`Unable to create campaign: ${error.message}`);
  }

  return data as CampaignRecord;
}

export async function listCampaignTargetAccountsForStaff(): Promise<CampaignTargetAccount[]> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select(
      "id, balance, status, client_id, debtors(id, name, email, phone, email_consent, sms_consent, timezone, contact_window_start, contact_window_end), clients(id, name)",
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load campaign targets: ${error.message}`);
  }

  return (data as CampaignTargetAccountQueryRow[]).map(normalizeCampaignTargetAccount);
}

export async function executeCampaign(
  input: CampaignExecutionInput,
): Promise<{
  campaign: CampaignRecord;
  messageCount: number;
  sentCount: number;
  blockedCount: number;
  failedCount: number;
}> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, name, channel, message_template, created_at")
    .eq("id", input.campaignId)
    .maybeSingle();

  if (campaignError) {
    throw new Error(`Unable to load campaign: ${campaignError.message}`);
  }

  if (!campaign) {
    throw new Error("Campaign was not found.");
  }

  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select(
      "id, balance, status, client_id, debtors(id, name, email, phone, email_consent, sms_consent, timezone, contact_window_start, contact_window_end), clients(id, name)",
    )
    .in("id", input.accountIds);

  if (accountsError) {
    throw new Error(`Unable to load campaign targets: ${accountsError.message}`);
  }

  const normalizedAccounts = (accounts as CampaignTargetAccountQueryRow[]).map(
    normalizeCampaignTargetAccount,
  );

  if (normalizedAccounts.length !== input.accountIds.length) {
    throw new Error("One or more selected accounts were not found.");
  }

  const invalidAccount = normalizedAccounts.find((account) => account.status !== "active");

  if (invalidAccount) {
    throw new Error("Only active accounts can be targeted by a campaign.");
  }

  const { evaluations } = await evaluateComplianceForCampaignTargets({
    campaign: campaign as CampaignRecord,
    accounts: normalizedAccounts,
  });

  const sentAt = new Date().toISOString();
  const messageRows = evaluations.map((evaluation) => ({
    account_id: evaluation.account.id,
    campaign_id: campaign.id,
    channel: campaign.channel,
    status: evaluation.finalStatus,
    sent_at: sentAt,
  }));

  const { data: insertedMessages, error: insertError } = await supabase
    .from("messages")
    .insert(messageRows)
    .select("id, account_id");

  if (insertError) {
    throw new Error(`Unable to execute campaign: ${insertError.message}`);
  }

  const messageIdByAccountId = new Map(
    (insertedMessages ?? []).map((message) => [message.account_id as string, message.id as string]),
  );

  const complianceEventRows = evaluations.flatMap((evaluation) => {
    const messageId = messageIdByAccountId.get(evaluation.account.id) ?? null;

    return evaluation.events.map((event) => ({
      account_id: evaluation.account.id,
      rule_id: event.ruleId,
      campaign_id: campaign.id,
      message_id: messageId,
      channel: campaign.channel,
      result: event.result,
      detail: event.detail,
    }));
  });

  if (complianceEventRows.length > 0) {
    const { error: complianceEventError } = await supabase
      .from("compliance_events")
      .insert(complianceEventRows);

    if (complianceEventError) {
      throw new Error(`Unable to record compliance decisions: ${complianceEventError.message}`);
    }
  }

  const blockedCount = messageRows.filter((message) => message.status === "blocked").length;
  const failedCount = messageRows.filter((message) => message.status === "failed").length;

  return {
    campaign: campaign as CampaignRecord,
    messageCount: messageRows.length,
    sentCount: messageRows.length - failedCount - blockedCount,
    blockedCount,
    failedCount,
  };
}
