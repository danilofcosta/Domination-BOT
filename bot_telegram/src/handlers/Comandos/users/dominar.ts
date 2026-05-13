import {
  BTN_TYPE,
  ChatType,
  type Character,
  type Collection,
  type MyContext,
  type RarityType,
} from "../../../utils/customTypes.js";
import { mentionUser } from "../../../utils/manege_caption/metion_user.js";
import { LinkMsg } from "../../../utils/manege_caption/link_msg.js";
import { AddCharacterCollection } from "../../../utils/chareter/add_character_colletion.js";
import { extractListEmojisCharacter } from "../../../utils/manege_caption/extractListEmojisCharacter.js";
import { info, error, debug, warn } from "../../../utils/log.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { CreateOneBtn } from "../../../utils/btns.js";

function verificarNome(personagem: string, tentativa: string) {
  const ignorar = ["da", "de", "do", "dos", "das", "the", "a", "an", "&", "x"];

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((p) => p && !ignorar.includes(p));

  const nomeParts = normalize(personagem);
  const tentativaParts = normalize(tentativa);

  return tentativaParts.every((p) => nomeParts.includes(p));
}
function calcularTempo({ inicio, fim }) {
  let diff = Math.abs(fim - inicio);

  const unidades = [
    { nome: "a", valor: 60 * 60 * 24 * 365 },
    { nome: "d", valor: 60 * 60 * 24 },
    { nome: "h", valor: 60 * 60 },
    { nome: "m", valor: 60 },
    { nome: "s", valor: 1 },
  ];

  const partes: string[] = [];

  for (const unidade of unidades) {
    const quantidade = Math.floor(diff / unidade.valor);

    if (quantidade > 0) {
      partes.push(`${quantidade}${unidade.nome}`);
      diff %= unidade.valor;
    }
  }

  return partes.length ? partes.join(" ") : "0s";
}
function successDominarMessage(
  ctx: MyContext,
  character: Character,
  collection: Collection,
) {
  if (!collection || !character) return ctx.t("success-dominar-fallback");
  const success_dominar_title = ctx.t("success_dominar_title", {
    usermention: mentionUser(ctx.from?.first_name || "user", ctx.from?.id || 0),
    genero:
      ctx.t(ctx.session.settings.genero === ChatType.WAIFU
        ? "success-dominar-genero-waifu"
        : "success-dominar-genero-husbando"),
  });

  const success_dominar_name = ctx.t("success_dominar_name", {
    character_name: character.name,
  });

  const success_dominar_anime = ctx.t("success_dominar_anime", {
    anime: `${character.origem} ${collection.count}x`,
  });
  const { emoji_event, emoji_raridade: rarityEmojis } =
    extractListEmojisCharacter(ctx, character, false);
  const char = character as any;
  const raritys: RarityType[] =
    process.env.TYPE_BOT === ChatType.WAIFU
      ? char.WaifuRarity
      : char.HusbandoRarity;

  const rarity_name =
    raritys.length > 1
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

    emoji_event:
      emoji_event.length > 1
        ? `[${emoji_event.join(", ")}]`
        : emoji_event.length === 1
          ? emoji_event.join(", ")
          : "",
  });
const time:string = calcularTempo({ inicio: ctx.message?.date || 0, fim: ctx.session.grupo.data || 0 }) || '0'
  const success_dominar_time = ctx.t("success_dominar_time", {
    time:time
  });

  const success_dominar = `${success_dominar_title}\n\n${success_dominar_name}\n${success_dominar_anime}\n${success_dominar_rarity}\n\n${success_dominar_time}`;

  return success_dominar;
}

const LOCK_TIMEOUT = 10000;

function acquireLock(session: any, userId: number, now: number): boolean {
  const currentLock = session.lock;
  if (
    currentLock &&
    now - currentLock.timestamp < LOCK_TIMEOUT &&
    currentLock.userId !== userId
  ) {
    return false;
  }
  session.lock = { userId, timestamp: now };
  return true;
}

