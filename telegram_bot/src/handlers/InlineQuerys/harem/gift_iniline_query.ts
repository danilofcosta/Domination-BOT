import { CreateButtunConfirmation } from "../../../uteis/buildButtons/createButtonConfirmation.js";
import { ChatType, type MyContext } from "../../../uteis/CustomTypes.js";
import { error } from "../../../uteis/log.js";
import { createResult } from "../uteis/create_inline_result.js";
import { getHaremCollection, LIMIT } from "./harem_inline_query.js";
import { showResults } from "../uteis/show_results_inline.js";

export async function Gift_Inline_query(ctx: MyContext) {
  if (!ctx.inlineQuery) return;
  // await ctx.deleteAllMessageReactions().catch((err) => {
  //   error("Gift_Inline_query - deleteAllMessageReactions", { error: err });
  // });

  const genero = ctx.botType;

  const query = ctx.inlineQuery.query;

  const telegramId_recipient = Number(
    query.replace("select_gift_to_", "").trim(),
  );
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
        `gift_yes_${item.characterId}_${telegramId_recipient}_${ctx.from?.id}`,
        `gift_no_${item.characterId}_${telegramId_recipient}_${ctx.from?.id}`,
      ),
    }),
  );

  await showResults({
    ctx,
    results,
    next_offset: offset + LIMIT < total ? String(offset + LIMIT) : "",
    text: ctx.t("select-inline-gift"),
    
  });
}
