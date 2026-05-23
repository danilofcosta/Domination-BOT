import { getCharacter } from "../../../../../cache/cache.js";
import type { MyContext, PreCharacter } from "../../../../../utils/customTypes.js";

export async function addCharacter_edit_CallbackData(
  ctx: MyContext,
  id_cached: string | undefined,
) {
  console.log("Callback data:", id_cached);
  const character: PreCharacter | undefined = getCharacter(Number(id_cached));
  if (!character) {
    await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
    return;
  }

  const caption = ctx.t("edit_character_edit_caption", {
    nome: character.nome,
    anime: character.anime,
    genero: character.events ? "Husbando" : "Waifu",
    rarities: character.rarities?.length
      ? character.rarities.join(", ")
      : "valor padrao",
    events: character.events?.length
      ? character.events.join(", ")
      : "sem evento ",
    mediatype: character.mediatype,
    media: character.media,
  });
  // add text no local
  const inline_keyboard = [
    [
      {
        text: ctx.t("add_character_edit_btn_nome"),
        callback_data: `edit_character_edit_nome_${id_cached}`,
      },
      {
        text: ctx.t("add_character_edit_btn_anime"),
        callback_data: `edit_character_edit_anime_${id_cached}`,
      },
    ],
    [
      {
        text: ctx.t("add_character_edit_btn_events"),
        callback_data: `edit_character_edit_events_${id_cached}_1`,
      },
      {
        text: ctx.t("add_character_edit_btn_rarities"),
        callback_data: `edit_character_edit_rarities_${id_cached}_1`,
      },
    ],
    [
      {
        text: ctx.t("add_character_edit_btn_confirm"),
        callback_data: `edit_character_edit_confirm_${id_cached}`,
      },
    ],
  ];

  if (ctx.callbackQuery) {
    await ctx
      .editMessageText(caption, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard,
        },
      })
      .catch(() => {});
  } else {
    await ctx.reply(caption, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard,
      },
    });
  }
}
