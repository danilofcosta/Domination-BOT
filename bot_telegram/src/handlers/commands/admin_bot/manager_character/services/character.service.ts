import { prisma } from "../../../../../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { generateSlug } from "../utils/slug.js";
import type { ChatType } from "../../../../../utils/customTypes.js";
import { maxIdCache } from "../../../../../cache/cache.js";

export type CreateCharacterData = {
  nome: string;
  anime: string;
  genero: ChatType;
  mediatype: string;
  media: string;
  mediaUniqueId?: string;
  rarities?: number[];
  events?: number[];
  addby?: any;
};

async function getRandomRarity(genero: ChatType): Promise<number | undefined> {
  const rarities =
    genero === "husbando"
      ? await prisma.husbandoRarity.findMany({ select: { rarityId: true } })
      : await prisma.waifuRarity.findMany({ select: { rarityId: true } });

  if (rarities.length === 0) return undefined;

  const randomIndex = Math.floor(Math.random() * rarities.length);
  return rarities[randomIndex]?.rarityId;
}

export async function createCharacter(data: CreateCharacterData) {
  let rarities = data.rarities;

  if (!rarities || rarities.length === 0) {
    const randomRarity = await getRandomRarity(data.genero);
    if (randomRarity) {
      rarities = [randomRarity];
    }
  }

  const slug = generateSlug(data.nome, data.anime);

  const cacheKey = data.genero === "husbando" ? "maxId:husbando" : "maxId:waifu";

  if (data.genero === "husbando") {
    const result = await prisma.$transaction(async (tx) => {
      const char = await tx.characterHusbando.create({
        data: {
          name: data.nome,
          origem: data.anime,
          mediaType: data.mediatype as any,
          media: data.media,
          mediaUniqueId: data.mediaUniqueId,
          slug,
          addby: data.addby ?? Prisma.JsonNull,
          ...(rarities?.length && {
            HusbandoRarity: {
              create: rarities.map((rarityId) => ({
                Rarity: { connect: { id: rarityId } },
              })),
            },
          }),
          ...(data.events?.length && {
            HusbandoEvent: {
              create: data.events.map((eventId) => ({
                Event: { connect: { id: eventId } },
              })),
            },
          }),
        },
        include: {
          HusbandoRarity: { include: { Rarity: true } },
          HusbandoEvent: { include: { Event: true } },
        },
      });
      return char;
    });
    maxIdCache.delete(cacheKey);
    return result;
  }

  const result = await prisma.$transaction(async (tx) => {
    const char = await tx.characterWaifu.create({
      data: {
        name: data.nome,
        origem: data.anime,
        mediaType: data.mediatype as any,
        media: data.media,
        mediaUniqueId: data.mediaUniqueId,
        slug,
        addby: data.addby ?? Prisma.JsonNull,
        ...(rarities?.length && {
          WaifuRarity: {
            create: rarities.map((rarityId) => ({
              Rarity: { connect: { id: rarityId } },
            })),
          },
        }),
        ...(data.events?.length && {
          WaifuEvent: {
            create: data.events.map((eventId) => ({
              Event: { connect: { id: eventId } },
            })),
          },
        }),
      },
      include: {
        WaifuRarity: { include: { Rarity: true } },
        WaifuEvent: { include: { Event: true } },
      },
    });
    return char;
  });
  maxIdCache.delete(cacheKey);
  return result;
}

export type UpdateCharacterData = {
  nome: string;
  anime: string;
  mediatype: string;
  media: string;
  mediaUniqueId?: string;
  rarities?: number[];
  events?: number[];
  addby?: any;
};

export async function updateCharacter(id: number, genero: ChatType, data: UpdateCharacterData) {
  if (genero === "husbando") {
    const result = await prisma.$transaction(async (tx) => {
      await tx.husbandoRarity.deleteMany({ where: { characterId: id } });
      await tx.husbandoEvent.deleteMany({ where: { characterId: id } });

      return tx.characterHusbando.update({
        where: { id },
        data: {
          name: data.nome,
          origem: data.anime,
          mediaType: data.mediatype as any,
          media: data.media,
          mediaUniqueId: data.mediaUniqueId,
          addby: data.addby ?? Prisma.JsonNull,
          ...(data.rarities?.length && {
            HusbandoRarity: {
              create: data.rarities.map((rarityId) => ({
                Rarity: { connect: { id: rarityId } },
              })),
            },
          }),
          ...(data.events?.length && {
            HusbandoEvent: {
              create: data.events.map((eventId) => ({
                Event: { connect: { id: eventId } },
              })),
            },
          }),
        },
        include: {
          HusbandoRarity: { include: { Rarity: true } },
          HusbandoEvent: { include: { Event: true } },
        },
      });
    });

    maxIdCache.delete("maxId:husbando");
    return result;
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.waifuRarity.deleteMany({ where: { characterId: id } });
    await tx.waifuEvent.deleteMany({ where: { characterId: id } });

    return tx.characterWaifu.update({
      where: { id },
      data: {
        name: data.nome,
        origem: data.anime,
        mediaType: data.mediatype as any,
        media: data.media,
        mediaUniqueId: data.mediaUniqueId,
        addby: data.addby ?? Prisma.JsonNull,
        ...(data.rarities?.length && {
          WaifuRarity: {
            create: data.rarities.map((rarityId) => ({
              Rarity: { connect: { id: rarityId } },
            })),
          },
        }),
        ...(data.events?.length && {
          WaifuEvent: {
            create: data.events.map((eventId) => ({
              Event: { connect: { id: eventId } },
            })),
          },
        }),
      },
      include: {
        WaifuRarity: { include: { Rarity: true } },
        WaifuEvent: { include: { Event: true } },
      },
    });
  });

  maxIdCache.delete("maxId:waifu");
  return result;
}

export async function getCharacterById(id: number, genero: ChatType) {
  if (genero === "husbando") {
    return await prisma.characterHusbando.findUnique({
      where: { id },
      include: {
        HusbandoRarity: { include: { Rarity: true } },
        HusbandoEvent: { include: { Event: true } },
      },
    });
  }
  return await prisma.characterWaifu.findUnique({
    where: { id },
    include: {
      WaifuRarity: { include: { Rarity: true } },
      WaifuEvent: { include: { Event: true } },
    },
  });
}
