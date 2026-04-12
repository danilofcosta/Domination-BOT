import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const telegramIdStr = url.searchParams.get("id");
  
  if (!telegramIdStr) {
    return NextResponse.json({ error: "Missing Telegram ID" }, { status: 400 });
  }

  const telegramId = BigInt(telegramIdStr);

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: {
        WaifuCollection: {
          include: {
            Character: true,
          },
        },
        HusbandoCollection: {
          include: {
            Character: true,
          },
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
      id: user.id.toString(),
      telegramId: user.telegramId.toString(),
      coins: user.coins,
      profileType: user.profileType,
      language: user.language,
      waifuCount,
      husbandoCount,
      telegramData: user.telegramData,
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
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
  }
}
