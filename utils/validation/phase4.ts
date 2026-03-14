export type ComplianceRuleType = "account_status" | "contact_window" | "consent";

export type ComplianceRuleInput = {
  ruleName: string;
  ruleType: ComplianceRuleType;
  isActive: boolean;
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

function parseBoolean(value: string): boolean {
  if (value === "true" || value === "on") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error("Select a valid active state.");
}

function parseRuleType(value: string): ComplianceRuleType {
  if (value === "account_status" || value === "contact_window" || value === "consent") {
    return value;
  }

  throw new Error("Select a valid compliance rule type.");
}

export function parseComplianceRuleInput(
  source: FormData | StringRecord,
): ComplianceRuleInput {
  return {
    ruleName: readString(source, "ruleName"),
    ruleType: parseRuleType(readString(source, "ruleType")),
    isActive: parseBoolean(readString(source, "isActive")),
  };
}
