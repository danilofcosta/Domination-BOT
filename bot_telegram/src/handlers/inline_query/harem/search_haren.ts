import { getHaremCollection, LIMIT } from "./harem_inline_query.js";
import { createResult } from "../create_inline_result.js";
import { showResults } from "../show_results_inline.js";
import { ChatType, type CollectionItem, type MyContext } from "../../../utils/customTypes.js";

export async function searchHarem(ctx: MyContext) {
  if (!ctx.inlineQuery) return;

  const genero = process.env.TYPE_BOT as ChatType;
  const query = ctx.inlineQuery.query;
  if (!query.startsWith("my:")) return;

  const searchTerm = query.replace("my:", "").trim();

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  if (!searchTerm) {
    await showResults({
      ctx,
      results: [],
      text: ctx.t("search-harem-title"),
      isharem: true,
    });
    return;
  }

  const offset = Number(ctx.inlineQuery.offset || "0");

  const where: any = { userId: telegramId };

  if (isNaN(Number(searchTerm))) {
    where[genero === ChatType.HUSBANDO ? "CharacterHusbando" : "CharacterWaifu"] = {
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
    await showResults({
      ctx,
      results: [],
      text: ctx.t("search-harem-not-found"),
      isharem: true,
    });
    return;
  }

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
    text: `${ctx.t("Logo_bt")} : ${total}`,
    isharem: true,
  });
}
