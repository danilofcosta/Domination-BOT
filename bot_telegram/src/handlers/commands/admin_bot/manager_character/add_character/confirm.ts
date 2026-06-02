import { getCharacter } from "../../../../../cache/cache.js";
import type { MyContext } from "../../../../../utils/customTypes.js";
import { mentionUser } from "../../../../../utils/mention_user.js";
import { Sendmedia } from "../../../../../utils/sendmedia.js";
import { create_caption } from "../../../../../utils/manage_captures/create_caption.js";
import { createCharacter } from "../services/character.service.js";
import { error as logError } from "../../../../../utils/log.js";

export async function confirmCharacterAdd(ctx: MyContext, charId: number) {
  const character = getCharacter(charId);
  if (!character) {
    await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
    return;
  }

  try {
    const character_db = await createCharacter({
      nome: character.nome,
      anime: character.anime,
      genero: character.genero,
      mediatype: character.mediatype,
      media: character.media,
      mediaUniqueId: character.mediaUniqueId,
      rarities: character.rarities,
      events: character.events,
      addby: ctx.from as any,
    });

    if (!character_db) {
      return await Sendmedia({
        ctx,
        caption: ctx.t('error-add-character-db'),
      });
    }

    let caption = create_caption({
      character: character_db,
      chatType: character.genero,
      t: ctx.t,
      noformat: false,
    });

    caption += `\n\n${ctx.t("add_character_confirm", {
      usermention: mentionUser(
        character.username || "user",
        character.user_id || 0,
      ),
    })}`;

    await Sendmedia({
      ctx,

      chat_id: process.env.DATABASE_TELEGREM_ID,
      caption,
      per: character_db,
    });

    await ctx.deleteMessage().catch(() => {});
  } catch (error: any) {
    logError("confirmCharacterAdd error", error);
    if (error?.code === "P2002" && error?.meta?.target?.includes?.("mediaUniqueId")) {
      await ctx.answerCallbackQuery(ctx.t("add-char-error-media-unique"));
      return;
    }
    await ctx.answerCallbackQuery(ctx.t("add-char-save-error"));
  }
}
