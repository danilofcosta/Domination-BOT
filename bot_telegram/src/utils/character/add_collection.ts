import { prisma } from "../../lib/prisma.js";
import type { ChatType } from "../customTypes.js";
import { info, error, debug } from "../log.js";

interface AddCharacterCollectionForm {
  type: ChatType;
  userId: number | bigint | string;
  from?: any;
  characterId: number;
}

export async function AddCharacterCollection({
  type,
  userId,
  from,
  characterId,
}: AddCharacterCollectionForm) {
  const isWaifu = type === "waifu";

  // Garantindo compatibilidade com BigInt do Prisma
  const telegramId = BigInt(userId);

  info("AddCharacterCollection", {
    telegramId: telegramId.toString(),
    characterId,
    isWaifu,
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      //user ja tem um favorito?
      const existingUser = await tx.user.findUnique({
        where: { telegramId },
        select: { favoriteWaifuId: true, favoriteHusbandoId: true },
      });

      //verifica se o user existe caso existir e o favorito for null add o persogem atual
      //caso favorito existir deve manter 
      // caso user n existir deve ser criado (telegramId) obrigatorio 


      await tx.user.upsert({
        where: { telegramId },
        update: {
          ...(from && { telegramData: from }),
          ...(isWaifu && existingUser?.favoriteWaifuId == null && { favoriteWaifuId: characterId }),
          ...(!isWaifu && existingUser?.favoriteHusbandoId == null && { favoriteHusbandoId: characterId }),
        },
        create: {
          telegramId,
          telegramData: from ?? {},
          favoriteWaifuId: isWaifu ? characterId : null,
          favoriteHusbandoId: !isWaifu ? characterId : null,
          waifuConfig: {},
          husbandoConfig: {},
        },
      });
// add persogem na coleção do user 
// caso o persogem ja exista incrementa mais 1 no count

      const collection = isWaifu
        ? await tx.waifuCollection.upsert({
            where: { userId_characterId: { userId: telegramId, characterId } },
            update: { count: { increment: 1 } },
            create: { userId: telegramId, characterId, count: 1 },
          })
        : await tx.husbandoCollection.upsert({
            where: { userId_characterId: { userId: telegramId, characterId } },
            update: { count: { increment: 1 } },
            create: { userId: telegramId, characterId, count: 1 },
          });

      return collection;
    });

    debug("AddCharacterCollection OK", {
      telegramId: telegramId.toString(),
      characterId,
      count: result.count,
    });
    
    // caso sucesso retorna a per na coleção 
    return result;
  } catch (e) {
    error("AddCharacterCollection ERROR", e);

    return null;
  }
}