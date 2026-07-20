import type { MyContext } from "../../../uteis/CustomTypes.js";
import { RandomCharacter } from "../../../uteis/extras/randomCharacter.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";
import { create_caption } from "../../../uteis/buildCapion/create_caption.js";
import { error, warn } from "../../../uteis/log.js";

export async function RandomCharacterHandler(ctx: MyContext) {
  try {
    const character = await RandomCharacter(ctx);
    if (!character) {
      warn("RandomCharacterHandler - nenhum personagem encontrado");
      await ctx.reply(ctx.t("error-character-not-found"));
      return;
    }

    const capiton = create_caption({
      t: ctx.t,
      character,
      chatType: ctx.botType,
    });

    await SendMensageCustom({ ctx, character, caption: capiton });
  } catch (e) {
    error("RandomCharacterHandler - erro geral", e);
    await ctx.reply(ctx.t("error-character-not-found"));
  }
}
