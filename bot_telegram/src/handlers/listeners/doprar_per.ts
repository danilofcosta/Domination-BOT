import { type MyContext } from "../../utils/customTypes.js";
import { Sendmedia } from "../../utils/sendmedia.js";
import { createSecretCaption } from "../../utils/manage_captures/form_caption.js";
import { RandomCharacter } from "../../utils/character/random_character.js";
import { info, warn, error, debug } from "../../utils/log.js";
import { getRuntime } from "../../runtime/groupRuntime.js";

export async function DropCharacter(ctx: MyContext): Promise<boolean | null> {
  info(`DropCharacter - drop iniciado`, {
    chatId: ctx.chat?.id,
    genero: ctx.session.settings.genero,
  });

  const character = await RandomCharacter(ctx.session.settings.genero);
  if (!character) {
    warn(`DropCharacter - nenhum personagem disponível`, {
      chatId: ctx.chat?.id,
    });
    return null;
  }

  debug(`DropCharacter - personagem selecionado`, {
    charId: character.id,
    charName: character.name,
  });

  const caption = await createSecretCaption(ctx, character);

  try {
    const message = await Sendmedia({
      ctx,
      per: character,
      caption,
    });

    if (!message) {
      error(`DropCharacter - Sendmedia retornou null`, {
        chatId: ctx.chat?.id,
      });
      return null;
    }

    info(`DropCharacter - personagem dropado com sucesso`, {
      chatId: ctx.chat?.id,
      messageId: message.message_id,
      charId: character.id,
      charName: character.name,
    });

    if (!ctx.chat?.id) return null;
    const runtime = getRuntime(ctx.chat.id);
    runtime.dropId = message.message_id;
    runtime.cont = 100;
    runtime.characterId = character.id;
    runtime.data = message.date;
    return true;
  } catch (e) {
    error(`DropCharacter - erro ao enviar mídia`, e);
    return null;
  }
}
