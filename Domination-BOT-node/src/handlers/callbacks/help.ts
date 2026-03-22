import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../utils/customTypes.js";

export  function Help(ctx: MyContext) {

const reply_markup = new InlineKeyboard().text(ctx.t("btn-close"), "close");



ctx.editMessageText(ctx.t("help-caption"), { parse_mode: "HTML" });
    
}