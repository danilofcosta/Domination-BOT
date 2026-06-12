import { InlineKeyboard, Keyboard } from "grammy";
import { BTN_TYPE, type MyContext } from "./customTypes.js";
import type { BTN_STYLE, CreateOneBtnOptions } from "./customTypes.js";
import {
  Harem_setup_dict,
  type HaremBtn,
  type HaremSetupDict,
} from "../handlers/callbacks/users_callback/harem_setup/build.js";

//controi bts com a letras do alfabeto
export function buildLetterKeyboard(cacheKey: string) {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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
//controi  btn callback com  colunas de 3

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
// controi 2 btns para confimação sim ou não personalizado com cor e icon(emoji animado) necessario emoji id
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
//controi apenas um btn
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

// controi os btns do harem do user
export function Build_btn_harem({
  ctx,
  userId,
  current_page,
  total_page,
  nextJump,
  isadmin = false,
  canDelete = false,
}: {
  ctx: any;
  userId: number | string;
  current_page: number;
  total_page: number;
  nextJump?: number;
  isadmin?: boolean;
  canDelete?: boolean;
}) {
  const totalPages = total_page || 1;

  const btn_prev = `harem_user_${userId}_prev_${current_page}`;
  const btn_next = `harem_user_${userId}_next_${current_page}`;

  const reply_markup = new InlineKeyboard()
    .text(ctx.t("harem_btn_prev_page"), btn_prev)
    .text(
      ctx.t("harem_btn_current_page", {
        currentpage: current_page + 1,
        totalpages: totalPages,
      }),
      `harem_user_${userId}_page`,
    )
    .text(ctx.t("harem_btn_next_page"), btn_next)
    .row()
    .switchInlineCurrent(
      // ctx.t("harem_btn_inline_query"),
      "    ",
      `harem_user_${userId}`,
    )
    .icon("5447410659077661506")
    .text(
      // ctx.t("harem_btn_fast_page"),
      "   ²",
      `harem_user_${userId}_jump_${current_page}_${nextJump ?? ""}`,
    )
    .icon("5400363978159323684")
    .row()
    .url(
      ctx.t("harem_btn_web_app"),
      process.env.WEBAPP || `https://t.me/${ctx.me.username}?startgroup=true`,
    )
    .row()
    .text("     ", `harem_btn_${userId}_opensetup`)
    .icon("5170358089932605403")
    .text(
      // ctx.t("harem_btn_close"),
      "     ",
      `harem_user_${userId}_close`,
    )
    .icon("5372825386591732174")
    .style("danger");
    
    if (canDelete) {
      reply_markup
        .row()
        .text(ctx.t("harem_btn_delete"), `harem_user_${userId}_delete`)
        .style("danger");
    }

  return reply_markup;
}

//controi btn no teclado do user
function addButton(keyboard: Keyboard, btn: HaremBtn) {
  return keyboard.text(btn.text, btn.style).icon(btn.icon ?? undefined);
}

export function Build_btn_Keyboard(data: Record<string, HaremBtn>) {
  const keyboard = new Keyboard();
  let count = 0;

  for (const key in data) {
    addButton(keyboard, data[key]);
    count++;

    if (count % 2 === 0) {
      keyboard.row();
    }
  }

  addButton(keyboard, Harem_setup_dict.close);

  return keyboard.resized();
}
