import { ChatType, type Character, type MyContext } from "../CustomTypes.js";
import { extractListEmojisCharacter } from "./extract_emojis.js";

export async function createSecretCaption(
  ctx: MyContext,
  character?: Character,
) {
  if (!character) return "";

  const { emoji_event, emoji_raridade } = extractListEmojisCharacter(character, false);

  const generoTexto = ctx.t(
    ctx.botType === ChatType.HUSBANDO
      ? "form-caption-gender-husbando"
      : "form-caption-gender-waifu");

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
