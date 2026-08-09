import { LRUCache } from "lru-cache";
import { prisma } from "../lib/prisma.js";

export type GroupConfig = {
  dropsEnabled?: boolean;
  dropMsg?: number;
};

const groupConfigCache = new LRUCache<string, GroupConfig>({
  max: 2000,
  ttl: 1000 * 60 * 5,
});

function cacheKey(chatId: number, botType: string): string {
  return `${botType}:${chatId}`;
}

function normalizeConfig(config: unknown): GroupConfig {
  if (!config || typeof config !== "object") return {};
  const c = config as Record<string, unknown>;
  const out: GroupConfig = {};
  if (typeof c.dropsEnabled === "boolean") out.dropsEnabled = c.dropsEnabled;
  if (typeof c.dropMsg === "number") out.dropMsg = c.dropMsg;
  return out;
}

export async function getGroupConfig(
  chatId: number,
  botType: string = String(process.env.TYPE_BOT ?? "")
    .toLowerCase(),
): Promise<GroupConfig> {
  const key = cacheKey(chatId, botType);
  const cached = groupConfigCache.get(key);
  if (cached) return cached;

  try {
    const group = await prisma.telegramGroup.findUnique({
      where: { groupId: BigInt(chatId) },
      select: { configuration: true },
    });
    const configuration =
      group?.configuration && typeof group.configuration === "object"
        ? (group.configuration as Record<string, any>)
        : undefined;
    const config = normalizeConfig(configuration?.[botType]);
    groupConfigCache.set(key, config);
    return config;
  } catch {
    return {};
  }
}

export async function setGroupConfig(
  chatId: number,
  botType: string,
  patch: GroupConfig,
  groupName?: string,
): Promise<GroupConfig> {
  const current = await getGroupConfig(chatId, botType);
  const merged: GroupConfig = { ...current, ...patch };

  const existing = await prisma.telegramGroup.findUnique({
    where: { groupId: BigInt(chatId) },
    select: { configuration: true },
  });

  let configuration: Record<string, any> = {};
  if (existing?.configuration && typeof existing.configuration === "object") {
    configuration = existing.configuration as Record<string, any>;
  }

  const botConfig: Record<string, any> =
    configuration[botType] && typeof configuration[botType] === "object"
      ? configuration[botType]
      : {};

  if (patch.dropsEnabled !== undefined)
    botConfig.dropsEnabled = patch.dropsEnabled;
  if (patch.dropMsg !== undefined) botConfig.dropMsg = patch.dropMsg;

  configuration[botType] = botConfig;

  await prisma.telegramGroup.upsert({
    where: { groupId: BigInt(chatId) },
    update: { configuration },
    create: {
      groupId: BigInt(chatId),
      groupName: groupName ?? "",
      configuration,
    },
  });

  groupConfigCache.set(cacheKey(chatId, botType), merged);
  return merged;
}

export function clearGroupConfigCache(): void {
  groupConfigCache.clear();
}
