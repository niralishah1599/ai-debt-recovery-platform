import { createClient } from "@/lib/supabase/server";
import { requirePortalRole } from "@/services/auth-service";

type MetricSeriesPoint = {
  label: string;
  value: number;
};

type CampaignPerformanceRecord = {
  campaignId: string;
  campaignName: string;
  totalMessages: number;
  deliveredMessages: number;
  blockedMessages: number;
};

export type AnalyticsDashboardData = {
  summary: {
    outstandingBalance: number;
    collectedAmount: number;
    collectionRate: number;
    activeAccounts: number;
    paidAccounts: number;
    messagesSent: number;
    deliveredMessages: number;
    blockedMessages: number;
    deliveryRate: number;
    complianceAllowedCount: number;
    complianceBlockedCount: number;
    averageDaysToFirstPayment: number | null;
  };
  activity: {
    payments: MetricSeriesPoint[];
    messages: MetricSeriesPoint[];
    blocks: MetricSeriesPoint[];
  };
  campaignPerformance: CampaignPerformanceRecord[];
};

type AccountAnalyticsRow = {
  id: string;
  balance: string;
  status: "active" | "paid" | "suppressed" | "closed";
};

type PaymentAnalyticsRow = {
  id: string;
  account_id: string;
  amount: string;
  payment_status: "pending" | "succeeded" | "failed" | "canceled";
  created_at: string;
};

type MessageAnalyticsRow = {
  id: string;
  account_id: string;
  campaign_id: string;
  status: "queued" | "sent" | "delivered" | "failed" | "blocked";
  sent_at: string | null;
  campaigns:
    | {
        id: string;
        name: string;
      }
    | Array<{
        id: string;
        name: string;
      }>
    | null;
};

type ComplianceEventAnalyticsRow = {
  id: string;
  account_id: string;
  result: "allowed" | "blocked" | "flagged";
  created_at: string;
};

function normalizeSingleRelation<T>(relation: T | T[] | undefined): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function getUtcDateLabel(value: string): string {
  return value.slice(0, 10);
}

function buildLastSevenDaysSeries(
  rows: Array<{ value: number; date: string }>,
): MetricSeriesPoint[] {
  const today = new Date();
  const dayLabels = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    day.setUTCDate(day.getUTCDate() - (6 - index));
    return day.toISOString().slice(0, 10);
  });

  return dayLabels.map((label) => ({
    label: label.slice(5),
    value: rows
      .filter((row) => row.date === label)
      .reduce((total, row) => total + row.value, 0),
  }));
}

function calculateAverageDaysToFirstPayment(
  messages: MessageAnalyticsRow[],
  payments: PaymentAnalyticsRow[],
): number | null {
  const firstMessageByAccount = new Map<string, Date>();

  for (const message of messages) {
    if (!message.sent_at) {
      continue;
    }

    const sentAt = new Date(message.sent_at);
    const existing = firstMessageByAccount.get(message.account_id);

    if (!existing || sentAt < existing) {
      firstMessageByAccount.set(message.account_id, sentAt);
    }
  }

  const firstPaymentByAccount = new Map<string, Date>();

  for (const payment of payments) {
    if (payment.payment_status !== "succeeded") {
      continue;
    }

    const createdAt = new Date(payment.created_at);
    const existing = firstPaymentByAccount.get(payment.account_id);

    if (!existing || createdAt < existing) {
      firstPaymentByAccount.set(payment.account_id, createdAt);
    }
  }

  const dayDiffs: number[] = [];

  for (const [accountId, firstMessage] of firstMessageByAccount.entries()) {
    const firstPayment = firstPaymentByAccount.get(accountId);

    if (!firstPayment || firstPayment < firstMessage) {
      continue;
    }

    const diffMs = firstPayment.getTime() - firstMessage.getTime();
    dayDiffs.push(diffMs / (1000 * 60 * 60 * 24));
  }

  if (dayDiffs.length === 0) {
    return null;
  }

  return dayDiffs.reduce((total, value) => total + value, 0) / dayDiffs.length;
}

