import { extrair_emojis } from "../handlers/inline_query/create_caption.js";
import { type MyContext } from "./customTypes.js";
import { ChatType, type Character } from "./types.js";

export async function createSecretCaption(
  ctx: MyContext,
  character?: Character,
) {
  if (!character) return "";

  const emoji_raridade = extrair_emojis((character as any).rarities ?? []);

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
