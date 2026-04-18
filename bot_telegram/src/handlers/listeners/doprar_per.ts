import { type MyContext } from "../../utils/customTypes.js";
import { Sendmedia } from "../../utils/sendmedia.js";
import { createSecretCaption } from "../../utils/manege_caption/form_caption.js";
import { RandomCharacter } from "../../utils/chareter/randomCharacter.js";
import type { Character } from "../../utils/customTypes.ts";
import { info, warn, error, debug } from "../../utils/log.js";

export async function DropCharacter(ctx: MyContext): Promise<boolean | null> {
  info(`DropCharacter - drop iniciado`, { chatId: ctx.chat?.id, genero: ctx.session.settings.genero });

  const character = await RandomCharacter(ctx.session.settings.genero);
  if (!character) {
    warn(`DropCharacter - nenhum personagem disponível`, { chatId: ctx.chat?.id });
    return null;
  }

  debug(`DropCharacter - personagem selecionado`, { charId: character.id, charName: character.name });

  const caption = await createSecretCaption(ctx, character);
  
  try {
    const message = await Sendmedia({
      ctx,
      per: character,
      caption,
    });

    if (!message) {
      error(`DropCharacter - Sendmedia retornou null`, { chatId: ctx.chat?.id });
      return null;
    }

    info(`DropCharacter - personagem dropado com sucesso`, {
      chatId: ctx.chat?.id,
      messageId: message.message_id,
      charId: character.id,
      charName: character.name
    });

    const grupo = ctx.session.grupo;
    grupo.dropId = message.message_id;
   grupo.cont = 100;
    grupo.character = character;
    grupo.data = message.date
    grupo.title = ctx.chat?.title || "";
    return true;
  } catch (e) {
    error(`DropCharacter - erro ao enviar mídia`, e);
    return null;
  }
}
