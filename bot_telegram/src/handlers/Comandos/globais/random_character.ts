import type { MyContext } from "../../../utils/customTypes.js";
import { RandomCharacter } from "../../../utils/chareter/randomCharacter.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { create_caption } from "../../../utils/manege_caption/create_caption.js";
import { info, warn, error, debug } from "../../../utils/log.js";

export async function Ramdon_Character_Handler(ctx: MyContext) {
  info(`Ramdon_Character_Handler - buscando personagem aleatório`, { userId: ctx.from?.id });
  
  try {
    const tipoBot = process.env.TYPE_BOT;
    if (!tipoBot) {
      warn(`Ramdon_Character_Handler - TYPE_BOT não definido`);
      return ctx.reply(ctx.t("random-character-error"));
    }
    
    const Random_Character = await RandomCharacter(tipoBot as any);

    if (!Random_Character) {
      warn(`Ramdon_Character_Handler - nenhum personagem encontrado`);
      return ctx.reply(ctx.t("random-character-error"));
    }

    debug(`Ramdon_Character_Handler - personagem encontrado`, { charId: Random_Character.id, charName: Random_Character.name });

    const capiton = create_caption({
      ctx: ctx,
      character: Random_Character,
      chatType: ctx.session.settings.genero,
      noformat: false,
    });

    try {
      return Sendmedia({ ctx: ctx, per: Random_Character, caption: capiton });
    } catch (e) {
      error(`Ramdon_Character_Handler - erro ao enviar mídia`, e);
      return ctx.reply(ctx.t("random-character-error"));
    }
  } catch (e) {
    error(`Ramdon_Character_Handler - erro geral`, e);
    ctx.reply(ctx.t("random-character-error"));
  }
}
