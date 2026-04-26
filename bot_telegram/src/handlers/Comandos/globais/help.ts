import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../../utils/customTypes.js";
import { EditOrSendText } from "../../../utils/EditOrSendText.js";
import { buildKeyboard } from "../../../utils/btns.js";

const help_dict = {
  comandos: {
    title: "help-btn-comandos",
    callback: "help_comandos",
  },
  como_presentear: {
    title: "help-btn-comment-harem",
    callback: "help_harem",
  },
    topic: {
    title: "help-btn-comment-topic",
    callback: "help_topic",
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
