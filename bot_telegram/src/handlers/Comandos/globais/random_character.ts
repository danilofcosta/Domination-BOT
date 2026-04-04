import type { MyContext } from "../../../utils/customTypes.js";
import { RandomCharacter } from "../../../utils/randomCharacter.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { create_caption } from "../../../utils/create_caption.js";

export async function Ramdon_Character_Handler(ctx: MyContext) {
  console.log("random charater");
  try {
    const Random_Character = await RandomCharacter(ctx.session.settings.genero);

    if (!Random_Character) return ctx.reply(ctx.t("random-character-error"));

    const capiton = create_caption({
      ctx: ctx,
      character: Random_Character,
      chatType: ctx.session.settings.genero,
      noformat: false,
    });
    // console.log(capiton);
  return  Sendmedia({ ctx: ctx, per: Random_Character, caption: capiton });

  } catch (error) {
    console.log(error);
    ctx.reply(ctx.t("random-character-error"));
  }
}
