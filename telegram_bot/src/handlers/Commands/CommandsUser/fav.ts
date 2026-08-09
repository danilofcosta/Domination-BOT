import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { error, info, warn } from "../../../utils/log.js";
import { sendMessageCustom } from "../../../utils/sendMessageCustom.js";
import {
  BTN_TYPE,
  CreateOneBtn,
} from "../../../utils/buildButtons/createOneButton.js";
import { CreateButtunConfirmation } from "../../../utils/buildButtons/createButtonConfirmation.js";
import { createCaption } from "../../../utils/buildCaption/createCaption.js";
import { findCollectionWithIncludes } from "../../../utils/extras/collectionUtils.js";

export async function favHandler(ctx: MyContext) {
  let favid: number | undefined;

  if (ctx.match) {
    favid = Number(ctx.match);
  }

  if (!favid && ctx.message?.reply_to_message) {
    const text =
      ctx.message.reply_to_message.text ||
      ctx.message.reply_to_message.caption ||
      "";
    const match = text.match(/\d+/);
    if (match) favid = Number(match[0]);
  }

  if (!favid || isNaN(favid)) {
    warn("favHandler - ID inválido", { userId: ctx.from?.id, favid });

    const btn = CreateOneBtn({
      text: ctx.t("fav-btn-select"),
      callback: "select_my_fav",
      typeBtn: BTN_TYPE.switch_inline_query_current_chat,
    });

    return sendMessageCustom({
      ctx,
      caption: ctx.t("error-fav-not-id"),
      reply_markup: btn,
    });
  }

  const userId = ctx.from?.id;
  if (!userId) {
    warn("favHandler - usuário não identificado");
    return sendMessageCustom({
      ctx,
      caption: ctx.t("error-user-not-found"),
    });
  }

  info("favHandler - buscando personagem", { userId, favid });

  const character = await findCollectionWithIncludes({
    telegramId: userId,
    characterId: favid,
  });

  if (!character) {
    warn("favHandler - personagem não encontrado na coleção", {
      userId,
      favid,
    });

    return sendMessageCustom({
      ctx,
      caption: ctx.t("fav-not-found", {
        genero: ctx.botType.toLowerCase(),
      }),
    });
  }

  const charData: any = (character as any).Character;

  const characterCaption = createCaption({
    t: ctx.t,
    chatType: ctx.botType,
    character: charData,
    ...(ctx.from?.first_name ? { username: ctx.from.first_name } : {}),
    ...(ctx.from?.id ? { user_id: ctx.from.id } : {}),
    rawEmoji: false,
  });

  const reply_markup = CreateButtunConfirmation(
    ctx,
    `fav_yes_${favid}_${userId}`,
    `fav_no_${favid}_${userId}`,
  );

  try {
    await sendMessageCustom({
      ctx,
      character: charData,
      caption: `<b>${ctx.t("fav-character-confirm")}</b>\n\n${characterCaption}`,
      reply_markup,
    });
  } catch (e) {
    error("favHandler - erro ao enviar mídia", e);
  }
}
