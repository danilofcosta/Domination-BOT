import { ChatType, type MyContext } from "../../../uteis/CustomTypes.js";
import { error, info, warn } from "../../../uteis/log.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";
import {
  BTN_TYPE,
  CreateOneBtn,
} from "../../../uteis/buildButtons/createOneButton.js";
import { CreateButtunConfirmation } from "../../../uteis/buildButtons/createButtonConfirmation.js";
import { create_caption } from "../../../uteis/buildCapion/create_caption.js";
import { findCollectionWithIncludes } from "../../../uteis/extras/collectionUtils.js";

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

    return SendMensageCustom({
      ctx,
      caption: ctx.t("error-fav-not-id"),
      reply_markup: btn,
    });
  }

  const userId = ctx.from?.id;
  if (!userId) {
    warn("favHandler - usuário não identificado");
    return SendMensageCustom({
      ctx,
      caption: ctx.t("error-user-not-found"),
    });
  }

  info("favHandler - buscando personagem", { userId, favid });

  const character = await findCollectionWithIncludes({
    isWaifu: ctx.botType === ChatType.WAIFU,
    telegramId: userId,
    characterId: favid,
  });

  if (!character) {
    warn("favHandler - personagem não encontrado na coleção", {
      userId,
      favid,
    });

    return SendMensageCustom({
      ctx,
      caption: ctx.t("fav-not-found", {
        genero: ctx.botType.toLowerCase(),
      }),
    });
  }

  const charData: any =
    ctx.botType === ChatType.WAIFU
      ? (character as any).CharacterWaifu
      : (character as any).CharacterHusbando;

  const characterCaption = create_caption({
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
    await SendMensageCustom({
      ctx,
      character: charData,
      caption: `<b>${ctx.t("fav-character-confirm")}</b>\n\n${characterCaption}`,
      reply_markup,
    });
  } catch (e) {
    error("favHandler - erro ao enviar mídia", e);
  }
}
