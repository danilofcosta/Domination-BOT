import type { InputRichMessage } from "grammy/types";
import { CreateMentionUser } from "../../../uteis/uteis_telegram/CreateMentionUser.js";
import type { MyContext } from "../../../uteis/CustomTypes.js";
import { MediaType } from "../../../../generated/prisma/client.js";
import { create_caption } from "../../../uteis/buildCapion/create_caption.js";
import { findCollectionWithIncludes } from "../../../uteis/extras/collectionUtils.js";
import { debug, error, warn } from "../../../uteis/log.js";
import { Extract_id_user } from "../../../uteis/uteis_telegram/extract_id_user.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";
import { userCommandsRegistryDict } from "../../../CommandsRegistry/CommandsRegistryUser.js";
import { extractNumbers } from "../../../uteis/remove num.js";
import { BTN_TYPE, CreateOneBtn } from "../../../uteis/buildButtons/createOneButton.js";
import { InlineKeyboard } from "grammy";
import { typeBot } from "../../../CommandsRegistry/botConfigCommands.js";
import { setTradeSession, updateTradeSession } from "../../../cache/tradeCache.js";
import { buildCharacterMedia, createTradeTable } from "./trade_uteis.js";


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

  if (tradeHandlerparametres) {
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
    const mentionedUser = await Extract_id_user(ctx);
    if (!mentionedUser) {
      await SendMensageCustom({
        ctx,
        caption: ctx.t("trade_reply_instruction", {
          command: userCommandsRegistryDict.Gift!.command,
        }),
      });
      return;
    }

    receiverName = mentionedUser.first_name;

    if (mentionedUser.id === ctx.from?.id) {
      warn("tradeHandler - tentativa de negociar consigo mesmo", {
        userId: ctx.from?.id,
      });
      await SendMensageCustom({ ctx, caption: ctx.t("trade_error_user") });
      return;
    }

    if (mentionedUser.id === ctx.me?.id || mentionedUser.is_bot) {
      warn("tradeHandler - tentativa de negociar com o bot", {
        userId: ctx.from?.id,
      });
      await SendMensageCustom({ ctx, caption: ctx.t("trade_error_bot") });
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
      return await SendMensageCustom({ ctx, caption: ctx.t("trade_error_donate_harem") });
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

      const _menu_init_id = await SendMensageCustom({
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
      return await SendMensageCustom({
        ctx,
        caption: ctx.t("trade_error_all_id_not_info", {
          command: userCommandsRegistryDict.Gift!.command,
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
    await SendMensageCustom({
      ctx, caption: ctx.t("trade_receiver_not_found", {
        mention: CreateMentionUser({
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
    await SendMensageCustom({ ctx, caption: ctx.t("trade_transmitter_not_found", {
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
        <cite> autor ${CreateMentionUser({ Nome: ctx.from?.first_name ?? "Desconhecido", telegramiduser: ctx.from?.id ?? 0 })}</cite>
      </aside>


 <tg-slideshow> ${meuMedia?.link}${seudMedia?.link}  </tg-slideshow>

 <h3>${CreateMentionUser({ Nome: "teste", telegramiduser: ctx.from?.id ?? 0 })} , ${CreateMentionUser({ Nome: ctx.from?.first_name ?? "Desconhecido", telegramiduser: ctx.from?.id ?? 0 })} quer Negociar  com vc !! </h3>






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
