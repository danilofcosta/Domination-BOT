import { getCharacter } from "../../../../../cache/cache.js";
import type { MyContext } from "../../../../../utils/customTypes.js";
import { addCharacter_edit_CallbackData } from "./add_character_edit.js";
import { confirmCharacterAdd } from "./add_charecter_callback_data.js";

export async function handleEditMenuCallback(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;

  const data = ctx.callbackQuery.data;

  const matchNome = data.match(/^edit_character_edit_nome_(\d+)$/);
  if (matchNome) {
    const id = matchNome[1];
    const character = getCharacter(Number(id));
    if (!character) {
      await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
      return;
    }
    ctx.session.adminSetup = { action: "edit_nome", targetId: id };
    await ctx.reply(ctx.t("edit_character_prompt_nome", { current: character.nome }), {
      parse_mode: "HTML",
      reply_markup: { force_reply: true },
    });
    await ctx.answerCallbackQuery();
    return;
  }

  const matchAnime = data.match(/^edit_character_edit_anime_(\d+)$/);
  if (matchAnime) {
    const id = matchAnime[1];
    const character = getCharacter(Number(id));
    if (!character) {
      await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
      return;
    }
    ctx.session.adminSetup = { action: "edit_anime", targetId: id };
    await ctx.reply(ctx.t("edit_character_prompt_anime", { current: character.anime }), {
      parse_mode: "HTML",
      reply_markup: { force_reply: true },
    });
    await ctx.answerCallbackQuery();
    return;
  }

  const matchEvents = data.match(/^edit_character_edit_events_(\d+)_(\d+)$/);
  if (matchEvents) {
    const id = matchEvents[1];
    const character = getCharacter(Number(id));
    if (!character) {
      await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
      return;
    }
    ctx.session.adminSetup = { action: "edit_events", targetId: id };
    await ctx.reply(ctx.t("edit_character_prompt_events", { current: character.events?.join(", ") || ctx.t("add-char-default-event") }), {
      parse_mode: "HTML",
      reply_markup: { force_reply: true },
    });
    await ctx.answerCallbackQuery();
    return;
  }

  const matchRarities = data.match(/^edit_character_edit_rarities_(\d+)_(\d+)$/);
  if (matchRarities) {
    const id = matchRarities[1];
    const character = getCharacter(Number(id));
    if (!character) {
      await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
      return;
    }
    ctx.session.adminSetup = { action: "edit_rarities", targetId: id };
    await ctx.reply(ctx.t("edit_character_prompt_rarities", { current: character.rarities?.join(", ") || ctx.t("add-char-default-value") }), {
      parse_mode: "HTML",
      reply_markup: { force_reply: true },
    });
    await ctx.answerCallbackQuery();
    return;
  }

  const matchConfirm = data.match(/^edit_character_edit_confirm_(\d+)$/);
  if (matchConfirm) {
    const id = matchConfirm[1];
    await confirmCharacterAdd(ctx, Number(id));
    return;
  }
}
