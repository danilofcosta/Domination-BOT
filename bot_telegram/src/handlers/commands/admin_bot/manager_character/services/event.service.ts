import { prisma } from "../../../../../lib/prisma.js";
import { eventCache, getOrSet } from "../../../../../cache/cache.js";

export type CachedEvent = { id: number; name: string; emoji: string };

export async function getEventsAll(): Promise<CachedEvent[]> {
  return getOrSet(
    eventCache,
    "events:all",
    () => prisma.event.findMany({
      select: { id: true, name: true, emoji: true },
      orderBy: { id: "asc" },
    }),
  );
}
