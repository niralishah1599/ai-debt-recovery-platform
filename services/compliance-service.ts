import { createClient } from "@/lib/supabase/server";
import { requirePortalRole } from "@/services/auth-service";
import type { CampaignRecord, CampaignTargetAccount } from "@/services/campaign-service";
import type { CampaignChannel } from "@/utils/validation/phase3";
import type { ComplianceRuleInput, ComplianceRuleType } from "@/utils/validation/phase4";

export type ComplianceRuleRecord = {
  id: string;
  rule_name: string;
  rule_type: ComplianceRuleType;
  is_active: boolean;
  created_at: string;
};

export type ComplianceEventRecord = {
  id: string;
  account_id: string;
  rule_id: string;
  campaign_id: string | null;
  message_id: string | null;
  channel: CampaignChannel | null;
  result: "allowed" | "blocked" | "flagged";
  detail: string;
  created_at: string;
  compliance_rules: {
    id: string;
    rule_name: string;
    rule_type: ComplianceRuleType;
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
  campaigns: {
    id: string;
    name: string;
  } | null;
};

type ComplianceEventQueryRow = Omit<
  ComplianceEventRecord,
  "compliance_rules" | "accounts" | "campaigns"
> & {
  compliance_rules:
    | ComplianceEventRecord["compliance_rules"]
    | ComplianceEventRecord["compliance_rules"][];
  accounts:
    | (Omit<NonNullable<ComplianceEventRecord["accounts"]>, "debtors" | "clients"> & {
        debtors:
          | NonNullable<ComplianceEventRecord["accounts"]>["debtors"]
          | NonNullable<ComplianceEventRecord["accounts"]>["debtors"][];
        clients:
          | NonNullable<ComplianceEventRecord["accounts"]>["clients"]
          | NonNullable<ComplianceEventRecord["accounts"]>["clients"][];
      })
    | Array<
        Omit<NonNullable<ComplianceEventRecord["accounts"]>, "debtors" | "clients"> & {
          debtors:
            | NonNullable<ComplianceEventRecord["accounts"]>["debtors"]
            | NonNullable<ComplianceEventRecord["accounts"]>["debtors"][];
          clients:
            | NonNullable<ComplianceEventRecord["accounts"]>["clients"]
            | NonNullable<ComplianceEventRecord["accounts"]>["clients"][];
        }
      >;
  campaigns: ComplianceEventRecord["campaigns"] | ComplianceEventRecord["campaigns"][];
};

type ComplianceEvaluation = {
  account: CampaignTargetAccount;
  finalStatus: "sent" | "blocked" | "failed";
  detail: string;
  events: Array<{
    ruleId: string;
    result: "allowed" | "blocked";
    detail: string;
  }>;
};

function normalizeSingleRelation<T>(relation: T | T[] | undefined): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function normalizeComplianceEvent(row: ComplianceEventQueryRow): ComplianceEventRecord {
  const account = normalizeSingleRelation(row.accounts);

  return {
    ...row,
    campaigns: normalizeSingleRelation(row.campaigns),
    compliance_rules: normalizeSingleRelation(row.compliance_rules),
    accounts: account
      ? {
          ...account,
          debtors: normalizeSingleRelation(account.debtors),
          clients: normalizeSingleRelation(account.clients),
        }
      : null,
  };
}

function getLocalHour(now: Date, timeZone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone,
    });

    const parts = formatter.formatToParts(now);
    const hourPart = parts.find((part) => part.type === "hour");

    if (!hourPart) {
      return now.getUTCHours();
    }

    return Number(hourPart.value);
  } catch {
    return now.getUTCHours();
  }
}

