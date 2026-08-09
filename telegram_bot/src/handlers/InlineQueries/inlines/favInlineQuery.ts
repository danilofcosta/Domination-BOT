import { CreateButtunConfirmation } from "../../../uteis/buildButtons/createButtonConfirmation.js";
import { ChatType, type MyContext } from "../../../uteis/CustomTypes.js";
import { createResult } from "../uteis/create_inline_result.js";
import { showResults } from "../uteis/show_results_inline.js";
import { getHaremCollection, LIMIT } from "./harem_inline_query.js";

export async function Fav_Inline_query(ctx: MyContext) {
  if (!ctx.inlineQuery) return;

  const genero = ctx.botType;

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const offset = Number(ctx.inlineQuery.offset || "0");

  const { collection, total } = await getHaremCollection({
    telegramId,
    offset,
    genero,
  });

  const results = collection.map((item: any) =>
    createResult({
      t: ctx.t,
      character: item,
      chatType: genero,
      rawEmoji: true,
      reply_markup: CreateButtunConfirmation(
        ctx,
        `fav_yes_${item.characterId}_${telegramId}`,
        `fav_no_${item.characterId}_${telegramId}`,
      ),
    }),
  );

  await showResults({
    ctx,
    results,
    next_offset: offset + LIMIT < total ? String(offset + LIMIT) : "",
    text: ctx.t("fav-btn-select"),
    maxCacheTelegram: true,
  });
}
