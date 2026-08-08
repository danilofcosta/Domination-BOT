export type TelegramInfo = {
  firstName: string;
  lastName: string;
  username: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

export function getTelegramInfo(data: unknown): TelegramInfo {
  let info = asRecord(data);
  const nested = info?.fromuser;
  if (nested && typeof nested === "object") {
    info = asRecord(nested);
  }

  const firstName = (info?.first_name as string) ?? "";
  const lastName = (info?.last_name as string) ?? "";
  const username = (info?.username as string) ?? "";

  return { firstName, lastName, username };
}

export function getTelegramName(data: unknown): string {
  const { firstName, lastName } = getTelegramInfo(data);
  return [firstName, lastName].filter(Boolean).join(" ") || "—";
}