function evaluateRuleForAccount(
  rule: ComplianceRuleRecord,
  campaign: CampaignRecord,
  account: CampaignTargetAccount,
  now: Date,
): {
  result: "allowed" | "blocked";
  detail: string;
} {
  if (rule.rule_type === "account_status") {
    if (account.status === "active") {
      return {
        result: "allowed",
        detail: "Account status is active and eligible for outbound communication.",
      };
    }

    return {
      result: "blocked",
      detail: `Account status is ${account.status} and cannot receive campaign messages.`,
    };
  }

  if (rule.rule_type === "consent") {
    if (campaign.channel === "email") {
      if (account.debtors?.email_consent) {
        return {
          result: "allowed",
          detail: "Debtor email consent is on file for outbound email.",
        };
      }

      return {
        result: "blocked",
        detail: "Debtor email consent is not on file.",
      };
    }

    if (account.debtors?.sms_consent) {
      return {
        result: "allowed",
        detail: "Debtor SMS consent is on file for outbound text messaging.",
      };
    }

    return {
      result: "blocked",
      detail: "Debtor SMS consent is not on file.",
    };
  }

  const localHour = getLocalHour(now, account.debtors?.timezone ?? "UTC");
  const startHour = account.debtors?.contact_window_start ?? 8;
  const endHour = account.debtors?.contact_window_end ?? 20;

  if (localHour >= startHour && localHour < endHour) {
    return {
      result: "allowed",
      detail: `Current local hour ${localHour}:00 is within the debtor contact window.`,
    };
  }

  return {
    result: "blocked",
    detail: `Current local hour ${localHour}:00 is outside the debtor contact window of ${startHour}:00-${endHour}:00.`,
  };
}

export async function listComplianceRulesForStaff(): Promise<ComplianceRuleRecord[]> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("compliance_rules")
    .select("id, rule_name, rule_type, is_active, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to load compliance rules: ${error.message}`);
  }

  return data as ComplianceRuleRecord[];
}

export async function createComplianceRuleRecord(
  input: ComplianceRuleInput,
): Promise<ComplianceRuleRecord> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("compliance_rules")
    .insert({
      rule_name: input.ruleName,
      rule_type: input.ruleType,
      is_active: input.isActive,
    })
    .select("id, rule_name, rule_type, is_active, created_at")
    .single();

  if (error) {
    throw new Error(`Unable to create compliance rule: ${error.message}`);
  }

  return data as ComplianceRuleRecord;
}

export async function updateComplianceRuleRecord(
  id: string,
  input: ComplianceRuleInput,
): Promise<ComplianceRuleRecord> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("compliance_rules")
    .update({
      rule_name: input.ruleName,
      rule_type: input.ruleType,
      is_active: input.isActive,
    })
    .eq("id", id)
    .select("id, rule_name, rule_type, is_active, created_at")
    .single();

  if (error) {
    throw new Error(`Unable to update compliance rule: ${error.message}`);
  }

  return data as ComplianceRuleRecord;
}

export async function listComplianceEventsForStaff(limit = 40): Promise<ComplianceEventRecord[]> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("compliance_events")
    .select(
      "id, account_id, rule_id, campaign_id, message_id, channel, result, detail, created_at, compliance_rules(id, rule_name, rule_type), campaigns(id, name), accounts(id, balance, debtors(id, name, email), clients(id, name))",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to load compliance events: ${error.message}`);
  }

  return (data as ComplianceEventQueryRow[]).map(normalizeComplianceEvent);
}

export async function evaluateComplianceForCampaignTargets(params: {
  campaign: CampaignRecord;
  accounts: CampaignTargetAccount[];
}): Promise<{
  evaluations: ComplianceEvaluation[];
  activeRules: ComplianceRuleRecord[];
}> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("compliance_rules")
    .select("id, rule_name, rule_type, is_active, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to load active compliance rules: ${error.message}`);
  }

  const activeRules = data as ComplianceRuleRecord[];
  const now = new Date();

  const evaluations = params.accounts.map((account) => {
    const events = activeRules.map((rule) => {
      const decision = evaluateRuleForAccount(rule, params.campaign, account, now);
      return {
        ruleId: rule.id,
        result: decision.result,
        detail: decision.detail,
      };
    });

    const hasBlockedRule = events.some((event) => event.result === "blocked");
    const hasDestination =
      params.campaign.channel === "email"
        ? Boolean(account.debtors?.email)
        : Boolean(account.debtors?.phone);

    let finalStatus: "sent" | "blocked" | "failed" = "sent";
    let detail = "Campaign message passed compliance validation and is ready to send.";

    if (hasBlockedRule) {
      finalStatus = "blocked";
      detail = events.find((event) => event.result === "blocked")?.detail ??
        "Campaign send was blocked by compliance validation.";
    } else if (!hasDestination) {
      finalStatus = "failed";
      detail =
        params.campaign.channel === "email"
          ? "Debtor does not have an email destination on file."
          : "Debtor does not have an SMS destination on file.";
    }

    return {
      account,
      finalStatus,
      detail,
      events,
    };
  });

  return { evaluations, activeRules };
}
