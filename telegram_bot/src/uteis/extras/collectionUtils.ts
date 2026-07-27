import { isWaifuBotCheck } from "../../CommandsRegistry/botConfigCommands.js";
import { prisma } from "../../lib/prisma.js";
// busca na coleção do usuário, incluindo informações relacionadas ao personagem, eventos e raridade.
export async function findCollectionWithIncludes(params: {
 
  telegramId: number;
  characterId?: number;
  multicharacterId?: number[];
}) {
   const isWaifu: boolean = isWaifuBotCheck();
  const { telegramId, characterId, multicharacterId } = params;

  // Modo múltiplos IDs
  if (multicharacterId?.length) {
    const collection = isWaifu
      ? await prisma.waifuCollection.findMany({
          where: {
            userId: telegramId,
            characterId: {
              in: multicharacterId,
            },
          },
        })
      : await prisma.husbandoCollection.findMany({
          where: {
            userId: telegramId,
            characterId: {
              in: multicharacterId,
            },
          },
        });

    const foundIds = new Set(collection.map((item) => item.characterId));

    const missingIds = multicharacterId.filter((id) => !foundIds.has(id));

    return {
      success: missingIds.length === 0,
      missingIds,
      collection,
    };
  }

  // Modo único ID
  const where: any = { userId: telegramId };
  if (characterId !== undefined) {
    where.characterId = characterId;
  }

  if (isWaifu) {
    return prisma.waifuCollection.findFirst({
      where,
      include: {
        Character: {
          include: {
            WaifuEvent: {
              include: { Event: true },
            },
            WaifuRarity: {
              include: { Rarity: true },
            },
          },
        },
      },
    });
  }

  return prisma.husbandoCollection.findFirst({
    where,
    include: {
      Character: {
        include: {
          HusbandoEvent: {
            include: { Event: true },
          },
          HusbandoRarity: {
            include: { Rarity: true },
          },
        },
      },
    },
  });
}
