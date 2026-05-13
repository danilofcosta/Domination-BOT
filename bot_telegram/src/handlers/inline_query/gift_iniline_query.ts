import { bts_yes_or_no } from "../../utils/btns.js";
import type {
  ChatType,
  CollectionItem,
  MyContext,
} from "../../utils/customTypes.js";
import { error, warn } from "../../utils/log.js";
import { createResult } from "./create_inline_result.js";
import { getHaremCollection, LIMIT } from "./harem_inline_query.js";
import { showResults } from "./show_results_inline.js";

export async function Gift_Inline_query(ctx: MyContext) {
  if (!ctx.inlineQuery) return;

  const genero = process.env.TYPE_BOT as ChatType;

  const query = ctx.inlineQuery.query;

  const telegramId_recipient = Number(
    query.replace("select_gift_to_", "").trim(),
  );
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const offset = Number(ctx.inlineQuery.offset || "0");

  const { collection, total } = await getHaremCollection(
    telegramId,
    offset,
    genero,
  );

  const results = collection.map((item: CollectionItem) =>
    createResult({
      ctx,
      character: item,
      chatType: genero,
      noformat: true,
      reply_markup: bts_yes_or_no(
        ctx,
        `gift_yes_${item.id}_${telegramId_recipient}_${ctx.from?.id}`,
        `gift_no_${item.id}_${telegramId_recipient}_${ctx.from?.id}`,
      ),
    }),
  );
  try {
    setTimeout(() => {
      ctx.api.deleteMessage(ctx.chat!.id, ctx.msg?.message_id!).catch((e) => {
        error("sucess ao enviar mensagem de nome incorreto", e);
      });
    }, 20000);
  } catch (e) {
    error("Erro ao enviar mensagem de nome incorreto", e);
  }

  await showResults({
    ctx,
    results,
    next_offset: offset + LIMIT < total ? String(offset + LIMIT) : "",
    text: ctx.t("select-inline-gift"),
  });
}
