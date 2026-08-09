import { CreateButtunConfirmation } from "../../../utils/buildButtons/createButtonConfirmation.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { error } from "../../../utils/log.js";
import { createInlineResult } from "../utils/createInlineResult.js";
import { getHaremCollection, LIMIT } from "./haremInlineQuery.js";
import { showResultsInline } from "../utils/showResultsInline.js";

export async function giftInlineQuery(ctx: MyContext) {
  if (!ctx.inlineQuery) return;
  // await ctx.deleteAllMessageReactions().catch((err) => {
  //   error("giftInlineQuery - deleteAllMessageReactions", { error: err });
  // });



  const genero = ctx.botType;

  const query = ctx.inlineQuery.query;

  const telegramId_recipient = Number(
    query.replace("select_gift_to_", "").trim(),
  );
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
''
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
        `gift_yes_${item.characterId}_${telegramId_recipient}_${ctx.from?.id}`,
        `gift_no_${item.characterId}_${telegramId_recipient}_${ctx.from?.id}`,
      ),
    }),
  );

  await showResultsInline({
    ctx,
    results,
    next_offset: offset + LIMIT < total ? String(offset + LIMIT) : "",
    text: ctx.t("select-inline-gift"),is_personal:true,

    notCacheTelegram:true
    
  });
}
