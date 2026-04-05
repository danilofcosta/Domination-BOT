import { type MyContext } from "../../utils/customTypes.js";
import { Sendmedia } from "../../utils/sendmedia.js";
import { createSecretCaption } from "../../utils/form_caption.js";
import { RandomCharacter } from "../../utils/randomCharacter.js";
import type { Character } from "../../utils/types.js";

export async function DropCharacter(
  ctx: MyContext,
): Promise<boolean | null> {
  const character = await RandomCharacter(ctx.session.settings.genero);
  if (!character) return null;

  const caption = await createSecretCaption(ctx, character);
  console.log(character.name);
  const message = await Sendmedia({
    ctx,
    per: character,
    caption,
  });

  if (!message) return null;

  const grupo = ctx.session.grupo;
  grupo.dropId = message.message_id;
  grupo.character = character;
  grupo.data = new Date();

  return true
}
