import { prisma } from "../../../lib/prisma.js";
import { ChatType, type Collection, type MyContext } from "../../../uteis/CustomTypes.js";
import { createResult } from "../uteis/create_inline_result.js";
import { showResults } from "../uteis/show_results_inline.js";

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
          TelegramUser: true,
          Character: {
            include: {
              HusbandoEvent: { include: { Event: true } },
              HusbandoRarity: { include: { Rarity: true } },
            },
          },
        },
      }),
      prisma.husbandoCollection.count({ where: _where }),
    ]);
    return { collection, total };
  }

  const [collection, total] = await Promise.all([
    prisma.waifuCollection.findMany({
      where: _where,
      orderBy: { createdAt: "desc" },
      take: LIMIT,
      skip: offset,
      include: {
        TelegramUser: true,
        Character: {
          include: {
            WaifuEvent: { include: { Event: true } },
            WaifuRarity: { include: { Rarity: true } },
          },
        },
      },
    }),
    prisma.waifuCollection.count({ where: _where }),
  ]);

  return { collection, total };
}

export async function haremInlineQuery(ctx: MyContext) {
  if (!ctx.inlineQuery) return;

  const genero = ctx.botType;

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

  if (!collection.length) return;

  const results = collection.map((item: any) =>
    createResult({
      t: ctx.t,
      character: item,
      chatType: genero,
      rawEmoji: true,
    }),
  );

  await showResults({
    ctx,
    results,
    next_offset: offset + LIMIT < total ? String(offset + LIMIT) : "",
    text: `${ctx.t("Logo_bt")}  : ${total}`,
    maxCacheTelegram: true,
  });
}
