import type { InlineKeyboardMarkup } from "grammy/types";
import type { MyContext } from "../CustomTypes.js";
import { SendMensageCustom } from "../sendMensageCustom.js";

type Options = {
  ctx: MyContext;
  reply_markup?: InlineKeyboardMarkup;
  caption?: string;
  removeButtons?:boolean
};

export async function EditOrSendText({ ctx, reply_markup, caption,removeButtons }: Options) {
  if (!caption) {
    return ctx.editMessageReplyMarkup(
      reply_markup ? { reply_markup } : undefined,
    );
  }
  

  if (!ctx.callbackQuery) {
    return SendMensageCustom({ ctx, caption, reply_markup });
  }

  const opts = { parse_mode: "HTML" as const, ...(reply_markup ? { reply_markup } : {}) };
  const hasText = !!ctx.callbackQuery.message?.text;

  const edit = hasText
    ? ctx.editMessageText(caption, opts)
    : ctx.editMessageCaption({ caption, ...opts });

  await edit.catch(() =>
    SendMensageCustom({ ctx, caption, reply_markup }),
  );

  await ctx.answerCallbackQuery();
}
