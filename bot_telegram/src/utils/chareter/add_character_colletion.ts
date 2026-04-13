import { prisma } from "../../../lib/prisma.js";
import type { ChatType } from "../customTypes.js";

interface AddCharacterCollectionForm{
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

  const existingUser = await prisma.user.findUnique({
    where: { telegramId: userId },
  });

  const shouldSetFavorite = isWaifu
    ? existingUser?.favoriteWaifuId === null || !existingUser
    : existingUser?.favoriteHusbandoId === null || !existingUser;

  const user = await prisma.user.upsert({
    where: { telegramId: userId },
    update: shouldSetFavorite
      ? isWaifu
        ? { favoriteWaifuId: Charater_id }
        : { favoriteHusbandoId: Charater_id }
      : {},
    create: {
      telegramId: userId,
      telegramData: (from ?? {}) as Record<string, any>,
      favoriteWaifuId: isWaifu ? Charater_id : null,
      favoriteHusbandoId: !isWaifu ? Charater_id : null,
      waifuConfig: {},
      husbandoConfig: {},
    },
  });

  const collection: any = isWaifu
    ? prisma.waifuCollection
    : prisma.husbandoCollection;

  const collection_result = await collection.upsert({
    where: {
      userId_characterId: {
        userId: userId,
        characterId: Charater_id,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId: userId,
      characterId: Charater_id,
      count: 1,
    },
  });
  return collection_result;
}