export async function CapturarCharacter(ctx: MyContext) {
  const tentativa = String(ctx.match).trim().toLocaleLowerCase();
  const character = ctx.session.grupo.character;
  const type =
    ctx.session.settings.genero || process.env.TYPE_BOT || ChatType.WAIFU;
  const userId = Number(ctx.from?.id);

  info(`CapturarCharacter - tentativa: "${tentativa}"`, {
    userId,
    chatId: ctx.chat?.id,
    usermention: mentionUser(ctx.from?.first_name || "user", ctx.from?.id || 0),
    hasCharacter: !!character,
    type,
  });

  const now = Date.now();
  if (!acquireLock(ctx.session, userId, now)) {
    const lockAge = now - ctx.session.lock!.timestamp;
    warn(`CapturarCharacter - operação bloqueada (lock ativo)`, {
      lockOwner: ctx.session.lock!.userId,
      lockAge,
      requestedBy: userId,
    });
    return;
  }

  try {
    if (!character || !tentativa) {
      warn(`CapturarCharacter - character ou tentativa vazio`, {
        userId,
        chatId: ctx.chat?.id,
        hasCharacter: !!character,
        tentativa,
      });
      if (character && !tentativa) {
        try {
          await Sendmedia({
            ctx,
            caption: ctx.t("drop_character_attempt_empty", {
              genero: type === ChatType.WAIFU ? "waifu" : "husbando",
            }),
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
        userId,
      });

      const url = LinkMsg(
        Number(ctx.chat?.id),
        Number(ctx.session.grupo.dropId),
      );

      try {
        const msg = await Sendmedia({
          ctx,
          caption: ctx.t("drop_character_attempt_incorrect"),
          reply_markup: CreateOneBtn({
            text: ctx.t("drop_character_attempt_incorrect_btn"),
            callback: url,
            typeBtn: BTN_TYPE.url,
          }),
        });

        setTimeout(() => {
          ctx.api.deleteMessage(ctx.chat!.id, msg.message_id).catch((e) => {
            warn(`Falha ao deletar mensagem`, {
              msgId: msg.message_id,
              error: e,
            });
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
      characterName: character.name,
    });
    // Adicionar personagem à coleção do usuário
    const character_collection: Collection | null =
      await AddCharacterCollection({
        type,
        userId,
        from: ctx.from || {},
        characterId: character.id,
      });

    if (!character_collection) {
      error(`AddCharacterCollection retornou null`, {
        userId,
        characterId: character.id,
      });
      return Sendmedia({
        ctx,
        caption: ctx.t("error_adding_character"),
      });
    }
    const successDominarMessageResult = successDominarMessage(
      ctx,
      character,
      character_collection,
    );
    info(`Personagem adicionado com sucesso`, {
      userId,
      characterId: character.id,
      collectionId: character_collection.id,
      count: character_collection.count,
    });


    info(`Dominando - enviando mensagem de sucesso`, {
      userId,
      characterId: character.id,
      characterName: character.name,
      chatId: ctx.chat?.id,

      messageLength: successDominarMessageResult.length,
      hasReplyMarkup: true,
    });

    try {
      await Sendmedia({
        ctx,
        caption: successDominarMessageResult,
        reply_markup: CreateOneBtn({
          text: ctx.t("success_dominar_btn"),
          callback: "harem_user_" + ctx.from?.id,
          typeBtn: BTN_TYPE.switch_inline_query_current_chat,
        }),
      });
      info(`Dominando - mensagem de sucesso enviada com sucesso`, { userId });
    } catch (replyError) {
      error(`Dominando - ERRO ao enviar mensagem de sucesso`, {
        userId,
        characterId: character.id,
        chatId: ctx.chat?.id,
        replyError:
          replyError instanceof Error ? replyError.message : String(replyError),
        stack: replyError instanceof Error ? replyError.stack : undefined,
      });
    }

    ctx.session.grupo = {
      cont: 0,
      dropId: null,
      character: null,
      data: null,
      title: ctx.chat?.title || "",
      directMessagesTopicId: ctx.session.grupo.directMessagesTopicId,
    };

    return true;
  } finally {
    delete ctx.session.lock;
  }
}
