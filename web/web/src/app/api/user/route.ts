import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { resolveMediaUrl } from "@/lib/uteis/resolveMediaUrl";

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

    const waifuCount = user.WaifuCollection.reduce(
      (acc, w) => acc + w.count,
      0,
    );
    const husbandoCount = user.HusbandoCollection.reduce(
      (acc, h) => acc + h.count,
      0,
    );

    const resolveFavoriteMedia = async (
      char: any,
      type: "waifu" | "husbando",
    ) => {
      if (!char) return null;
      const { displayUrl, isVideo } = await resolveMediaUrl(char, type);
      return {
        ...char,
        media: displayUrl,
        isVideo,
      };
    };

    const [favoriteWaifu, favoriteHusbando, waifus, husbandos] =
      await Promise.all([
        resolveFavoriteMedia(user.CharacterWaifu, "waifu"),
        resolveFavoriteMedia(user.CharacterHusbando, "husbando"),
        Promise.all(
          user.WaifuCollection.map(async (w) => {
            const { displayUrl, isVideo } = await resolveMediaUrl(
              w.Character as any,
              "waifu",
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
        ),
        Promise.all(
          user.HusbandoCollection.map(async (h) => {
            const { displayUrl, isVideo } = await resolveMediaUrl(
              h.Character as any,
              "husbando",
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
        ),
      ]);

    return NextResponse.json({
      id: user.id.toString(),
      telegramId: user.telegramId.toString(),
      coins: user.coins,
      profileType: user.profileType,
      language: user.language,
      waifuCount,
      husbandoCount,
      telegramData: user.telegramData,
      favoriteWaifu,
      favoriteHusbando,
      waifus,
      husbandos,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
  }
}
