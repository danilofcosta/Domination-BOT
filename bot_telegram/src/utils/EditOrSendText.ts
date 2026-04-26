import type { MyContext } from "./customTypes";

export async function EditOrSendText({
  ctx,
  reply_markup,
  caption,
}: {
  ctx: MyContext;
  reply_markup?: any;
  caption: string;
}) {
  // If it's a direct command call (not a callback button interaction)
  if (!ctx.callbackQuery) {
    return ctx.reply(caption, {
      parse_mode: "HTML",
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
        ctx.reply(caption, {
          parse_mode: "HTML",
          reply_markup,
        });
      });
    await ctx.answerCallbackQuery();
  } else if (ctx.msg) {
    // console.log("error edit message text", ctx.msg.caption)
    await ctx
      .editMessageText(caption, {
        parse_mode: "HTML",
        reply_markup,
      })
      .catch((err) => {
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
