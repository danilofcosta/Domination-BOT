import { prisma } from "../../lib/prisma.js";
import type { MyContext } from "./customTypes.js";

export async function AddCharacterCollection(
  ctx: MyContext,
  userId: number,
  Charater_id: number,
) {
  const isWaifu = ctx.session.settings.genero === "waifu";

  const user = await prisma.user.upsert({
    where: { telegramId: userId },
    update: {},
    create: {
      telegramId: userId,
      telegramData: (ctx.from ?? {}) as Record<string, any>,
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
