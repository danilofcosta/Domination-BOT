import { InlineKeyboard } from "grammy";
import type { MyContext } from "./customTypes.js";

export function bts_yes_or_no(ctx:MyContext, yes: string, no: string): InlineKeyboard {
  return new InlineKeyboard()
            .text(ctx.t("btn-yes"), yes, )   // texto e callback data"btn1")   // texto e callback data
            .text(ctx.t("btn-no"), no);
    
}
