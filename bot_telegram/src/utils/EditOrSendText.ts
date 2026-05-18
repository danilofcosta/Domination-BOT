import type { InlineKeyboardMarkup } from "grammy/types";
import type { MyContext } from "./customTypes.js";
import { Sendmedia } from "./sendmedia.js";

export async function EditOrSendText({
  ctx,
  reply_markup,
  caption,
}: {
  ctx: MyContext;
  reply_markup?: InlineKeyboardMarkup | undefined;
  caption?: string;
}) {
  if (!caption) {
    return await ctx.editMessageReplyMarkup({ reply_markup: reply_markup });
  }

  // If it's a direct command call (not a callback button interaction)
  if (!ctx.callbackQuery) {
    return Sendmedia({
      ctx,
      caption,
      reply_markup,
    });
  }

  if (!ctx.callbackQuery?.message?.text) {
    await ctx
      .editMessageCaption({
        caption,
        parse_mode: "HTML",
        reply_markup,
      })
      .catch((err) => {
        // console.log("error edit message text", err)
        Sendmedia({
          ctx,
          caption,
          reply_markup,
        });
      });
    await ctx.answerCallbackQuery();
  } else if (ctx.msg) {
    if (!caption) {
      return console.log("legenda vazia");
    }
    // console.log("error edit message text", ctx.msg.caption)
    await ctx
      .editMessageText(caption, {
        parse_mode: "HTML",
        reply_markup,
      })
      .catch((err) => {
        // console.log("error edit message text", err  )
        Sendmedia({
          ctx,
          caption,
          reply_markup,
        });
      });
  } else {
    await Sendmedia({
      ctx,
      caption,
      reply_markup,
    });
  }
}
