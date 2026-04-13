import { prisma } from "../../../lib/prisma.js";
import type { ChatType } from "../customTypes.js";

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

  return await prisma.$transaction(async (tx) => {
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
}