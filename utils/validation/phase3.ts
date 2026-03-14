export type CampaignChannel = "email" | "sms";

export type CampaignInput = {
  name: string;
  channel: CampaignChannel;
  messageTemplate: string;
};

export type CampaignExecutionInput = {
  campaignId: string;
  accountIds: string[];
};

type StringRecord = Record<string, unknown>;

function readString(source: FormData | StringRecord, key: string): string {
  const value = source instanceof FormData ? source.get(key) : source[key];

  if (typeof value !== "string") {
    throw new Error(`Missing field: ${key}`);
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new Error(`Field cannot be empty: ${key}`);
  }

  return trimmedValue;
}

function parseUuid(value: string, field: string): string {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(value)) {
    throw new Error(`Invalid identifier for ${field}.`);
  }

  return value;
}

function parseChannel(value: string): CampaignChannel {
  if (value !== "email" && value !== "sms") {
    throw new Error("Select a valid campaign channel.");
  }

  return value;
}

function parseAccountIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new Error("Select at least one account.");
  }

  const uniqueAccountIds = Array.from(
    new Set(
      value.map((item) => {
        if (typeof item !== "string") {
          throw new Error("Invalid account identifier.");
        }

        return parseUuid(item, "accountId");
      }),
    ),
  );

  if (uniqueAccountIds.length === 0) {
    throw new Error("Select at least one account.");
  }

  return uniqueAccountIds;
}

export function parseCampaignInput(source: FormData | StringRecord): CampaignInput {
  return {
    name: readString(source, "name"),
    channel: parseChannel(readString(source, "channel")),
    messageTemplate: readString(source, "messageTemplate"),
  };
}

export function parseCampaignExecutionInput(
  source: FormData | StringRecord,
): CampaignExecutionInput {
  if (source instanceof FormData) {
    return {
      campaignId: parseUuid(readString(source, "campaignId"), "campaignId"),
      accountIds: parseAccountIds(source.getAll("accountIds")),
    };
  }

  return {
    campaignId: parseUuid(readString(source, "campaignId"), "campaignId"),
    accountIds: parseAccountIds(source.accountIds),
  };
}
