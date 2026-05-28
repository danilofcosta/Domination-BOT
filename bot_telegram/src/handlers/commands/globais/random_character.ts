import type { MyContext } from "../../../utils/customTypes.js";
import { RandomCharacter } from "../../../utils/character/random_character.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { create_caption } from "../../../utils/manage_captures/create_caption.js";
import { info, warn, error, debug } from "../../../utils/log.js";
import { bts_yes_or_no } from "../../../utils/btns.js";

export async function Ramdon_Character_Handler(ctx: MyContext) {
  info(`Ramdon_Character_Handler - buscando personagem aleatório`, {
    userId: ctx.from?.id,
  });

  try {
    const tipoBot = process.env.TYPE_BOT;
    if (!tipoBot) {
      warn(`Ramdon_Character_Handler - TYPE_BOT não definido`);
      return await Sendmedia({
        ctx,
        caption: ctx.t("random-character-error"),
      });
    }

    const Random_Character = await RandomCharacter(tipoBot as any);

    if (!Random_Character) {
      warn(`Ramdon_Character_Handler - nenhum personagem encontrado`);
      return await Sendmedia({
        ctx,
        caption: ctx.t("random-character-error"),
      });
    }

    debug(`Ramdon_Character_Handler - personagem encontrado`, {
      charId: Random_Character.id,
      charName: Random_Character.name,
    });

    const capiton = create_caption({
      t: ctx.t,
      character: Random_Character,
      chatType: ctx.botType,
      noformat: false,
    });

    const userSufix = ctx.from?.id ?? "0";
    const reply_markup = bts_yes_or_no(
      ctx,
      `random-character-yes-${Random_Character.id}-${userSufix}`,
      `random-character-no-${Random_Character.id}-${userSufix}`,
      Random_Character.likes.toString(),
      Random_Character.dislikes.toString(),
      "5289772607556568230",
      "5318868949402667784",
    );

    try {
      return Sendmedia({
        ctx: ctx,
        per: Random_Character,
        caption: capiton,
        reply_markup,
      });
    } catch (e) {
      error(`Ramdon_Character_Handler - erro ao enviar mídia`, e);
      return await Sendmedia({
        ctx,
        caption: ctx.t("random-character-error"),
      });
    }
  } catch (e) {
    error(`Ramdon_Character_Handler - erro geral`, e);
    return await Sendmedia({
      ctx,
      caption: ctx.t("random-character-error"),
    });
  }
}
