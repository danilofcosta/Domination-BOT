import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { resolveCharacterMedia } from "@/lib/uteis/resolveMediaClient";

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
            Character: {
              select: {
                id: true,
                name: true,
                slug: true,
                origem: true,
                media: true,
                mediaType: true,
                linkweb: true,
                linkwebExpiresAt: true,
              },
            },
          },
        },
        HusbandoCollection: {
          include: {
            Character: {
              select: {
                id: true,
                name: true,
                slug: true,
                origem: true,
                media: true,
                mediaType: true,
                linkweb: true,
                linkwebExpiresAt: true,
              },
            },
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
            linkweb: true,
            linkwebExpiresAt: true,
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
            linkweb: true,
            linkwebExpiresAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const waifuCount = user.WaifuCollection.reduce((acc, w) => acc + w.count, 0);
    const husbandoCount = user.HusbandoCollection.reduce((acc, h) => acc + h.count, 0);

    const resolveFavoriteMedia = (char: any) => {
      if (!char) return null;
      const { displayUrl } = resolveCharacterMedia(
        char.media,
        char.mediaType,
        char.linkweb,
        char.linkwebExpiresAt
      );
      return {
        ...char,
        media: displayUrl,
      };
    };

    return NextResponse.json({
      id: user.id.toString(),
      telegramId: user.telegramId.toString(),
      coins: user.coins,
      profileType: user.profileType,
      language: user.language,
      waifuCount,
      husbandoCount,
      telegramData: user.telegramData,
      favoriteWaifu: resolveFavoriteMedia(user.CharacterWaifu),
      favoriteHusbando: resolveFavoriteMedia(user.CharacterHusbando),
      waifus: user.WaifuCollection.map((w) => {
        const { displayUrl, isVideo } = resolveCharacterMedia(
          w.Character.media,
          w.Character.mediaType,
          w.Character.linkweb,
          w.Character.linkwebExpiresAt
        );
        return {
          id: w.characterId,
          name: w.Character.name,
          slug: w.Character.slug,
          origem: w.Character.origem,
          media: displayUrl,
          mediaType: w.Character.mediaType,
          isVideo,
          count: w.count,
        };
      }),
      husbandos: user.HusbandoCollection.map((h) => {
        const { displayUrl, isVideo } = resolveCharacterMedia(
          h.Character.media,
          h.Character.mediaType,
          h.Character.linkweb,
          h.Character.linkwebExpiresAt
        );
        return {
          id: h.characterId,
          name: h.Character.name,
          slug: h.Character.slug,
          origem: h.Character.origem,
          media: displayUrl,
          mediaType: h.Character.mediaType,
          isVideo,
          count: h.count,
        };
      }),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
  }
}
