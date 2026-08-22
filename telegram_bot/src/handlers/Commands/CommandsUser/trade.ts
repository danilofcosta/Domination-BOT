import type { InputRichMessage } from "grammy/types";
import { createMentionUser } from "../../../utils/telegram/createMentionUser.js";
import type { MyContext } from "../../../utils/customTypes.js";
import { MediaType } from "../../../../generated/prisma/client.js";
import { createCaption } from "../../../utils/buildCaption/createCaption.js";
import { findCollectionWithIncludes } from "../../../utils/extras/collectionUtils.js";
import { debug, error, warn } from "../../../utils/log.js";
import { extractUserId } from "../../../utils/telegram/extractUserId.js";
import { sendMessageCustom } from "../../../utils/sendMessageCustom.js";
import { userCommandsRegistryDict } from "../../../CommandsRegistry/CommandsRegistryUser.js";
import { extractNumbers } from "../../../utils/removeNum.js";
import { BTN_TYPE, CreateOneBtn } from "../../../utils/buildButtons/createOneButton.js";
import { InlineKeyboard } from "grammy";
import { typeBot } from "../../../CommandsRegistry/botConfigCommands.js";
import { setTradeSession, updateTradeSession } from "../../../cache/tradeCache.js";
import { buildCharacterMedia, createTradeTable } from "./tradeUtils.js";


export interface TradeHandlerparametres {
  receiver_id: number
  receiver_characterId: number
  Transmitter_characterId: number
  Transmitter_id: number
  chat_id: number
  
}

