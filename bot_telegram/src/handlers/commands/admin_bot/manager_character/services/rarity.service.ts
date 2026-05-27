import { prisma } from "../../../../../lib/prisma.js";
import { rarityCache, getOrSet } from "../../../../../cache/cache.js";

export type CachedRarity = { id: number; name: string; emoji: string };

export async function getRaritiesAll(): Promise<CachedRarity[]> {
  return getOrSet(
    rarityCache,
    "rarities:all",
    () => prisma.rarity.findMany({
      select: { id: true, name: true, emoji: true },
      orderBy: { id: "asc" },
    }),
  );
}
