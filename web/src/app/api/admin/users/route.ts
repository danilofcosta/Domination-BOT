import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userIdStr = url.searchParams.get("id");

  try {
    if (userIdStr) {
      const userId = parseInt(userIdStr);
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          WaifuCollection: {
            include: { Character: true },
            orderBy: { count: "desc" },
          },
          HusbandoCollection: {
            include: { Character: true },
            orderBy: { count: "desc" },
          },
          CharacterWaifu: {
            select: {
              id: true,
              name: true,
              slug: true,
              origem: true,
              media: true,
              mediaType: true,
            },
          },
          CharacterHusbando: {
            select: {
              id: true,
              name: true,
              slug: true,
              origem: true,
              media: true,
              mediaType: true,
            },
          },
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const waifuCount = user.WaifuCollection.reduce((acc, w) => acc + w.count, 0);
      const husbandoCount = user.HusbandoCollection.reduce((acc, h) => acc + h.count, 0);

      return NextResponse.json({
        id: user.id,
        telegramId: user.telegramId.toString(),
        profileType: user.profileType,
        language: user.language,
        coins: user.coins,
        telegramData: user.telegramData,
        waifuCount,
        husbandoCount,
        favoriteWaifu: user.CharacterWaifu,
        favoriteHusbando: user.CharacterHusbando,
        waifus: user.WaifuCollection.map((w) => ({
          id: w.characterId,
          name: w.Character.name,
          slug: w.Character.slug,
          origem: w.Character.origem,
          media: w.Character.media,
          mediaType: w.Character.mediaType,
          count: w.count,
        })),
        husbandos: user.HusbandoCollection.map((h) => ({
          id: h.characterId,
          name: h.Character.name,
          slug: h.Character.slug,
          origem: h.Character.origem,
          media: h.Character.media,
          mediaType: h.Character.mediaType,
          count: h.count,
        })),
      });
    }

    const users = await prisma.user.findMany({
      orderBy: { id: "desc" },
      include: {
        _count: {
          select: {
            WaifuCollection: true,
            HusbandoCollection: true,
          }
        },
        CharacterWaifu: {
          include: {
            WaifuEvent: { include: { Event: true } },
            WaifuRarity: { include: { Rarity: true } },
          },
        },
        CharacterHusbando: {
          include: {
            HusbandoEvent: { include: { Event: true } },
            HusbandoRarity: { include: { Rarity: true } },
          },
        },
      },
    });
    
    return NextResponse.json(users.map(u => ({
      ...u,
      telegramId: u.telegramId.toString(),
    })));
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
