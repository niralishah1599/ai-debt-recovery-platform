const staffDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const staffDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function formatDateLabel(value: string): string {
  return staffDateFormatter.format(new Date(value));
}

export function formatDateTimeLabel(value: string): string {
  return staffDateTimeFormatter.format(new Date(value));
}
