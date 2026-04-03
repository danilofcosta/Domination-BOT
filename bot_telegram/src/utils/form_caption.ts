import { type MyContext } from "./customTypes.js";
import { extractListEmojisCharacter } from "./extractListEmojisCharacter.js";
import { ChatType, type Character } from "./types.js";

export async function createSecretCaption(
  ctx: MyContext,
  character?: Character,
) {
  if (!character) return "";

  const {emoji_event, emoji_raridade }= extractListEmojisCharacter(ctx, character);

  // ✅ operador ternário no lugar do "if ... else"
  const generoTexto =
    ctx.session.settings.genero === ChatType.HUSBANDO
      ? "Um husbando"
      : "Uma waifu";

  // Criar a legenda usando i18n
  const txr = ctx.t("new_character_secret_caption", {
    emoji_raridade:
      emoji_raridade.length > 1
        ? `[${emoji_raridade.join(", ")}]`
        : (emoji_raridade[0] ?? ""),
    charater_genero: generoTexto,
  });

  return txr;
}
