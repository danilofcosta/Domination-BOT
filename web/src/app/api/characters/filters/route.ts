import { prisma } from "@/lib/prisma";

export async function GET() {
  const [rarities, events, waifuAnimes, husbandoAnimes] = await Promise.all([
    prisma.rarity.findMany({
      select: { id: true, name: true, emoji: true },
      orderBy: { name: "asc" },
    }),
    prisma.event.findMany({
      select: { id: true, name: true, emoji: true },
      orderBy: { name: "asc" },
    }),
    prisma.characterWaifu.findMany({
      where: { sourceType: "ANIME", origem: { not: "" } },
      select: { origem: true },
      distinct: ["origem"],
      orderBy: { origem: "asc" },
    }),
    prisma.characterHusbando.findMany({
      where: { sourceType: "ANIME", origem: { not: "" } },
      select: { origem: true },
      distinct: ["origem"],
      orderBy: { origem: "asc" },
    }),
  ]);

  const allAnimes = [...waifuAnimes, ...husbandoAnimes]
    .map(r => r.origem)
    .filter(Boolean) as string[];

  const uniqueAnimes = [...new Set(allAnimes)].sort((a, b) => a.localeCompare(b));

  return Response.json({ rarities, events, animeNames: uniqueAnimes });
}
