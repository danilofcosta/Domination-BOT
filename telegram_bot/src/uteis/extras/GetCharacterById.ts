import { prisma } from "../../lib/prisma.js";
import { ChatType } from "../CustomTypes.js";
import { getOrSet, rankingCache } from "../../cache/cache.js";

async function queryById(botType: ChatType, characterId: number) {
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
}

export async function GetCharacterById(
  botType: ChatType,
  characterId: number,
  useCache = true,
) {
  if (!useCache) return queryById(botType, characterId);
  const cacheKey = `GetCharacterById:${botType}:${characterId}`;
  return getOrSet(rankingCache, cacheKey, () =>
    queryById(botType, characterId),
  );
}
