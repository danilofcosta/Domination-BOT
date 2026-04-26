import { InlineKeyboard } from "grammy";
import type { MyContext } from "./customTypes.js";

export function buildKeyboard(
  ctx: MyContext,
  buttons: Record<string, { title: string; callback: string }>
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  for (const [, value] of Object.entries(buttons)) {
    keyboard.text(ctx.t(value.title), value.callback);
  }

  return keyboard;
}

export function bts_yes_or_no(
  ctx: MyContext,
  yes: string,
  no: string,
): InlineKeyboard {
  return new InlineKeyboard()
    .text(ctx.t("btn-no"), no)
    .text(ctx.t("btn-yes"), yes);
}