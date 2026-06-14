"use server";

import { prisma } from "@/lib/prisma";
import { Bot } from "grammy";
import { revalidatePath } from "next/cache";

function getBot(type: "waifu" | "husbando") {
  const token = type === "waifu" ? process.env.BOT_TOKEN_WAIFU : process.env.BOT_TOKEN_HUSBANDO;
  if (!token) throw new Error(`Token ${type} não configurado`);
  return new Bot(token);
}

export async function updateRarityWeight(id: number, weight: number) {
  await prisma.rarity.update({ where: { id }, data: { weight } });
  revalidatePath("/setup/drop");
}

export async function getRarities() {
  const rarities = await prisma.rarity.findMany({
    where: {
      OR: [
        { WaifuRarity: { some: {} } },
        { HusbandoRarity: { some: {} } },
      ],
    },
    orderBy: { weight: "desc" },
  });

  const totalWeight = rarities.reduce((sum, r) => sum + r.weight, 0);

  return rarities.map((r) => ({
    ...r,
    chance: totalWeight > 0 ? ((r.weight / totalWeight) * 100).toFixed(1) : "0",
  }));
}

export async function getGroups() {
  return prisma.telegramGroup.findMany({
    select: { id: true, groupId: true, groupName: true },
    orderBy: { groupName: "asc" },
  });
}

export type CharOption = {
  id: number;
  name: string;
  mediaType: string;
  media: string;
  linkweb: string | null;
  linkwebExpiresAt: string | null;
  rarityName: string;
  rarityEmoji: string;
};

export async function getCharactersByRarity(rarityId: number): Promise<{
  waifus: CharOption[];
  husbandos: CharOption[];
}> {
  const [waifuRarities, husbandoRarities] = await Promise.all([
    prisma.waifuRarity.findMany({
      where: { rarityId },
      select: {
        characterId: true,
        CharacterWaifu: {
          select: {
            id: true,
            name: true,
            mediaType: true,
            media: true,
            linkweb: true,
            linkwebExpiresAt: true,
          },
        },
      },
    }),
    prisma.husbandoRarity.findMany({
      where: { rarityId },
      select: {
        characterId: true,
        CharacterHusbando: {
          select: {
            id: true,
            name: true,
            mediaType: true,
            media: true,
            linkweb: true,
            linkwebExpiresAt: true,
          },
        },
      },
    }),
  ]);

  const rarity = await prisma.rarity.findUnique({
    where: { id: rarityId },
    select: { name: true, emoji: true },
  });

  const rarityName = rarity?.name || "";
  const rarityEmoji = rarity?.emoji || "";

  return {
    waifus: waifuRarities.map((wr) => ({
      ...wr.CharacterWaifu,
      linkwebExpiresAt: wr.CharacterWaifu.linkwebExpiresAt?.toISOString() ?? null,
      mediaType: wr.CharacterWaifu.mediaType,
      rarityName,
      rarityEmoji,
    })),
    husbandos: husbandoRarities.map((hr) => ({
      ...hr.CharacterHusbando,
      linkwebExpiresAt: hr.CharacterHusbando.linkwebExpiresAt?.toISOString() ?? null,
      mediaType: hr.CharacterHusbando.mediaType,
      rarityName,
      rarityEmoji,
    })),
  };
}

export async function dropCharacter(
  characterId: number,
  type: "waifu" | "husbando",
  groupId: number,
) {
  try {
    const group = await prisma.telegramGroup.findUnique({
      where: { id: groupId },
      select: { groupId: true },
    });
    if (!group) return { success: false, message: "Grupo não encontrado" };

    let character: {
      name: string;
      mediaType: string;
      media: string;
      linkweb: string | null;
      linkwebExpiresAt: Date | null;
    } | null = null;

    if (type === "waifu") {
      character = await prisma.characterWaifu.findUnique({
        where: { id: characterId },
        select: { name: true, mediaType: true, media: true, linkweb: true, linkwebExpiresAt: true },
      });
    } else {
      character = await prisma.characterHusbando.findUnique({
        where: { id: characterId },
        select: { name: true, mediaType: true, media: true, linkweb: true, linkwebExpiresAt: true },
      });
    }

    if (!character) return { success: false, message: "Personagem não encontrado" };

    const bot = getBot(type);
    const chatId = Number(group.groupId);

    let fileIdOrUrl = character.media;

    if (
      character.linkweb &&
      character.linkwebExpiresAt &&
      new Date(character.linkwebExpiresAt) > new Date()
    ) {
      fileIdOrUrl = character.linkweb;
    }

    const caption = `<b>${character.name}</b>\n\nPersonagem enviado pelo painel admin.`;

    if (
      character.mediaType === "IMAGE_URL" ||
      character.mediaType === "IMAGE_FILEID"
    ) {
      await bot.api.sendPhoto(chatId, fileIdOrUrl, {
        caption,
        parse_mode: "HTML",
      });
    } else if (
      character.mediaType === "VIDEO_URL" ||
      character.mediaType === "VIDEO_FILEID"
    ) {
      await bot.api.sendVideo(chatId, fileIdOrUrl, {
        caption,
        parse_mode: "HTML",
      });
    } else {
      return { success: false, message: `Tipo de mídia não suportado: ${character.mediaType}` };
    }

    return { success: true, message: `${character.name} dropado no grupo ${group.groupId}!` };
  } catch (e) {
    return { success: false, message: String(e) };
  }
}
