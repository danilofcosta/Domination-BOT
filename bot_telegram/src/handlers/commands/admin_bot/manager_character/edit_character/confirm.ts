import { getCharacter } from "../../../../../cache/cache.js";
import type { MyContext } from "../../../../../utils/customTypes.js";
import { updateCharacter } from "../services/character.service.js";
import { error as logError } from "../../../../../utils/log.js";

export async function confirmCharacterEdit(ctx: MyContext, charId: number) {
  const character = getCharacter(charId);
  if (!character) {
    await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
    return;
  }

  const editId = character.editId;
  if (!editId) {
    await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
    return;
  }

  try {
    await updateCharacter(editId, character.genero, {
      nome: character.nome,
      anime: character.anime,
      mediatype: character.mediatype,
      media: character.media,
      mediaUniqueId: character.mediaUniqueId,
      rarities: character.rarities,
      events: character.events,
      addby: ctx.from as any,
    });

    await ctx.deleteMessage().catch(() => {});
    await ctx.reply(ctx.t("edit-char-success"));
  } catch (error: any) {
    logError("confirmCharacterEdit error", error);
    if (error?.code === "P2002" && error?.meta?.target?.includes?.("mediaUniqueId")) {
      await ctx.answerCallbackQuery(ctx.t("add-char-error-media-unique"));
      return;
    }
    await ctx.answerCallbackQuery(ctx.t("add-char-save-error"));
  }
}
