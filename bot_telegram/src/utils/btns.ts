import { InlineKeyboard } from "grammy";
import { BTN_TYPE, type MyContext } from "./customTypes.js";
import type { BTN_STYLE, CreateOneBtnOptions } from "./customTypes.js";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export function buildLetterKeyboard(cacheKey: string) {
  const keyboard = new InlineKeyboard();

  let count = 0;

  for (const letter of LETTERS) {
    keyboard.text(letter, `al_${letter}_${cacheKey}`);

    count++;

    if (count % 4 === 0) {
      keyboard.row();
    }
  }

  return keyboard;
}

export function buildKeyboard(
  ctx: MyContext,
  buttons: Record<string, { title: string; callback: string }>,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  let count = 0;

  for (const [, value] of Object.entries(buttons)) {
    keyboard.text(ctx.t(value.title), value.callback);
    count++;

    if (count % 3 === 0) {
      keyboard.row(); // quebra a linha a cada 4 botões
    }
  }

  return keyboard;
}
export function bts_yes_or_no(
  ctx: MyContext,

  yes: string,
  no: string,
  text_yes?: string,
  text_no?: string,
  icon_no?: string,
  icon_yes?: string,
): InlineKeyboard {
  const btn = new InlineKeyboard();

  // no
  btn.text(text_no || ctx.t("btn-no"), no).style("danger");
  if (icon_no) {
    btn.icon(icon_no);
  }

  // yes

  btn.text(text_yes || ctx.t("btn-yes"), yes).style("success");
  if (icon_yes) {
    btn.icon(icon_yes);
  }

  return btn;
}

export function CreateOneBtn(options: CreateOneBtnOptions): InlineKeyboard {
  const { typeBtn, text, callback, icon, style } = options;
  const btn = new InlineKeyboard();

  switch (typeBtn) {
    case BTN_TYPE.switch_inline_query_current_chat:
      btn.switchInlineCurrent(text, callback);
      break;
    case BTN_TYPE.callback_data:
      btn.text(text, callback);
      break;
    case BTN_TYPE.url:
      btn.url(text, callback);
      break;
    default:
      btn.text(text, callback);
      break;
  }

  if (icon) {
    btn.icon(icon);
  }
  if (style) {
    btn.style(style);
  }
  return btn;
}
