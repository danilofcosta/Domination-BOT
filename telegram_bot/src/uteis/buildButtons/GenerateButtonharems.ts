import { InlineKeyboard } from "grammy";
import type { MyContext } from "../CustomTypes.js";

interface BuildHaremButtonsParams {
  ctx: MyContext;
  userId: number;
  current_page: number;
  total_page: number;
  nextJump?: number;
  isadmin?: boolean;
  canDelete?: boolean;
}

export function Build_btn_harem({
  ctx,
  userId,
  current_page,
  total_page,
  nextJump,
  isadmin = false
}: BuildHaremButtonsParams) {
  const totalPages = total_page || 1;
  const btn_prev = `harem_user_${userId}_prev_${current_page}`;
  const btn_next = `harem_user_${userId}_next_${current_page}`;

  const keyboard = InlineKeyboard.from([
    [
      { text: ctx.t("harem_btn_prev_page"), callback_data: btn_prev },
      {
        text: ctx.t("harem_btn_current_page", {
          currentpage: String(current_page + 1),
          totalpages: String(totalPages),
        }),
        callback_data: `harem_user_${userId}_page`,
      },
      { text: ctx.t("harem_btn_next_page"), callback_data: btn_next },
    ],
    [
      { text: ctx.t("harem_btn_inline_query"), switch_inline_query_current_chat: `harem_user_${userId}` },
      {
        text: ctx.t("harem_btn_fast_page"),
        callback_data: `harem_user_${userId}_jump_${current_page}_${nextJump ?? ""}`,
      },
    ],
    [
      {
        text: ctx.t("harem_btn_web_app"),
        url: process.env.WEBAPP || `https://t.me/${ctx.me.username}?startgroup=true`,
      },
    ],
    [
      { text: ctx.t("harem_btn_setup"), callback_data: `harem_btn_${userId}_opensetup` },
      { text: ctx.t("harem_btn_close"), callback_data: `harem_user_${userId}_close` },
    ],
  ]);

  if ( isadmin) {
    keyboard.inline_keyboard.push([
      { text: ctx.t("harem_btn_delete"), callback_data: `harem_user_${userId}_delete` },
    ]);
  }

  return keyboard;
}
