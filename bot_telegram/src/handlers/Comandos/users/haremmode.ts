import { InlineKeyboard } from "grammy";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { prisma } from "../../../lib/prisma.js";
import { LastRandomCharacter } from "../../../utils/chareter/randomCharacter.js";
import { Sendmedia } from "../../../utils/sendmedia.js";



export async function HaremmodeHandler(ctx: MyContext) {
   const character = await LastRandomCharacter(
     ctx
     .session.settings.genero || process.env.TYPE_BOT,
   );
 
   let currentMode = "default";
   if (ctx.from?.id) {
       const user = await prisma.user.findUnique({ where: { telegramId: BigInt(ctx.from.id) } });
       if (user) {
           const isHusbando = ctx.session.settings.genero === ChatType.HUSBANDO;
           const config = isHusbando ? (user.husbandoConfig as any) || {} : (user.waifuConfig as any) || {};
           currentMode = config.haremMode || "default";
       }
   }

  const keyboard = new InlineKeyboard()
    .text(`${currentMode === "default" || !currentMode ? "✅ " : ""}${ctx.t("haremmode-default")}`, "haremmode_default")
    
    .text(`${currentMode === "latest" || !currentMode ? "✅ " : ""}${ctx.t("haremmode-recent")}`, "haremmode_latest")
    .row()
    .text(`${currentMode === "rarity" ? "✅ " : ""}${ctx.t("haremmode-rarity")}`, "haremmode_rarity")
    
    .text(`${currentMode === "event" ? "✅ " : ""}${ctx.t("haremmode-event")}`, "haremmode_event")
    .row()
    .text(await ctx.t("btn-close"), "close");

await Sendmedia({
  ctx: ctx,
  per: character,
  caption: ctx.t("haremmode-caption"),
  reply_markup: keyboard,


})
}
