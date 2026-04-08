import { prisma } from "@/lib/prisma";

export async function GET() {
  const [rarities, events] = await Promise.all([
    prisma.rarity.findMany({
      select: { id: true, name: true, emoji: true },
      orderBy: { name: "asc" },
    }),
    prisma.event.findMany({
      select: { id: true, name: true, emoji: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return Response.json({ rarities, events });
}
