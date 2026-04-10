import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../../utils/customTypes.js";
import { prisma } from "../../../../lib/prisma.js";

export async function StatRefresh(ctx: MyContext) {
  const startTime = Date.now();

  const dbPing = await prisma.$queryRaw<[{ now: Date }]>`
    SELECT NOW()
  `.then(() => Date.now() - startTime);

  const uptime = formatUptime(process.uptime());
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(":");
}
