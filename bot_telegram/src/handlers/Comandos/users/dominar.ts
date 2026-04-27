import { ChatType, type Character, type Collection, type MyContext, type RarityType } from "../../../utils/customTypes.js";
import { mentionUser } from "../../../utils/manege_caption/metion_user.js";
import { LinkMsg } from "../../../utils/manege_caption/link_msg.js";
import { AddCharacterCollection } from "../../../utils/chareter/add_character_colletion.js";
import { extractListEmojisCharacter } from "../../../utils/manege_caption/extractListEmojisCharacter.js";
import { info, error, debug, warn } from "../../../utils/log.js";

function verificarNome(personagem: string, tentativa: string) {
  const ignorar = [
    "da",
    "de",
    "do",
    "dos",
    "das",
    "the",
    "a",
    "an",
    "the",
    "&",
  ];

  const partes = personagem.toLowerCase()
    .split(/\s+/)
    .filter((p) => !ignorar.includes(p));

  tentativa = tentativa.toLowerCase().trim();

  if (partes.includes(tentativa)) return true;

  if (tentativa === partes.join(" ")) return true;

  return false;
}

function calcularTempo(per: { data: any }) {
  if (!per.data) return "desconhecido";

  const agora = Date.now();
  let dataMs = 0;
  
  if (typeof per.data === "string") {
    dataMs = new Date(per.data).getTime();
  } else if (per.data instanceof Date) {
    dataMs = per.data.getTime();
  } else if (typeof per.data === "number") {
    // If it's a 10-digit number, it's likely a Telegram unix timestamp in seconds
    dataMs = per.data < 10000000000 ? per.data * 1000 : per.data;
  }

  const diferenca = Math.max(0, agora - dataMs);

  const segundos = Math.floor(diferenca / 1000);
  const minutos = Math.floor(diferenca / 60000);
  const horas = Math.floor(diferenca / 3600000);

  if (segundos < 60) {
    return `${segundos} seg`;
  }

  if (minutos < 60) {
    return `${minutos} min`;
  }

  return `${horas} h`;
}

function successDominarMessage(ctx: MyContext, character: Character, collection: Collection) {
  if (!collection || !character) return "vc tem um personagem novo!";
  const success_dominar_title = ctx.t("success_dominar_title", {
    usermention: mentionUser(ctx.from?.first_name || "user", ctx.from?.id || 0),
    genero:
      ctx.session.settings.genero === ChatType.WAIFU
        ? "uma waifu"
        : "um husbando",
  });

  const success_dominar_name = ctx.t("success_dominar_name", {
    character_name: character.name,
  });

  const success_dominar_anime = ctx.t("success_dominar_anime", {
    anime: `${character.origem} ${collection.count}x`,
  });
  const { emoji_event, emoji_raridade: rarityEmojis } =  extractListEmojisCharacter(ctx, character, false);
  const char = character as any;
  const raritys: RarityType[] = process.env.TYPE_BOT === ChatType.WAIFU
      ? char.WaifuRarity
      : char.HusbandoRarity;

  const rarity_name = raritys.length > 1
        ? `[${raritys.map((r: any) => r.Rarity?.name || r.rarity?.name).join(", ")}]`
        : raritys.length === 1
          ? (raritys[0] as any).Rarity?.name || (raritys[0] as any).rarity?.name
          : "";


  const success_dominar_rarity = ctx.t("success_dominar_rarity", {
    rarity_name: rarity_name,
    rarity:
      rarityEmojis.length > 1
        ? `[${rarityEmojis.join(", ")}]`
        : rarityEmojis.length === 1
          ? rarityEmojis.join(", ")
          : "",
    
    
     emoji_event: emoji_event.length > 1
        ? `[${emoji_event.join(", ")}]`
        : emoji_event.length === 1
          ? emoji_event.join(", ")
          : "",
  });

  const success_dominar_time = ctx.t("success_dominar_time", {
    time: calcularTempo({ data: ctx.session.grupo.data }),
  });

  const success_dominar = `${success_dominar_title}\n\n${success_dominar_name}\n${success_dominar_anime}\n${success_dominar_rarity}\n\n${success_dominar_time}`;

  return success_dominar;
}

const LOCK_TIMEOUT = 10000;

