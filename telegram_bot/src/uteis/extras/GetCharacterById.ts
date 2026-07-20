import { prisma } from "../../lib/prisma.js";
import { ChatType } from "../CustomTypes.js";
import { getOrSet, rankingCache } from "../../cache/cache.js";

export async function GetCharacterById(botType: ChatType, characterId: number) {
  const cacheKey = `GetCharacterById:${botType}:${characterId}`;
  return getOrSet(rankingCache, cacheKey, async () => {
    if (botType === ChatType.WAIFU) {
      return prisma.characterWaifu.findUnique({
        where: { id: characterId },
        include: {
          WaifuRarity: { include: { Rarity: true } },
          WaifuEvent: { include: { Event: true } },
        },
      });
    }
    return prisma.characterHusbando.findUnique({
      where: { id: characterId },
      include: {
        HusbandoRarity: { include: { Rarity: true } },
        HusbandoEvent: { include: { Event: true } },
      },
    });
  });
}
