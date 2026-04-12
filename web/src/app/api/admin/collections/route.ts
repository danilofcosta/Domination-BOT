import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const topWaifus = await prisma.waifuCollection.groupBy({
      by: ["characterId"],
      _sum: { count: true },
      _count: { userId: true },
      orderBy: { _sum: { count: "desc" } },
      take: 20,
    });

    const waifuIds = topWaifus.map(w => w.characterId);
    const waifuChars = await prisma.characterWaifu.findMany({
      where: { id: { in: waifuIds } },
      select: { id: true, name: true, origem: true, media: true },
    });

    const topWaifuResults = topWaifus.map(w => {
      const char = waifuChars.find(c => c.id === w.characterId);
      return {
        characterId: w.characterId,
        characterName: char?.name || "Unknown",
        characterOrigem: char?.origem || "Unknown",
        characterMedia: char?.media || null,
        totalCount: w._sum.count || 0,
        uniqueOwners: w._count.userId,
      };
    });

    const topHusbandos = await prisma.husbandoCollection.groupBy({
      by: ["characterId"],
      _sum: { count: true },
      _count: { userId: true },
      orderBy: { _sum: { count: "desc" } },
      take: 20,
    });

    const husbandoIds = topHusbandos.map(h => h.characterId);
    const husbandoChars = await prisma.characterHusbando.findMany({
      where: { id: { in: husbandoIds } },
      select: { id: true, name: true, origem: true, media: true },
    });

    const topHusbandoResults = topHusbandos.map(h => {
      const char = husbandoChars.find(c => c.id === h.characterId);
      return {
        characterId: h.characterId,
        characterName: char?.name || "Unknown",
        characterOrigem: char?.origem || "Unknown",
        characterMedia: char?.media || null,
        totalCount: h._sum.count || 0,
        uniqueOwners: h._count.userId,
      };
    });

    const userWaifuCounts = await prisma.waifuCollection.groupBy({
      by: ["userId"],
      _count: true,
    });

    const userHusbandoCounts = await prisma.husbandoCollection.groupBy({
      by: ["userId"],
      _count: true,
    });

    const userIds = [...new Set([
      ...userWaifuCounts.map(w => w.userId),
      ...userHusbandoCounts.map(h => h.userId),
    ])];

    const users = await prisma.user.findMany({
      where: { telegramId: { in: userIds } },
      select: {
        id: true,
        telegramId: true,
        telegramData: true,
      },
    });

    const topOwners = userIds.map(tgId => {
      const waifuCount = userWaifuCounts.find(w => w.userId === tgId)?._count || 0;
      const husbandoCount = userHusbandoCounts.find(h => h.userId === tgId)?._count || 0;
      const user = users.find(u => u.telegramId === tgId);
      
      return {
        userId: user?.id || 0,
        telegramId: tgId.toString(),
        telegramData: user?.telegramData as any,
        totalCharacters: waifuCount + husbandoCount,
        waifuCount,
        husbandoCount,
      };
    }).sort((a, b) => b.totalCharacters - a.totalCharacters).slice(0, 20);

    const waifuTotal = await prisma.waifuCollection.aggregate({
      _sum: { count: true },
    });
    const husbandoTotal = await prisma.husbandoCollection.aggregate({
      _sum: { count: true },
    });

    const totalCollections = (waifuTotal._sum?.count || 0) + (husbandoTotal._sum?.count || 0);

    const totalUsers = userIds.length;

    return NextResponse.json({
      topWaifus: topWaifuResults,
      topHusbandos: topHusbandoResults,
      topOwners,
      totalCollections,
      totalUsers,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 });
  }
}
