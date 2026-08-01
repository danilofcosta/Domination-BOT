import { prisma } from "../../../../lib/prisma.js";
import { ChatType } from "../../../../uteis/CustomTypes.js";

export type UpdateCharacterData = {
  id: number;
  genero: ChatType;
  nome?: string;
  anime?: string;
  mediatype?: string;
  media?: string;
  mediaUniqueId?: string;
  sourceType?: string;
  rarities?: number[];
  events?: number[];
};

export type CreateCharacterData = {
  nome: string;
  anime: string;
  genero: ChatType;
  mediatype: string;
  media: string;
  mediaUniqueId?: string;
  sourceType?: string;
  rarities?: number[];
  events?: number[];
  addby?: any;
  extras?: any;

};

function generateSlug(name: string, origem: string): string {
  const base = `${name}-${origem}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createCharacter(data: CreateCharacterData) {
  const slug = generateSlug(data.nome, data.anime);

  const nextIdResult = await prisma.$queryRawUnsafe<{ next_id: number }[]>(
    `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM "${data.genero === ChatType.HUSBANDO ? "CharacterHusbando" : "CharacterWaifu"}"`,
  );
  const nextId = nextIdResult[0]?.next_id ?? 1;

  if (!data.rarities || data.rarities.length === 0) {
    data.rarities = [1];
  }

  if (data.genero === ChatType.HUSBANDO) {
    return prisma.$transaction(async (tx) => {
      const char = await (tx as any).characterHusbando.create({
        data: {
          id: nextId,
          name: data.nome,
          origem: data.anime,
          mediaType: data.mediatype,
          media: data.media,
          mediaUniqueId: data.mediaUniqueId,
          sourceType: data.sourceType ?? "ANIME",
          slug,
          addby: data.addby ?? null,
          ...(data.rarities?.length && {
            HusbandoRarity: {
              create: data.rarities.map((rarityId: number) => ({
                Rarity: { connect: { id: rarityId } },
              })),
            },
          }),
          ...(data.events?.length && {
            HusbandoEvent: {
              create: data.events.map((eventId: number) => ({
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
  }

  return prisma.$transaction(async (tx) => {
      const char = await (tx as any).characterWaifu.create({
        data: {
          id: nextId,
          name: data.nome,
          origem: data.anime,
          mediaType: data.mediatype,
          media: data.media,
          mediaUniqueId: data.mediaUniqueId,
          sourceType: data.sourceType ?? "ANIME",
          slug,
          addby: data.addby ?? null,
        ...(data.rarities?.length && {
          WaifuRarity: {
            create: data.rarities.map((rarityId: number) => ({
              Rarity: { connect: { id: rarityId } },
            })),
          },
        }),
        ...(data.events?.length && {
          WaifuEvent: {
            create: data.events.map((eventId: number) => ({
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
}

export async function updateCharacter(data: UpdateCharacterData) {
  const isHusbando = data.genero === ChatType.HUSBANDO;
  const model = isHusbando ? "characterHusbando" : "characterWaifu";
  const rarityJoin = isHusbando ? "HusbandoRarity" : "WaifuRarity";
  const eventJoin = isHusbando ? "HusbandoEvent" : "WaifuEvent";

  return prisma.$transaction(async (tx) => {
    if (data.rarities !== undefined) {
      await (tx as any)[model].update({
        where: { id: data.id },
        data: {
          [rarityJoin]: { deleteMany: {} },
        },
      });
    }

    if (data.events !== undefined) {
      await (tx as any)[model].update({
        where: { id: data.id },
        data: {
          [eventJoin]: { deleteMany: {} },
        },
      });
    }

    const updateData: Record<string, any> = {};
    if (data.nome !== undefined) updateData.name = data.nome;
    if (data.anime !== undefined) updateData.origem = data.anime;
    if (data.mediatype !== undefined) updateData.mediaType = data.mediatype;
    if (data.media !== undefined) updateData.media = data.media;
    if (data.mediaUniqueId !== undefined) updateData.mediaUniqueId = data.mediaUniqueId;
    if (data.sourceType !== undefined) updateData.sourceType = data.sourceType;

    if (data.rarities?.length) {
      updateData[rarityJoin] = {
        create: data.rarities.map((rarityId: number) => ({
          Rarity: { connect: { id: rarityId } },
        })),
      };
    }

    if (data.events?.length) {
      updateData[eventJoin] = {
        create: data.events.map((eventId: number) => ({
          Event: { connect: { id: eventId } },
        })),
      };
    }

    const char = await (tx as any)[model].update({
      where: { id: data.id },
      data: updateData,
      include: {
        [rarityJoin]: { include: { Rarity: true } },
        [eventJoin]: { include: { Event: true } },
      },
    });

    return char;
  });
}
