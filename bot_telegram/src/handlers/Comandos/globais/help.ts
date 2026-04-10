import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../../utils/customTypes.js";

export async function helpCommand(ctx: MyContext) {
  const isPrivate = ctx.chat?.type === "private";

  if (!isPrivate) {
    const keyboard = new InlineKeyboard().url(
      ctx.t("help-btn-open-pm"),
      `https://t.me/${ctx.me.username}?start=help`,
    );

    await ctx.reply(ctx.t("help-group-redirect"), {
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
    return;
  }

  const reply_markup = new InlineKeyboard()
    .text(ctx.t("help-btn-comandos"), "help_user_cmds")
    .row()
    .text(ctx.t("help-btn-admin"), "help_admin_cmds")
    .row()
    .text(ctx.t("btn-close"), "close");

  const caption = ctx.t("help-caption");

  if (ctx.msg) {
    await ctx.editMessageText(caption, {
      parse_mode: "HTML",
      reply_markup,
    }).catch(() => {
      ctx.reply(caption, {
        parse_mode: "HTML",
        reply_markup,
      });
    });
  } else {
    await ctx.reply(caption, {
      parse_mode: "HTML",
      reply_markup,
    });
  }
}
