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
  info(`AddCharacterCollection - adicionando à coleção`, { userId, characterId: Charater_id, isWaifu });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { telegramId: userId },
      });

      const shouldSetFavorite = isWaifu
        ? existingUser?.favoriteWaifuId === null || !existingUser
        : existingUser?.favoriteHusbandoId === null || !existingUser;

      const user = await tx.user.upsert({
        where: { telegramId: userId },
        update: shouldSetFavorite
          ? isWaifu
            ? { favoriteWaifuId: Charater_id }
            : { favoriteHusbandoId: Charater_id }
          : {},
        create: {
          telegramId: userId,
          telegramData: (from ?? {}),
          favoriteWaifuId: isWaifu ? Charater_id : null,
          favoriteHusbandoId: !isWaifu ? Charater_id : null,
          waifuConfig: {},
          husbandoConfig: {},
        },
      });

      debug(`AddCharacterCollection - usuário salvo/criado`, { userId, isNew: !existingUser });

      const upsertData = {
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
      };

      return isWaifu
        ? await tx.waifuCollection.upsert(upsertData)
        : await tx.husbandoCollection.upsert(upsertData);
    });

    debug(`AddCharacterCollection - transação concluída`, { userId, characterId: Charater_id, count: result.count });
    return result;
  } catch (e) {
    error(`AddCharacterCollection - erro na transação`, e);
    return null;
  }
}