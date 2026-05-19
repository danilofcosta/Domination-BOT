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
      const existingUser = await tx.user.findUnique({
        where: { telegramId },
        select: { favoriteWaifuId: true, favoriteHusbandoId: true },
      });

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

    return result;
  } catch (e) {
    error("AddCharacterCollection ERROR", e);

    return null;
  }
}