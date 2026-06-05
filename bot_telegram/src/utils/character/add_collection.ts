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
  if (type !== "waifu" && type !== "husbando") {
    throw new Error(`Invalid collection type: ${type}`);
  }

  const isWaifu = type === "waifu";

  const telegramId = BigInt(userId);

  info("AddCharacterCollection", {
    telegramId: telegramId.toString(),
    characterId,
    isWaifu,
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Garantir que o user existe (sem lógica de favorito)
      await tx.user.upsert({
        where: { telegramId },
        update: {
          ...(from && { telegramData: from }),
        },
        create: {
          telegramId,
          telegramData: from ?? {},
          waifuConfig: {},
          husbandoConfig: {},
        },
      });

      // 2. Atribuir favorito atômico (só se ainda for null)
      if (isWaifu) {
        await tx.user.updateMany({
          where: { telegramId, favoriteWaifuId: null },
          data: { favoriteWaifuId: characterId },
        });
      } else {
        await tx.user.updateMany({
          where: { telegramId, favoriteHusbandoId: null },
          data: { favoriteHusbandoId: characterId },
        });
      }

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

    if (!result) {
      debug("AddCharacterCollection retornou null", {
        telegramId: telegramId.toString(),
        characterId,
      });
      return null;
    }

    debug("AddCharacterCollection OK", {
      telegramId: telegramId.toString(),
      characterId,
      count: result.count,
    });

    return result as any;
  } catch (e) {
    error("AddCharacterCollection ERROR", e);

    return null;
  }
}