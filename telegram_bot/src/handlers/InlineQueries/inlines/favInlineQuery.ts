import { CreateButtunConfirmation } from "../../../utils/buildButtons/createButtonConfirmation.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { createInlineResult } from "../utils/createInlineResult.js";
import { showResultsInline } from "../utils/showResultsInline.js";
import { getHaremCollection, LIMIT } from "./haremInlineQuery.js";

export async function favInlineQuery(ctx: MyContext) {
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
    createInlineResult({
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

  await showResultsInline({
    ctx,
    results,
    next_offset: offset + LIMIT < total ? String(offset + LIMIT) : "",
    text: ctx.t("fav-btn-select"),
    maxCacheTelegram: true,
  });
}
