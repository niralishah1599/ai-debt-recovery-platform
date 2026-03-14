export type ClientInput = {
  name: string;
};

export type DebtorInput = {
  name: string;
  email: string;
  phone: string;
  clientId: string;
  emailConsent: boolean;
  smsConsent: boolean;
  timezone: string;
  contactWindowStart: number;
  contactWindowEnd: number;
};

export type AccountStatus = "active" | "paid" | "suppressed" | "closed";

export type AccountInput = {
  debtorId: string;
  clientId: string;
  balance: number;
  status: AccountStatus;
};

type StringRecord = Record<string, unknown>;

function readString(source: FormData | StringRecord, key: string): string {
  const value =
    source instanceof FormData ? source.get(key) : source[key];

  if (typeof value !== "string") {
    throw new Error(`Missing field: ${key}`);
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new Error(`Field cannot be empty: ${key}`);
  }

  return trimmedValue;
}

function parseEmail(value: string): string {
  const normalized = value.toLowerCase();

  if (!normalized.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  return normalized;
}

function parseUuid(value: string, field: string): string {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(value)) {
    throw new Error(`Invalid identifier for ${field}.`);
  }

  return value;
}

function parseBalance(value: string): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throw new Error("Balance must be a non-negative number.");
  }

  return Math.round(parsedValue * 100) / 100;
}

function parseStatus(value: string): AccountStatus {
  if (
    value !== "active" &&
    value !== "paid" &&
    value !== "suppressed" &&
    value !== "closed"
  ) {
    throw new Error("Select a valid account status.");
  }

  return value;
}

function parseBoolean(value: string, field: string): boolean {
  if (value === "true" || value === "on") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(`Select a valid option for ${field}.`);
}

function parseHour(value: string, field: string): number {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue)) {
    throw new Error(`Enter a whole hour value for ${field}.`);
  }

  return parsedValue;
}

function parseTimezone(value: string): string {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
  } catch {
    throw new Error("Enter a valid IANA timezone, for example UTC or America/New_York.");
  }

  return value;
}

export function parseClientInput(source: FormData | StringRecord): ClientInput {
  return {
    name: readString(source, "name"),
  };
}

export function parseDebtorInput(source: FormData | StringRecord): DebtorInput {
  const contactWindowStart = parseHour(readString(source, "contactWindowStart"), "contactWindowStart");
  const contactWindowEnd = parseHour(readString(source, "contactWindowEnd"), "contactWindowEnd");

  if (contactWindowStart < 0 || contactWindowStart > 23) {
    throw new Error("Contact window start must be between 0 and 23.");
  }

  if (contactWindowEnd < 1 || contactWindowEnd > 24) {
    throw new Error("Contact window end must be between 1 and 24.");
  }

  if (contactWindowEnd <= contactWindowStart) {
    throw new Error("Contact window end must be later than the start hour.");
  }

  return {
    name: readString(source, "name"),
    email: parseEmail(readString(source, "email")),
    phone: readString(source, "phone"),
    clientId: parseUuid(readString(source, "clientId"), "clientId"),
    emailConsent: parseBoolean(readString(source, "emailConsent"), "emailConsent"),
    smsConsent: parseBoolean(readString(source, "smsConsent"), "smsConsent"),
    timezone: parseTimezone(readString(source, "timezone")),
    contactWindowStart,
    contactWindowEnd,
  };
}

export function parseAccountInput(source: FormData | StringRecord): AccountInput {
  return {
    debtorId: parseUuid(readString(source, "debtorId"), "debtorId"),
    clientId: parseUuid(readString(source, "clientId"), "clientId"),
    balance: parseBalance(readString(source, "balance")),
    status: parseStatus(readString(source, "status")),
  };
}
