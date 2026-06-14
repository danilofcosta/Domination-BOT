import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { resolveCharacterMedia } from "@/lib/uteis/resolveMediaClient";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  const { characterId } = await params;
  const url = new URL(req.url);
  const type = url.searchParams.get("type") as "waifu" | "husbando";
  const telegramIdStr = url.searchParams.get("telegramId");

  if (!characterId || !type) {
    return NextResponse.json(
      { error: "Missing characterId or type" },
      { status: 400 }
    );
  }

  const charId = parseInt(characterId);
  const telegramId = telegramIdStr ? BigInt(telegramIdStr) : null;

  try {
    const isWaifu = type === "waifu";

    let character: any;
    let userCount: number;

    if (isWaifu) {
      character = await prisma.characterWaifu.findUnique({
        where: { id: charId },
        include: {
          WaifuCollection: {
            include: {
              User: {
                select: {
                  id: true,
                  telegramData: true,
                },
              },
            },
            orderBy: { count: "desc" },
          },
          WaifuRarity: {
            include: {
              Rarity: true,
            },
          },
          WaifuEvent: {
            include: {
              Event: true,
            },
          },
        },
      });
      userCount = await prisma.waifuCollection.count({
        where: { characterId: charId },
      });

      let userHasCount = 0;
      if (telegramId) {
        const userCollection = await prisma.waifuCollection.findFirst({
          where: { characterId: charId, userId: telegramId },
        });
        userHasCount = userCollection?.count || 0;
      }

      if (!character) {
        return NextResponse.json(
          { error: "Character not found" },
          { status: 404 }
        );
      }

      const { displayUrl: resolvedMedia, isVideo } = resolveCharacterMedia(
        character.media,
        character.mediaType,
        character.linkweb,
        character.linkwebExpiresAt
      );

      return NextResponse.json({
        id: character.id,
        name: character.name,
        slug: character.slug,
        origem: character.origem,
        media: resolvedMedia,
        mediaType: character.mediaType,
        isVideo,
        sourceType: character.sourceType,
        popularity: character.popularity,
        likes: character.likes,
        dislikes: character.dislikes,
        type,
        userCount,
        userHasCount,
        userHasCharacter: userHasCount > 0,
        userHasLiked: telegramId && isWaifu 
          ? (await prisma.user.findUnique({ where: { telegramId }, select: { waifuLikes: true } }))?.waifuLikes?.includes(charId) || false
          : telegramId && !isWaifu 
            ? (await prisma.user.findUnique({ where: { telegramId }, select: { husbandoLikes: true } }))?.husbandoLikes?.includes(charId) || false
            : false,
        topOwners: character.WaifuCollection.slice(0, 10).map((c: any) => ({
          userId: c.User.id,
          telegramId: c.User?.telegramId?.toString() || "",
          count: c.count,
          telegramData: c.User?.telegramData || null,
        })),
        rarities: character.WaifuRarity?.map((r: any) => r.Rarity) || [],
        events: character.WaifuEvent?.map((e: any) => e.Event) || [],
      });
    } else {
      character = await prisma.characterHusbando.findUnique({
        where: { id: charId },
        include: {
          HusbandoCollection: {
            include: {
              User: {
                select: {
                  id: true,
                  telegramData: true,
                },
              },
            },
            orderBy: { count: "desc" },
          },
          HusbandoRarity: {
            include: {
              Rarity: true,
            },
          },
          HusbandoEvent: {
            include: {
              Event: true,
            },
          },
        },
      });
      userCount = await prisma.husbandoCollection.count({
        where: { characterId: charId },
      });

      let userHasCount = 0;
      if (telegramId) {
        const userCollection = await prisma.husbandoCollection.findFirst({
          where: { characterId: charId, userId: telegramId },
        });
        userHasCount = userCollection?.count || 0;
      }

      if (!character) {
        return NextResponse.json(
          { error: "Character not found" },
          { status: 404 }
        );
      }

      const { displayUrl: resolvedMedia, isVideo } = resolveCharacterMedia(
        character.media,
        character.mediaType,
        character.linkweb,
        character.linkwebExpiresAt
      );

      return NextResponse.json({
        id: character.id,
        name: character.name,
        slug: character.slug,
        origem: character.origem,
        media: resolvedMedia,
        mediaType: character.mediaType,
        isVideo,
        sourceType: character.sourceType,
        popularity: character.popularity,
        likes: character.likes,
        dislikes: character.dislikes,
        type,
        userCount,
        userHasCount,
        userHasCharacter: userHasCount > 0,
        userHasLiked: telegramId && !isWaifu 
          ? (await prisma.user.findUnique({ where: { telegramId }, select: { husbandoLikes: true } }))?.husbandoLikes?.includes(charId) || false
          : false,
        topOwners: character.HusbandoCollection.slice(0, 10).map((c: any) => ({
          userId: c.User.id,
          telegramId: c.User?.telegramId?.toString() || "",
          count: c.count,
          telegramData: c.User?.telegramData || null,
        })),
        rarities: character.HusbandoRarity?.map((r: any) => r.Rarity) || [],
        events: character.HusbandoEvent?.map((e: any) => e.Event) || [],
      });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching collection" },
      { status: 500 }
    );
  }
}
