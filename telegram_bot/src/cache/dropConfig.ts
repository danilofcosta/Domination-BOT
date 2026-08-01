import { prisma } from "../lib/prisma.js";
import { DAILY_LIMIT, DROP, UNDROP } from "../bot/middleware/constants.js";

let cachedConfig: { dropMsg: number; undropMsg: number; dailyLimit: number } | null = null;

async function loadConfig(): Promise<{ dropMsg: number; undropMsg: number; dailyLimit: number }> {
  const rows = await prisma.botConfig.findMany({
    where: { key: { in: ["DROP_MSG", "UNDROP_MSG", "DAILY_LIMIT"] } },
  });

  const get = (key: string, fallback: number): number => {
    const row = rows.find((r) => r.key === key);
    return row ? Number(row.value) : fallback;
  };

  return {
    dropMsg: get("DROP_MSG", DROP),
    undropMsg: get("UNDROP_MSG", UNDROP),
    dailyLimit: get("DAILY_LIMIT", DAILY_LIMIT),
  };
}

export async function getDropConfig(): Promise<{ dropMsg: number; undropMsg: number; dailyLimit: number }> {
  if (!cachedConfig) {
    cachedConfig = await loadConfig();
  }
  return cachedConfig;
}

export function invalidateDropConfig() {
  cachedConfig = null;
}
