import { userCommandsRegistryDict } from "../../../CommandsRegistry/CommandsRegistryUser.js";
import { ChatType, type MyContext } from "../../../uteis/CustomTypes.js";
import { error, warn } from "../../../uteis/log.js";
import { Extract_id_user } from "../../../uteis/uteis_telegram/extract_id_user.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";
import {
  BTN_TYPE,
  CreateOneBtn,
} from "../../../uteis/buildButtons/createOneButton.js";
import { CreateMentionUser } from "../../../uteis/uteis_telegram/CreateMentionUser.js";
import { findCollectionWithIncludes } from "../../../uteis/extras/collectionUtils.js";
import { CreateButtunConfirmation } from "../../../uteis/buildButtons/createButtonConfirmation.js";
import { create_caption } from "../../../uteis/buildCapion/create_caption.js";
import { extractNumbers } from "../../../uteis/remove num.js";

const giftCache = new Map<string, number[]>();

export function clearGiftCache(): void {
  giftCache.clear();
}

export async function GiftHandler(ctx: MyContext) {
  const mentionedUser = await Extract_id_user(ctx);

  if (!mentionedUser) {
    await SendMensageCustom({
      ctx,
      caption: ctx.t("gift_reply_instruction", {
        command: userCommandsRegistryDict.Gift!.command,
      }),
    });
    return;
  }

  if (mentionedUser.id === ctx.from?.id) {
    warn("giftHandler - tentativa de auto-presente", { userId: ctx.from?.id });
    await SendMensageCustom({ ctx, caption: ctx.t("gift_error_self") });
    return;
  }

  if (mentionedUser.id === ctx.me?.id || mentionedUser.is_bot) {
    warn("giftHandler - tentativa de presente ao bot", {
      userId: ctx.from?.id,
    });
    await SendMensageCustom({ ctx, caption: ctx.t("gift_error_bot") });
    return;
  }

  const mention = CreateMentionUser({
    Nome: mentionedUser.first_name,
    telegramiduser: mentionedUser.id,
  });

  const numbers = extractNumbers(ctx);

  // ── myharem ──────────────────────────────────────────────────────
  if (numbers === true) {
    const reply_markup = CreateButtunConfirmation(
      ctx,
      `gift_yes_fullharem_${mentionedUser.id}_${ctx.from!.id}`,
      `gift_no_fullharem_${mentionedUser.id}_${ctx.from!.id}`,
    );

    await SendMensageCustom({
      ctx,
      caption: ctx.t("gift_confirm_fullharem", { username: mention }),
      reply_markup,
    });
    return;
  }

  // ── nenhum ID ────────────────────────────────────────────────────
  if (numbers.length === 0) {
    warn("giftHandler - ID inválido", { userId: ctx.from?.id });

    const btn = CreateOneBtn({
      text: ctx.t("gift_btn_select", { name: mentionedUser.first_name }),
      icon: "5359664288241829619",
      callback: `select_gift_to_${mentionedUser.id}`,
      typeBtn: BTN_TYPE.switch_inline_query_current_chat,
    });

    await SendMensageCustom({
      ctx,
      caption: ctx.t("gift_error_not_id"),
      reply_markup: btn,
    });
    return;
  }

  // ── ID único ─────────────────────────────────────────────────────
  if (numbers.length === 1) {
    const giftid = numbers[0];

    const GiftCharacter: any = await findCollectionWithIncludes({
      telegramId: ctx.from!.id,
      characterId: giftid!,
    });

    if (!GiftCharacter) {
      warn("giftHandler - personagem não encontrado na coleção", {
        userId: ctx.from?.id,
        giftid,
      });

      await SendMensageCustom({
        ctx,
        caption: ctx.t("gift_fav_not_found", {
          genero: ctx.botType.toLowerCase(),
        }),
      });
      return;
    }

    const characterData = GiftCharacter.Character;

    const characterCaption = create_caption({
      t: ctx.t,
      chatType: ctx.botType,
      character: characterData,
      rawEmoji: false,
    });

    const text = [
      ctx.t("gift_confirmation_message", { username: mention }),
      characterCaption,
    ].join("\n\n");

    const reply_markup = CreateButtunConfirmation(
      ctx,
      `gift_yes_${giftid}_${mentionedUser.id}_${ctx.from!.id}`,
      `gift_no_${giftid}_${mentionedUser.id}_${ctx.from!.id}`,
    );

    try {
      await SendMensageCustom({
        ctx,
        character: characterData,
        caption: text,
        reply_markup,
      });
    } catch (e) {
      error("giftHandler - erro ao enviar mídia", e);
    }
    return;
  }

  // ── múltiplos IDs ────────────────────────────────────────────────
  const cacheKey = crypto.randomUUID().slice(0, 8);
  giftCache.set(cacheKey, numbers);

  const result: any = await findCollectionWithIncludes({
   
    telegramId: ctx.from!.id,
    multicharacterId: numbers,
  });

  if (!result?.success) {
    await SendMensageCustom({
      ctx,
      caption: ctx.t("gift_error_ids_not_found", {
        ids: result?.missingIds?.join(", ") || numbers.join(", "),
      }),
    });
    return;
  }

  const names = result.collection
    .map((item: any) => {
      const c = item.Character;
      return c?.name;
    })
    .filter(Boolean)
    .join(", ");

  const text = await ctx.t("gift_confirmation_message_multi", {
    username: mention,
    qty: String(numbers.length),
    names,
  });

  const reply_markup = CreateButtunConfirmation(
    ctx,
    `gift_yes_multi_${cacheKey}_${mentionedUser.id}_${ctx.from!.id}`,
    `gift_no_multi_${cacheKey}_${mentionedUser.id}_${ctx.from!.id}`,
  );

  await SendMensageCustom({
    ctx,
    caption: text,
    reply_markup,
  });
}
