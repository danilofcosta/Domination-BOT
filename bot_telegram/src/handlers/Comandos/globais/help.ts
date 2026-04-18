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
    .text(ctx.t("help-btn-comandos"), "help_btn_comandos")
 //   .text(ctx.t("help-btn-admin"), "help_btn_admin")
    .row()
    .text(ctx.t("btn-close"), "close");

  const caption = ctx.t("help-caption");

  // If it's a direct command call (not a callback button interaction)
  if (!ctx.callbackQuery) {
    return ctx.reply(caption, {
      parse_mode: "HTML",
      reply_markup,
    });
  }

  if (!ctx.callbackQuery?.message?.text) {
    await ctx.editMessageCaption({
      caption,
      parse_mode: "HTML",
      reply_markup,
    }).catch(err => {
      // console.log("error edit message text", err)
      ctx.reply(caption, {
        parse_mode: "HTML",
        reply_markup,
      });
    });
    await ctx.answerCallbackQuery();
  } else if (ctx.msg) {
    // console.log("error edit message text", ctx.msg.caption)
    await ctx.editMessageText(caption, {
      parse_mode: "HTML",
      reply_markup,
    }).catch((err) => {
      // console.log("error edit message text", err  )
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

