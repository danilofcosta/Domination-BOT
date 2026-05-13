import { prisma } from "../lib/prisma.js";

export async function findCollectionWithIncludes(params: {
  isWaifu: boolean;
  userId: number ;
  characterId: number;
}) {
  const { isWaifu, userId, characterId } = params;

  if (isWaifu) {
    return prisma.waifuCollection.findFirst({
      where: { userId, characterId },
      include: {
        Character: {
          include: {
            WaifuEvent: { include: { Event: true } },
            WaifuRarity: { include: { Rarity: true } },
          },
        },
      },
    });
  }

  return prisma.husbandoCollection.findFirst({
    where: { userId, characterId },
    include: {
      Character: {
        include: {
          HusbandoEvent: { include: { Event: true } },
          HusbandoRarity: { include: { Rarity: true } },
        },
      },
    },
  });
}
