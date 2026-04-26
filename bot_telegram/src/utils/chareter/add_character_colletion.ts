import { prisma } from "../../../lib/prisma.js";
import type { ChatType } from "../customTypes.js";
import { info, error, debug } from "../log.js";

interface AddCharacterCollectionForm {
  type: ChatType,
  userId: number,
  from: any,
  Charater_id: number
}

export async function AddCharacterCollection({
  type,
  userId,
  from,
  Charater_id
}: AddCharacterCollectionForm) {
  const isWaifu = type === "waifu";

  info(`AddCharacterCollection`, { userId, characterId: Charater_id, isWaifu });

  try {
    // 🚀 1. Upsert do usuário (sem query prévia)
    await prisma.user.upsert({
      where: { telegramId: userId },
      update: {
        ...(isWaifu && {
          favoriteWaifuId: {
            // só define se ainda for null
            set: Charater_id,
          },
        }),
        ...(!isWaifu && {
          favoriteHusbandoId: {
            set: Charater_id,
          },
        }),
      },
      create: {
        telegramId: userId,
        telegramData: (from ?? {}),
        favoriteWaifuId: isWaifu ? Charater_id : null,
        favoriteHusbandoId: !isWaifu ? Charater_id : null,
        waifuConfig: {},
        husbandoConfig: {},
      },
    });

    // 🚀 2. Upsert da coleção (única operação crítica)
    const result = isWaifu
      ? await prisma.waifuCollection.upsert({
          where: {
            userId_characterId: {
              userId,
              characterId: Charater_id,
            },
          },
          update: {
            count: { increment: 1 },
          },
          create: {
            userId,
            characterId: Charater_id,
            count: 1,
          },
        })
      : await prisma.husbandoCollection.upsert({
          where: {
            userId_characterId: {
              userId,
              characterId: Charater_id,
            },
          },
          update: {
            count: { increment: 1 },
          },
          create: {
            userId,
            characterId: Charater_id,
            count: 1,
          },
        });

    debug(`AddCharacterCollection OK`, {
      userId,
      characterId: Charater_id,
      count: result.count
    });

    return result;

  } catch (e) {
    error(`AddCharacterCollection ERROR`, e);
    return null;
  }
}