export async function getAnalyticsDashboardData(): Promise<AnalyticsDashboardData> {
  await requirePortalRole("staff");

  const supabase = await createClient();

  const [accountsResult, paymentsResult, messagesResult, complianceEventsResult] =
    await Promise.all([
      supabase.from("accounts").select("id, balance, status"),
      supabase
        .from("payments")
        .select("id, account_id, amount, payment_status, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("messages")
        .select("id, account_id, campaign_id, status, sent_at, campaigns(id, name)")
        .order("sent_at", { ascending: false }),
      supabase
        .from("compliance_events")
        .select("id, account_id, result, created_at")
        .order("created_at", { ascending: false }),
    ]);

  const errors = [
    accountsResult.error,
    paymentsResult.error,
    messagesResult.error,
    complianceEventsResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(`Unable to load analytics dashboard: ${errors[0]?.message}`);
  }

  const accounts = (accountsResult.data ?? []) as AccountAnalyticsRow[];
  const payments = (paymentsResult.data ?? []) as PaymentAnalyticsRow[];
  const messages = (messagesResult.data ?? []) as MessageAnalyticsRow[];
  const complianceEvents = (complianceEventsResult.data ?? []) as ComplianceEventAnalyticsRow[];

  const outstandingBalance = accounts.reduce(
    (total, account) => total + Number(account.balance),
    0,
  );
  const collectedAmount = payments
    .filter((payment) => payment.payment_status === "succeeded")
    .reduce((total, payment) => total + Number(payment.amount), 0);
  const collectionRateDenominator = collectedAmount + outstandingBalance;
  const collectionRate =
    collectionRateDenominator > 0 ? collectedAmount / collectionRateDenominator : 0;

  const activeAccounts = accounts.filter((account) => account.status === "active").length;
  const paidAccounts = accounts.filter((account) => account.status === "paid").length;
  const messagesSent = messages.length;
  const deliveredMessages = messages.filter((message) => message.status === "delivered").length;
  const blockedMessages = messages.filter((message) => message.status === "blocked").length;
  const deliveryRateDenominator =
    deliveredMessages +
    messages.filter((message) => message.status === "sent").length +
    messages.filter((message) => message.status === "failed").length;
  const deliveryRate =
    deliveryRateDenominator > 0 ? deliveredMessages / deliveryRateDenominator : 0;

  const complianceAllowedCount = complianceEvents.filter(
    (event) => event.result === "allowed",
  ).length;
  const complianceBlockedCount = complianceEvents.filter(
    (event) => event.result === "blocked",
  ).length;

  const campaignPerformanceMap = new Map<string, CampaignPerformanceRecord>();

  for (const message of messages) {
    const campaign = normalizeSingleRelation(message.campaigns);

    if (!campaign) {
      continue;
    }

    const existing = campaignPerformanceMap.get(campaign.id) ?? {
      campaignId: campaign.id,
      campaignName: campaign.name,
      totalMessages: 0,
      deliveredMessages: 0,
      blockedMessages: 0,
    };

    existing.totalMessages += 1;

    if (message.status === "delivered") {
      existing.deliveredMessages += 1;
    }

    if (message.status === "blocked") {
      existing.blockedMessages += 1;
    }

    campaignPerformanceMap.set(campaign.id, existing);
  }

  return {
    summary: {
      outstandingBalance,
      collectedAmount,
      collectionRate,
      activeAccounts,
      paidAccounts,
      messagesSent,
      deliveredMessages,
      blockedMessages,
      deliveryRate,
      complianceAllowedCount,
      complianceBlockedCount,
      averageDaysToFirstPayment: calculateAverageDaysToFirstPayment(messages, payments),
    },
    activity: {
      payments: buildLastSevenDaysSeries(
        payments
          .filter((payment) => payment.payment_status === "succeeded")
          .map((payment) => ({
            date: getUtcDateLabel(payment.created_at),
            value: Number(payment.amount),
          })),
      ),
      messages: buildLastSevenDaysSeries(
        messages
          .filter((message) => message.sent_at)
          .map((message) => ({
            date: getUtcDateLabel(message.sent_at ?? new Date().toISOString()),
            value: 1,
          })),
      ),
      blocks: buildLastSevenDaysSeries(
        complianceEvents
          .filter((event) => event.result === "blocked")
          .map((event) => ({
            date: getUtcDateLabel(event.created_at),
            value: 1,
          })),
      ),
    },
    campaignPerformance: Array.from(campaignPerformanceMap.values())
      .sort((left, right) => right.totalMessages - left.totalMessages)
      .slice(0, 5),
  };
}
