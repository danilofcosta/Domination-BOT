import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../utils/customTypes.js";



export async function helpCommand(ctx: MyContext) {
  const isPrivate = ctx.chat?.type === "private";

  // If in a group, send a button to the user's DM
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

  // Private chat: send full help message with command buttons
  const keyboard = new InlineKeyboard()
    .text(ctx.t("help-cmd-dominar"), "help_section_dominar")
    .row()
    .text(ctx.t("help-cmd-harem"), "help_section_harem")
    .row()
    .text(ctx.t("help-cmd-info"), "help_section_info")
    .text(ctx.t("help-cmd-top"), "help_section_top")
    .row()
    .text(ctx.t("help-cmd-fav"), "help_section_fav")
    .text(ctx.t("help-cmd-gift"), "help_section_gift")
    .row()
    .text(ctx.t("btn-close"), "close");

  await ctx.reply(ctx.t("help-caption"), {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}