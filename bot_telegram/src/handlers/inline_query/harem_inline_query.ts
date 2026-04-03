import { prisma } from "../../../lib/prisma.js";
import type { MyContext } from "../../utils/customTypes.js";
import { ChatType } from "../../utils/types.js";
import { createResult } from "./create_inline_result.js";
import { showResults } from "./show_results_inline.js";

const LIMIT = 10;

type CollectionItem =
  | Awaited<ReturnType<typeof prisma.waifuCollection.findMany>>[number]
  | Awaited<ReturnType<typeof prisma.husbandoCollection.findMany>>[number];

async function getHaremCollection(
  telegramId: number,
  offset: number,
  genero: ChatType,
) {
  const where = { userId: telegramId };
  const isHusbando = genero === ChatType.HUSBANDO;

  const model: any = isHusbando
    ? prisma.husbandoCollection
    : prisma.waifuCollection;

  const include = isHusbando
    ? {
        User: true,
        Character: {
          include: {
            HusbandoEvent: { include: { Event: true } },
            HusbandoRarity: { include: { Rarity: true } },
          },
        },
      }
    : {
        User: true,
        Character: {
          include: {
            WaifuEvent: { include: { Event: true } },
            WaifuRarity: { include: { Rarity: true } },
          },
        },
      };

  const [collection, total] = await Promise.all([
    model.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: LIMIT,
      skip: offset,
      include,
    }),
    model.count({ where }),
  ]);

  return { collection, total };
}

export async function haremInlineQuery(ctx: MyContext) {
  if (!ctx.inlineQuery) return;

  const genero = process.env.TYPE_BOT as ChatType;

  const query = ctx.inlineQuery.query;
  if (!query.startsWith("harem_user_")) return;

  const telegramId = Number(query.replace("harem_user_", "").trim());
  if (!telegramId) return;

  const offset = Number(ctx.inlineQuery.offset || "0");

  const { collection, total } = await getHaremCollection(
    telegramId,
    offset,
    genero,
  );
  //  console.log(collection);

  if (!collection.length) return;

  const results = collection.map((item: CollectionItem) =>
    createResult({
      ctx,
      character: item,
      chatType: genero,
      noformat: true,
    }),
  );

  await showResults({
    ctx,
    results,
    next_offset: offset + LIMIT < total ? String(offset + LIMIT) : "",
    text: `${ctx.t("Logo_bt")} : ${total}`,
  });
}
