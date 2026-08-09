import { getHaremCollection, LIMIT } from "./haremInlineQuery.js";
import { createInlineResult } from "../utils/createInlineResult.js";
import { showResultsInline } from "../utils/showResultsInline.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";

export async function searchHarem(ctx: MyContext) {
  if (!ctx.inlineQuery) return;

  const genero = ctx.botType;
  const query = ctx.inlineQuery.query;
  if (!query.startsWith("my:")) return;

  const searchTerm = query.replace("my:", "").trim();

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  if (!searchTerm) {
    await showResultsInline({
      ctx,
      results: [],
      text: ctx.t("search-harem-title"),
      maxCacheTelegram: true,
    });
    return;
  }

  const offset = Number(ctx.inlineQuery.offset || "0");

  const where: any = { userId: telegramId };

  if (isNaN(Number(searchTerm))) {
    where["Character"] = {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { origem: { contains: searchTerm, mode: "insensitive" } },
      ],
    };
  } else {
    where.characterId = Number(searchTerm);
  }

  const { collection, total } = await getHaremCollection({
    where,
    offset,
    genero,
  });

  if (!collection.length) {
    await showResultsInline({
      ctx,
      results: [],
      text: ctx.t("search-harem-not-found"),
      maxCacheTelegram: true,
    });
    return;
  }

  const results = collection.map((item: any) =>
    createInlineResult({
      t: ctx.t,
      character: item,
      chatType: genero,
      rawEmoji: true,
    }),
  );

  await showResultsInline({
    ctx,
    results,
    next_offset: offset + LIMIT < total ? String(offset + LIMIT) : "",
    text: `${ctx.t("Logo_bt")} : ${total}`,
    maxCacheTelegram: true,
  });
}
