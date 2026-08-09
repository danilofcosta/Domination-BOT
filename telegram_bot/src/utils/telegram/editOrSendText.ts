import type { InlineKeyboardMarkup } from "grammy/types";
import type { MyContext } from "../customTypes.js";
import { sendMessageCustom } from "../sendMessageCustom.js";

type Options = {
  ctx: MyContext;
  reply_markup?: InlineKeyboardMarkup;
  caption?: string;
  removeButtons?: boolean;
};

export async function editOrSendText({
  ctx,
  reply_markup,
  caption,
  removeButtons = true,
}: Options) {
  if (!caption) {
    return ctx.editMessageReplyMarkup(
      reply_markup ? { reply_markup } : undefined,
    );
  }

  if (!ctx.callbackQuery) {
    return sendMessageCustom({ ctx, caption, reply_markup });
  }

  const hasText = !!ctx.callbackQuery.message?.text;

const currentReplyMarkup =
  ctx.callbackQuery.message?.reply_markup;

const opts = {
  parse_mode: "HTML" as const,
  ...(removeButtons
    ? { reply_markup }
    : currentReplyMarkup
      ? { reply_markup: currentReplyMarkup }
      : {}),
};
  const edit = hasText
    ? ctx.editMessageText(caption, opts)
    : ctx.editMessageCaption({
        caption,
        ...opts,
      });

    await edit.catch(() =>
    sendMessageCustom({ ctx, caption, reply_markup }),
  );

  await ctx.answerCallbackQuery();
}