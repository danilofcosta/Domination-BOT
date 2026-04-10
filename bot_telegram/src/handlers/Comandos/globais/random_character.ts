import type { MyContext } from "../../../utils/customTypes.js";
import { RandomCharacter } from "../../../utils/chareter/randomCharacter.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { create_caption } from "../../../utils/manege_caption/create_caption.js";

export async function Ramdon_Character_Handler(ctx: MyContext) {
  console.log("random charater", ctx.session.settings.genero, process.env.TYPE_BOT);
  try {
    const tipoBot = process.env.TYPE_BOT;
    if (!tipoBot) return ctx.reply(ctx.t("random-character-error"));
    
    const Random_Character = await RandomCharacter(tipoBot as any);

    if (!Random_Character) return ctx.reply(ctx.t("random-character-error"));

    const capiton = create_caption({
      ctx: ctx,
      character: Random_Character,
      chatType: ctx.session.settings.genero,
      noformat: false,
    });
    // console.log(capiton);
    return Sendmedia({ ctx: ctx, per: Random_Character, caption: capiton });
  } catch (error) {
    console.log(error);
    ctx.reply(ctx.t("random-character-error"));
  }
}
