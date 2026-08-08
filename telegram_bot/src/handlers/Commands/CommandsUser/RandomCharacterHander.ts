import type { MyContext } from "../../../uteis/CustomTypes.js";
import { RandomCharacter } from "../../../uteis/extras/randomCharacter.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";
import { create_caption } from "../../../uteis/buildCapion/create_caption.js";
import { error, info, warn } from "../../../uteis/log.js";
import { GetCharacterById } from "../../../uteis/extras/GetCharacterById.js";

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
        const character = await GetCharacterById(ctx.botType, id, !noCache);
        if (character) {
          const caption = create_caption({
            t: ctx.t,
            character,
            chatType: ctx.botType,
          });
          return SendMensageCustom({ ctx, character, caption });
        }
        warn("RandomCharacterHandler - personagem não encontrado", { id });
        return SendMensageCustom({ ctx, caption: ctx.t("error-character-not-found") });
      }
    }

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
