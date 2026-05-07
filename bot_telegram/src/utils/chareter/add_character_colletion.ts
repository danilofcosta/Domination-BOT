import { prisma } from "../../../lib/prisma.js";
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
    /**
     * Busca usuário atual
     * para evitar sobrescrever favoritos
     */
    const existingUser = await prisma.user.findUnique({
      where: {
        telegramId,
      },

      select: {
        favoriteWaifuId: true,
        favoriteHusbandoId: true,
      },
    });

    /**
     * Cria ou atualiza usuário
     */
    await prisma.user.upsert({
      where: {
        telegramId,
      },

      update: {
        // Atualiza telegramData somente se existir
        ...(from && {
          telegramData: from,
        }),

        // Define waifu favorita somente se ainda for null
        ...(isWaifu &&
          existingUser?.favoriteWaifuId == null && {
            favoriteWaifuId: characterId,
          }),

        // Define husbando favorito somente se ainda for null
        ...(!isWaifu &&
          existingUser?.favoriteHusbandoId == null && {
            favoriteHusbandoId: characterId,
          }),
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

    /**
     * Atualiza coleção
     */
    const result = isWaifu
      ? await prisma.waifuCollection.upsert({
          where: {
            userId_characterId: {
              userId: telegramId,
              characterId,
            },
          },

          update: {
            count: {
              increment: 1,
            },
          },

          create: {
            userId: telegramId,
            characterId,
            count: 1,
          },
        })

      : await prisma.husbandoCollection.upsert({
          where: {
            userId_characterId: {
              userId: telegramId,
              characterId,
            },
          },

          update: {
            count: {
              increment: 1,
            },
          },

          create: {
            userId: telegramId,
            characterId,
            count: 1,
          },
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