export async function CapturarCharacter(ctx: MyContext) {
  const tentativa = String(ctx.match).trim().toLocaleLowerCase();
  const character = ctx.session.grupo.character;
  const type = ctx.session.settings.genero || process.env.TYPE_BOT
  const userId = Number(ctx.from?.id);

  info(`CapturarCharacter - tentativa: "${tentativa}"`, {
    userId,
    chatId: ctx.chat?.id,
    usermention: mentionUser(ctx.from?.first_name || "user", ctx.from?.id || 0),
    hasCharacter: !!character,
    type
  });

  if (ctx.session.lock) {
    const lockAge = Date.now() - ctx.session.lock.timestamp;
    if (lockAge < LOCK_TIMEOUT && ctx.session.lock.userId !== userId) {
      warn(`CapturarCharacter - operação bloqueada (lock ativo)`, {
        lockOwner: ctx.session.lock.userId,
        lockAge,
        requestedBy: userId
      });
    //  await ctx.reply(ctx.t("dominar_locked"));
      return;
    }
  }

  ctx.session.lock = { userId, timestamp: Date.now() };

  try {
    if (!character || !tentativa) {
      warn(`CapturarCharacter - character ou tentativa vazio`, {
        userId,
        chatId: ctx.chat?.id,
        hasCharacter: !!character,
        tentativa
      });
      if (character && !tentativa) {
        try {
          const topicId = ctx.session.grupo.directMessagesTopicId;
        await ctx.reply(ctx.t("drop_character_attempt_empty", {
            genero: type === ChatType.WAIFU ? "waifu" : "husbando",
          }), {
            ...(topicId && { message_thread_id: topicId }),
          });
        } catch (e) {
          error("Erro ao enviar mensagem de nome vazio", e);
        }
      }
      return;
    }
    if (!verificarNome(character.name, tentativa)) {
      debug(`CapturarCharacter - nome incorreto`, {
        tentativa,
        characterName: character.name,
        userId
      });

      const url = LinkMsg(Number(ctx.chat?.id), Number(ctx.session.grupo.dropId));

      try {
        const topicId = ctx.session.grupo.directMessagesTopicId;
        const msg = await ctx.reply(ctx.t("name-not-found"), {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [[{ text: ctx.t("bt-tentative-again"), url }]],
          },
          ...(topicId && { message_thread_id: topicId }),
        });

        setTimeout(() => {
          ctx.api.deleteMessage(ctx.chat!.id, msg.message_id).catch((e) => {
            warn(`Falha ao deletar mensagem`, { msgId: msg.message_id, error: e });
          });
        }, 120000);
      } catch (e) {
        error("Erro ao enviar mensagem de nome incorreto", e);
      }

      return;
    }
    
    ctx.session.grupo.character = null;
    ctx.session.grupo.dropId = null;
    ctx.session.grupo.cont = 0;
 
    info(`CapturarCharacter - nome correto, adicionando personagem`, {
      userId,
      characterId: character.id,
      characterName: character.name
    });

    const character_collection : Collection | null = await AddCharacterCollection({
      type,
      userId,
      from: ctx.from || {},
      Charater_id: character.id
    });

    if (!character_collection) {
      error(`AddCharacterCollection retornou null`, { userId, characterId: character.id });
      const topicId = ctx.session.grupo.directMessagesTopicId;
      return ctx.reply(ctx.t("error_add_character"), {
        ...(topicId && { message_thread_id: topicId }),
      });
    }

    info(`Personagem adicionado com sucesso`, {
      userId,
      characterId: character.id,
      collectionId: character_collection.id,
      count: character_collection.count
    });
    const successDominarMessageResult = successDominarMessage(ctx, character, character_collection)
    const topicId = ctx.session.grupo.directMessagesTopicId;
    
    info(`Dominando - enviando mensagem de sucesso`, {
      userId,
      characterId: character.id,
      characterName: character.name,
      chatId: ctx.chat?.id,
      topicId,
      messageLength: successDominarMessageResult.length,
      hasReplyMarkup: true
    });

    try {
      await ctx.reply(successDominarMessageResult, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: ctx.t("success_dominar_btn"),
                switch_inline_query_current_chat: "harem_user_" + ctx.from?.id,
              },
            ],
          ],
        },
        ...(topicId && { message_thread_id: topicId }),
      });
      info(`Dominando - mensagem de sucesso enviada com sucesso`, { userId });
    } catch (replyError) {
      error(`Dominando - ERRO ao enviar mensagem de sucesso`, {
        userId,
        characterId: character.id,
        chatId: ctx.chat?.id,
        topicId,
        replyError: replyError instanceof Error ? replyError.message : String(replyError),
        stack: replyError instanceof Error ? replyError.stack : undefined
      });
    }

    ctx.session.grupo = {
      cont: 0,
      dropId: null,
      character: null,
      data: null,
      title: ctx.chat?.title || "",
      directMessagesTopicId: ctx.session.grupo.directMessagesTopicId , 
    };
  
    return true;
  } finally {
    delete ctx.session.lock;
  }
}
