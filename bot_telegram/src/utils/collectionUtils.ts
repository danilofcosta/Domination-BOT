import { prisma } from "../lib/prisma.js";

export async function findCollectionWithIncludes(params: {
  isWaifu: boolean;
  telegramId: number;
  characterId: number;
}) {
  const { isWaifu, telegramId, characterId } = params;
  const where = {
    userId: telegramId,
    characterId: characterId,
  };
  if (isWaifu) {
    return prisma.waifuCollection.findFirst({
      where,
      include: {
        CharacterWaifu: {
          include: {
            WaifuEvent: { include: { Event: true } },
            WaifuRarity: { include: { Rarity: true } },
          },
        },
      },
    });
  }

  return prisma.husbandoCollection.findFirst({
    where,
    include: {
      CharacterHusbando: {
        include: {
          HusbandoEvent: { include: { Event: true } },
          HusbandoRarity: { include: { Rarity: true } },
        },
      },
    },
  });
}
