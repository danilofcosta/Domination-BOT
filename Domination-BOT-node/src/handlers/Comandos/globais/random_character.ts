import type { MyContext } from "../../../utils/customTypes.js";
import { RandomCharacter } from "../../../utils/randomCharacter.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { create_caption } from "../../inline_query/create_caption.js";

export async function Ramdon_Character(ctx: MyContext) {
  try {
    const Random_Character = await RandomCharacter(ctx.session.settings.genero);

    if (!Random_Character) return ctx.reply(ctx.t("random-character-error"));
    const capiton = create_caption({
      ctx: ctx,
      character: Random_Character,
      chatType: ctx.session.settings.genero ,
    noformat:true
   
    });
    console.log(capiton)
    Sendmedia({ ctx: ctx, per: Random_Character, caption: capiton });
  } catch (error) {
    console.log(error);
    ctx.reply(ctx.t("random-character-error"));
  }
}
