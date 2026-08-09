import { InlineKeyboard } from "grammy";
import type { MyContext } from "../customTypes.js";

export function createButtonsTopGlobal(ctx: MyContext): InlineKeyboard {
  return new InlineKeyboard()
    .text(ctx.t("top_user_btn_my_position"), "topuser_position_global")
    .row()
    .text(ctx.t("top_user_btn_chat"), "topuser_chat")
    .text(ctx.t("top_user_btn_grupos"), "topuser_grupos")
    .row()
    .text(ctx.t("top_btn_close"), "topuser_close");
}

export function createButtonsTopChat(ctx: MyContext): InlineKeyboard {
  return new InlineKeyboard()
    .text(ctx.t("top_user_btn_my_position"), "topuser_position_chat")
    .row()
    .text(ctx.t("top_user_btn_global"), "topuser_global")
    .text(ctx.t("top_user_btn_grupos"), "topuser_grupos")
    .row()
    .text(ctx.t("top_btn_close"), "topuser_close");
}

export function createButtonsTopGrupos(ctx: MyContext): InlineKeyboard {
  return new InlineKeyboard()
    .text(ctx.t("top_user_btn_my_position"), "topuser_position_grupos")
    .row()
    .text(ctx.t("top_user_btn_global"), "topuser_global")
    .text(ctx.t("top_user_btn_chat"), "topuser_chat")
    .row()
    .text(ctx.t("top_btn_close"), "topuser_close");
}
