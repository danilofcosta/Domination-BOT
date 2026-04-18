import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../../utils/customTypes.js";

export async function HaremmodeHandler(ctx: MyContext) {
  const keyboard = new InlineKeyboard()
    .text("Recentes (Latest)", "haremmode_latest")
    .row()
    .text("Por Raridade (Rarity)", "haremmode_rarity")
    .row()
    .text("Por Evento (Event)", "haremmode_event")
    .row()
    .text("Fechar", "close");

  await ctx.reply("Escolha como você deseja ver seu harém (agrupamento e ordenação):", {
    reply_markup: keyboard,
  });
}