export async function TradeHandler(ctx: MyContext, tradeHandlerparametres?: TradeHandlerparametres) {
  if (!ctx) return;

  let receiver_id: number;
  let receiver_characterId: number;
  let Transmitter_id: number;
  let Transmitter_characterId: number;
  let chat_id: number;
  let receiverName = "";
  let tradeKey: string;

  if (tradeHandlerparametres && tradeHandlerparametres.receiver_id && tradeHandlerparametres.Transmitter_id) {
    receiver_id = tradeHandlerparametres.receiver_id;
    receiver_characterId = tradeHandlerparametres.receiver_characterId;
    Transmitter_id = tradeHandlerparametres.Transmitter_id;
    Transmitter_characterId = tradeHandlerparametres.Transmitter_characterId;
    chat_id = tradeHandlerparametres.chat_id;
    tradeKey = `${chat_id}:${Transmitter_id}`;
    setTradeSession(chat_id, Transmitter_id, {
      chatId: chat_id,
      transmitterId: Transmitter_id,
      receiverId: receiver_id,
      transmitterCharacterId: Transmitter_characterId,
      receiverCharacterId: receiver_characterId,
    });
  } else {
    const mentionedUser = await extractUserId(ctx);
    if (!mentionedUser) {
      await sendMessageCustom({
        ctx,
        caption: ctx.t("trade_reply_instruction", {
          command: '/' + userCommandsRegistryDict.Trade!.command,
        }),
      });
      return;
    }

    receiverName = mentionedUser.first_name;

    if (mentionedUser.id === ctx.from?.id) {
      warn("tradeHandler - tentativa de negociar consigo mesmo", {
        userId: ctx.from?.id,
      });
      await sendMessageCustom({ ctx, caption: ctx.t("trade_error_user") });
      return;
    }

    if (mentionedUser.id === ctx.me?.id || mentionedUser.is_bot) {
      warn("tradeHandler - tentativa de negociar com o bot", {
        userId: ctx.from?.id,
      });
      await sendMessageCustom({ ctx, caption: ctx.t("trade_error_bot") });
      return;
    }

    const numbers: number[] | true = extractNumbers(ctx);
    chat_id = ctx.chat?.id ?? 0;

    if (numbers === true) {
      debug('Doação de harem esta indisponivel', {
        chatId: chat_id,
        transmitterId: ctx.from!.id,
        receiverId: mentionedUser.id,
      });
      return await sendMessageCustom({ ctx, caption: ctx.t("trade_error_donate_harem") });
    }

    const _tradeKey = setTradeSession(chat_id, ctx.from!.id, {
      chatId: chat_id,
      transmitterId: ctx.from!.id,
      receiverId: mentionedUser.id,
    });
    tradeKey = _tradeKey;

    if (numbers.length === 0) {
      warn("tradeHandler - IDs não informados", { userId: ctx.from?.id });

      const btn = new InlineKeyboard();
      btn.switchInlineCurrent(ctx.t("trade_btn_my_label_my"), `trade_set.character.id.transmitter_${tradeKey}`);
      btn.switchInlineCurrent(ctx.t("trade_btn_my_label_receiver"), `trade_set.character.id.receiver_${tradeKey}`).row();
      btn.text(ctx.t("trade_btn_my_label_cancel"), `trade_cancel_${tradeKey}`);

      const _menu_init_id = await sendMessageCustom({
        ctx,
        caption: ctx.t("trade_error_not_id"),
        reply_markup: btn,
      });

      if (_menu_init_id?.message_id) {
        updateTradeSession(tradeKey, {
          menuInitMessageId: _menu_init_id.message_id,
          menuChatId: chat_id,
        });
      }

      return;
    }

    if (numbers.length === 1) {
      warn("tradeHandler - faltou ID do receptor", { userId: ctx.from?.id });
      return await sendMessageCustom({
        ctx,
        caption: ctx.t("trade_error_all_id_not_info", {
          command: '/' + userCommandsRegistryDict.Trade!.command,
        }),
      });
    }

    Transmitter_id = ctx.from!.id;
    Transmitter_characterId = numbers[0]!;
    receiver_id = mentionedUser.id;
    receiver_characterId = numbers[1]!;
  }

  const _receiver = await findCollectionWithIncludes({
    telegramId: receiver_id,
    characterId: receiver_characterId,
  });
  if (!_receiver) {
    await sendMessageCustom({
      ctx, caption: ctx.t("trade_receiver_not_found", {
        mention: createMentionUser({
          Nome: receiverName, telegramiduser: receiver_id
        }),
        typeBot: typeBot!,
        characterId: String(receiver_characterId),
      })
    });
    return;
  }

  const _transmitter = await findCollectionWithIncludes({
    telegramId: Transmitter_id,
    characterId: Transmitter_characterId,
  });

  if (!_transmitter) {
    await sendMessageCustom({ ctx, caption: ctx.t("trade_transmitter_not_found", {
      typeBot: typeBot!,
      characterId: String(Transmitter_characterId),
    }) });
    return;
  }

  const meuMedia = buildCharacterMedia(ctx, _receiver);
  const seudMedia = buildCharacterMedia(ctx, _transmitter);

  const rich_message: InputRichMessage = {
    html: `
      <aside>
        🤝 <b>Negociação iniciada</b><br>
        <cite> autor ${createMentionUser({ Nome: ctx.from?.first_name ?? "Desconhecido", telegramiduser: ctx.from?.id ?? 0 })}</cite>
      </aside>


 <tg-slideshow> ${meuMedia?.link}${seudMedia?.link}  </tg-slideshow>

 <h3>${createMentionUser({ Nome: "teste", telegramiduser: ctx.from?.id ?? 0 })} , ${createMentionUser({ Nome: ctx.from?.first_name ?? "Desconhecido", telegramiduser: ctx.from?.id ?? 0 })} quer Negociar  com vc !! </h3>






 <table bordered striped>
 <caption>Dados do Contrato</caption>
  ${createTradeTable(meuMedia)}
</table>

 <details ><summary>Mais detalhes</summary>${meuMedia?.caption?.replace(/\n/g, "<br>")}</details>



    <aside><h2> ⇋ ⇌ ⇋ ⇌ ⇋ | ⇌ ⇋ ⇌ ⇋ ⇌</h2>   </aside>


<table bordered striped>
  ${createTradeTable(seudMedia)}
</table>

 <details><summary>Mais detalhes</summary>${seudMedia?.caption?.replace(/\n/g, "<br>")}</details>


`,
    media: [
      {
        id: meuMedia?.id ?? "personagem1",
        media: {
          type: (meuMedia?.type ?? "photo") as "photo" | "video",
          media: meuMedia?.characterData?.media ?? "",
          caption: meuMedia?.caption ?? "",
        },
      },
      {
        id: seudMedia?.id ?? "personagem2",
        media: {
          type: (seudMedia?.type ?? "photo") as "photo" | "video",
          media: seudMedia?.characterData?.media ?? "",
          caption: seudMedia?.caption ?? "",
        },
      },
    ],
  };

  await ctx.api.sendRichMessage(
    chat_id,
    rich_message,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: ctx.t("trade_btn_accept"),
              callback_data: `trade_accept_${tradeKey}`,
            },
            {
              text: ctx.t("trade_btn_counter"),
              callback_data: `trade_counter_${tradeKey}`,
            },
          ],
          [
            {
              text: ctx.t("trade_btn_decline"),
              callback_data: `trade_decline_${tradeKey}`,
            },
          ],
        ],
      },
    },
  );
}
