import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telegramId, action, characterId, characterType } = body;

    if (!telegramId || !action || !characterId || !characterType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (action === "favorite") {
      if (characterType === "waifu") {
        const updated = await prisma.user.update({
          where: { id: user.id },
          data: {
            favoriteWaifuId: user.favoriteWaifuId === characterId ? null : characterId,
          },
        });
        return NextResponse.json({
          success: true,
          favoriteWaifuId: updated.favoriteWaifuId,
          isFavorite: updated.favoriteWaifuId === characterId,
        });
      } else {
        const updated = await prisma.user.update({
          where: { id: user.id },
          data: {
            favoriteHusbandoId: user.favoriteHusbandoId === characterId ? null : characterId,
          },
        });
        return NextResponse.json({
          success: true,
          favoriteHusbandoId: updated.favoriteHusbandoId,
          isFavorite: updated.favoriteHusbandoId === characterId,
        });
      }
    }

    if (action === "like") {
      const isWaifu = characterType === "waifu";
      
      let character: any;
      if (isWaifu) {
        character = await prisma.characterWaifu.findUnique({
          where: { id: characterId },
        });
        if (character) {
          const updated = await prisma.characterWaifu.update({
            where: { id: characterId },
            data: { likes: character.likes + 1 },
          });
          return NextResponse.json({ success: true, likes: updated.likes });
        }
      } else {
        character = await prisma.characterHusbando.findUnique({
          where: { id: characterId },
        });
        if (character) {
          const updated = await prisma.characterHusbando.update({
            where: { id: characterId },
            data: { likes: character.likes + 1 },
          });
          return NextResponse.json({ success: true, likes: updated.likes });
        }
      }

      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    if (action === "dislike") {
      const isWaifu = characterType === "waifu";
      
      let character: any;
      if (isWaifu) {
        character = await prisma.characterWaifu.findUnique({
          where: { id: characterId },
        });
        if (character) {
          const updated = await prisma.characterWaifu.update({
            where: { id: characterId },
            data: { dislikes: character.dislikes + 1 },
          });
          return NextResponse.json({ success: true, dislikes: updated.dislikes });
        }
      } else {
        character = await prisma.characterHusbando.findUnique({
          where: { id: characterId },
        });
        if (character) {
          const updated = await prisma.characterHusbando.update({
            where: { id: characterId },
            data: { dislikes: character.dislikes + 1 },
          });
          return NextResponse.json({ success: true, dislikes: updated.dislikes });
        }
      }

      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error processing action" },
      { status: 500 }
    );
  }
}
