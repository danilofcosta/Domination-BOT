import { prisma } from "../../../lib/prisma.js";
import {
  ChatType,
  MediaType,
  type CollectionItem,
  type MyContext,
} from "../../../utils/customTypes.js";
import { createResult } from "../create_inline_result.js";
import { showResults } from "../show_results_inline.js";

interface GetHaremCollectionParams {
  telegramId?: number;
  where?: any;
  offset: number;
  genero: ChatType;
}

export const LIMIT = 20;

export async function getHaremCollection(
  { telegramId, where, offset, genero }: GetHaremCollectionParams
) {
  const isHusbando = genero === ChatType.HUSBANDO;
  const _where = where || { userId: telegramId };
  if (isHusbando) {


    const [collection, total] = await Promise.all([
      prisma.husbandoCollection.findMany({
        where: _where,
        orderBy: { createdAt: "desc" },
        take: LIMIT,
        skip: offset,
        include: {
          User: true,
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
      }),

      prisma.husbandoCollection.count({ where: _where }),
    ]);

    return { collection, total };
  }
  // ////
  // const where = {
  //   userId: telegramId,
  //   // Character: {
  //   //   mediaType: MediaType.IMAGE_URL,
  //   // },
  // };

  const [collection, total] = await Promise.all([
    prisma.waifuCollection.findMany({
      where: _where,
      orderBy: { createdAt: "desc" },
      take: LIMIT,
      skip: offset,
      include: {
        User: true,
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
    }),

    prisma.waifuCollection.count({ where: _where }),
  ]);

  return { collection, total };
}
export async function haremInlineQuery(ctx: MyContext) {
    const LIMIT = 20;
  if (!ctx.inlineQuery) return;

  const genero = process.env.TYPE_BOT as ChatType;

  const query = ctx.inlineQuery.query;
  if (!query.startsWith("harem_user_")) return;

  const telegramId = Number(query.replace("harem_user_", "").trim());
  if (!telegramId) return;

  const offset = Number(ctx.inlineQuery.offset || "0");

  const { collection, total } = await getHaremCollection({
    telegramId,
    offset,
    genero,
  });
  //  console.log(collection);

  if (!collection.length) return;

  const results = collection.map((item: CollectionItem) =>
    createResult({
      t: ctx.t,
      character: item,
      chatType: genero,
      noformat: true,
    }),
  );

  await showResults({
    ctx,
    results,
    next_offset: offset + LIMIT < total ? String(offset + LIMIT) : "",
    text: `${ctx.t("Logo_bt")}  : ${total}`,
    isharem: true,
  });
}
