import type { MyContext } from "../../../utils/customTypes.js";
import { randomCharacter } from "../../../utils/extras/randomCharacter.js";
import { sendMessageCustom } from "../../../utils/sendMessageCustom.js";
import { createCaption } from "../../../utils/buildCaption/createCaption.js";
import { error, info, warn } from "../../../utils/log.js";
import { getCharacterById } from "../../../utils/extras/getCharacterById.js";

export async function RandomCharacterHandler(ctx: MyContext) {
  try {
    if (ctx.match) {
      const raw = String(ctx.match);
      const noCache = /(?:^|\s)nocache(?:\s|$)/i.test(raw);
      const idStr = raw.replace(/nocache/gi, "").trim();
      if (idStr !== "" && !isNaN(Number(idStr))) {
        const id = Number(idStr);
        info("RandomCharacterHandler - buscando personagem por id", {
          id,
          noCache,
        });
        const character = await getCharacterById(ctx.botType, id, !noCache);
        if (character) {
          const caption = createCaption({
            t: ctx.t,
            character,
            chatType: ctx.botType,
          });
          return sendMessageCustom({ ctx, character, caption });
        }
        warn("RandomCharacterHandler - personagem não encontrado", { id });
        return sendMessageCustom({ ctx, caption: ctx.t("error-character-not-found") });
      }
    }

    const character = await randomCharacter(ctx);
    if (!character) {
      warn("RandomCharacterHandler - nenhum personagem encontrado");
      await ctx.reply(ctx.t("error-character-not-found"));
      return;
    }

    const capiton = createCaption({
      t: ctx.t,
      character,
      chatType: ctx.botType,
    });

    await sendMessageCustom({ ctx, character, caption: capiton });
  } catch (e) {
    error("RandomCharacterHandler - erro geral", e);
    await ctx.reply(ctx.t("error-character-not-found"));
  }
}
