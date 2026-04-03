import { InlineKeyboard } from "grammy";
import { getHarem } from "../../cache/cache.js";
import type { MyContext } from "../../utils/customTypes.js";

export async function haremCallback(ctx: MyContext) {
  const match = ctx.match as any;
  const parts = (typeof match === "string" ? match : match?.input)?.split("_") ?? [];
  const [tag, userTag, userid, action, pageRaw, jumpRaw] = parts;

  const userId = Number(userid);

  if (ctx.from?.id !== userId) {
    await ctx.answerCallbackQuery(
      ctx.t("error-action-not-autoauthorized-by-id"),
    );
    return;
  }

  if (action === "close") {
    await ctx.deleteMessage().catch(() => {});
    return;
  }

  const harem = await getHarem(userId);
  if (!harem) return;

  const total = harem.length;
  let page = Number(pageRaw ?? 0);

  if (isNaN(page)) return;

  let jump = Number(jumpRaw ?? 2);
  if (isNaN(jump)) jump = 2;

  // ações
  if (action === "prev") page--;
  if (action === "next") page++;
  if (action === "jump") page += jump;

  if (action === "page") page = 0;

  // limite
  if (page < 0 || page >= total) return;

  // próximo salto
  const nextJump = jump * 2;

  const keyboard = new InlineKeyboard()
    .text(ctx.t("harem_btn_prev_page"), `harem_user_${userId}_prev_${page}`)
    .text(
      ctx.t("harem_btn_current_page", {
        currentpage: page + 1,
        totalpages: total,
      }),
      `harem_user_${userId}_page`,
    )
    .text(ctx.t("harem_btn_next_page"), `harem_user_${userId}_next_${page}`)
    .row()
    // .switchInline(ctx.t("harem_btn_inline_query"), `harem_user_${userId}`)
    .switchInlineCurrent(ctx.t("harem_btn_inline_query"), `harem_user_${userId}`)
    .text(
      ctx.t("harem_btn_fast_page") + ` x${jump}`,
      `harem_user_${userId}_jump_${page}_${nextJump}`,
    )
    .row()
    .text(ctx.t("harem_btn_close"), `harem_user_${userId}_close`);

  await ctx.editMessageCaption({
    caption: harem[page],
    reply_markup: keyboard,
    parse_mode: "HTML",
  });

  await ctx.answerCallbackQuery();
}
