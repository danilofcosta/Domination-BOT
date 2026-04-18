import { InlineKeyboard } from "grammy";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { prisma } from "../../../../lib/prisma.js";
import { LastRandomCharacter } from "../../../utils/chareter/randomCharacter.js";
import { Sendmedia } from "../../../utils/sendmedia.js";

export async function HaremmodeHandler(ctx: MyContext) {
   const character = await LastRandomCharacter(
     ctx
     .session.settings.genero || process.env.TYPE_BOT,
   );
 
   let currentMode = "latest";
   if (ctx.from?.id) {
       const user = await prisma.user.findUnique({ where: { telegramId: BigInt(ctx.from.id) } });
       if (user) {
           const isHusbando = ctx.session.settings.genero === ChatType.HUSBANDO;
           const config = isHusbando ? (user.husbandoConfig as any) || {} : (user.waifuConfig as any) || {};
           currentMode = config.haremMode || "latest";
       }
   }

  const keyboard = new InlineKeyboard()
    .text(`${currentMode === "default" || !currentMode ? "✅ " : ""}Padrão`, "haremmode_default")
    
    .text(`${currentMode === "latest" || !currentMode ? "✅ " : ""}Recentes`, "haremmode_latest")
    .row()
    .text(`${currentMode === "rarity" ? "✅ " : ""}Por Raridade`, "haremmode_rarity")
    
    .text(`${currentMode === "event" ? "✅ " : ""}Por Evento`, "haremmode_event")
    .row()
    .text(ctx.t("close"), "close");

await  Sendmedia({
  ctx: ctx,
  per: character,
  caption: "Escolha como você deseja ver seu harém",
  reply_markup: keyboard,


})
}
