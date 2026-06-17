import { SetGiftUser } from "../../../cache/cache.js";
import { bts_yes_or_no, CreateOneBtn } from "../../../utils/btns.js";
import {
  BTN_TYPE,
  ChatType,
  type MyContext,
} from "../../../utils/customTypes.js";
import { findCollectionWithIncludes } from "../../../utils/collectionUtils.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { info, warn, error, debug } from "../../../utils/log.js";
import { ComandosUser } from "../../../commands/User.js";
import { mentionUser } from "../../../utils/mention_user.js";
import { Extract_id_user } from "../../../utils/extract_id_user.js";

export async function giftHandler(ctx: MyContext) {

  const mentionedUser = await  Extract_id_user(ctx)




  if (!ctx.message?.reply_to_message && !mentionedUser) {
    await Sendmedia({
      ctx,
      caption: ctx.t("gift_reply_instruction", {
        command: ComandosUser.gift.command,
      }),
    });
    return;
  }
 

  if (!mentionedUser?.id) {
    warn(`giftHandler - usuário inválido`, { userId: ctx.from?.id });

    await Sendmedia({
      ctx,
      caption: ctx.t("error-gift-invalid-user"),
    });
    return;
  }

  if (mentionedUser.id === ctx.from?.id) {
    warn(`giftHandler - tentativa de auto-presente`, { userId: ctx.from?.id });

    await Sendmedia({
      ctx,
      caption: ctx.t("error-gift-self"),
    });
    return;
  }
  if (mentionedUser.id === ctx.me?.id) {
    warn(`giftHandler - tentativa de presente ao bot`, {
      userId: ctx.from?.id,
    });

    await Sendmedia({
      ctx,
      caption: ctx.t("error-gift-bot"),
    });
    return;
  }
let _text = ctx.message?.text || "";

if (ctx.message?.entities) {
  const entities = [...ctx.message.entities]
    .sort((a, b) => b.offset - a.offset);

  for (const entity of entities) {
    switch (entity.type) {
      case "mention":
      case "bot_command":
      case "text_mention":
      case "custom_emoji":
      case "code":
      case "blockquote":
        _text =
          _text.slice(0, entity.offset) +
          _text.slice(entity.offset + entity.length);

        break;
    }
  }
}

const giftid = Number(_text.trim());


  if (!giftid || isNaN(giftid)) {
    warn(`giftHandler - ID inválido`, { userId: ctx.from?.id, giftid });

    const btn = CreateOneBtn({
      text: `${mentionedUser?.first_name} -- >`,
      icon: "5359664288241829619",
      callback: `select_gift_to_${mentionedUser?.id}`,
      typeBtn: BTN_TYPE.switch_inline_query_current_chat,
    });

    await Sendmedia({
      ctx,
      caption: ctx.t("error-gift-not-id"),
      reply_markup: btn,
    });

    return;
  }

  const mention = mentionUser(mentionedUser.first_name, mentionedUser.id);
  info(`giftHandler - enviando presente`, {
    senderId: ctx.from?.id,
    receiverId: mentionedUser.id,
    giftid,
  });

  const GiftCharacter = await findCollectionWithIncludes({
    isWaifu: ctx.botType === ChatType.WAIFU,
    telegramId: ctx.from!.id,
    characterId: giftid,
  });

  if (!GiftCharacter) {
    warn(`giftHandler - personagem não encontrado na coleção`, {
      userId: ctx.from?.id,
      giftid,
    });

    await Sendmedia({
      ctx,
      caption: ctx.t("fav-not-found", {
        genero: ctx.botType.toLowerCase(),
      }),
    });
    return;
  }

  const characterData =
    ctx.botType === ChatType.WAIFU
      ? (GiftCharacter as any).CharacterWaifu
      : (GiftCharacter as any).CharacterHusbando;

  const text = await ctx.t("gift_confirmation_message", {
    username: mention,
    character_name: characterData.name,
    character_anime: characterData.origem,
  });

  const reply_markup = bts_yes_or_no(
    ctx,
    `gift_yes_${giftid}_${mentionedUser.id}_${ctx.from?.id}`,
    `gift_no_${giftid}_${mentionedUser.id}_${ctx.from?.id}`,
  );
  SetGiftUser(mentionedUser.id, {
    fromuser: mentionedUser,
  });

  try {
    await Sendmedia({
      ctx,
      per: characterData,
      caption: text,
      reply_markup,
    });
  } catch (e) {
    error(`giftHandler - erro ao enviar mídia`, e);
  }
}
