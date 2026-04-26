import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../../utils/customTypes.js";
import { EditOrSendText } from "../../../utils/EditOrSendText.js";
import { buildKeyboard } from "../../../utils/btns.js";

const help_dict = {
  comandos: {
    title: "help-btn-comandos",
    callback: "comandos",
  },
};

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

  // const reply_markup = new InlineKeyboard()
  //   .text(
  //     ctx.t("help-btn-comandos", {
  //       botName: ctx.me.first_name,
  //       genero: ctx.session.settings.genero,
  //     }),
  //     "help_btn_comandos",
  //   )
  //   //   .text(ctx.t("help-btn-admin"), "help_btn_admin")
  //   .row()
  //   .text(ctx.t("btn-close"), "close");

  const caption = ctx.t("help-caption", {
    botName: ctx.me.first_name,
    genero: ctx.session.settings.genero,
  });

  const reply_markup = buildKeyboard(ctx, help_dict);

  await EditOrSendText({
    ctx,
    reply_markup,
    caption,
  });
}
