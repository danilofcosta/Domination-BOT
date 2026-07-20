import {
  ChatType,
  type Character,
  type MyContext,
} from "../../../uteis/CustomTypes.js";
import { BTN_TYPE } from "../../../uteis/buildButtons/createOneButton.js";
import { LinkMsg } from "../../../uteis/uteis_telegram/LinkMsg.js";
import { AddCharacterCollection } from "../../../uteis/extras/AddCharacterCollection.js";
import { extractListEmojisCharacter } from "../../../uteis/buildCapion/extract_emojis.js";
import { info, error, debug, warn } from "../../../uteis/log.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";
import {
  CreateOneBtn,
  type CreateOneBtnOptions,
} from "../../../uteis/buildButtons/createOneButton.js";
import { getRuntime } from "../../../runtime/groupRuntime.js";
import { GetCharacterById } from "../../../uteis/extras/GetCharacterById.js";
import { checkDailyLimit } from "../../../cache/redis.js";
import { getDropConfig } from "../../../cache/dropConfig.js";
import { CreateMentionUser } from "../../../uteis/uteis_telegram/CreateMentionUser.js";

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
    "&",
    "x",
    ".",
    "..",
    "...",
  ];

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((p) => p && !ignorar.includes(p));

  const nomeParts = normalize(personagem);
  const tentativaParts = normalize(tentativa);
  if (tentativaParts.length === 0) {
    return false;
  }
  return tentativaParts.every((p) => nomeParts.includes(p));
}

function calcularTempo({ inicio, fim }: { inicio: number; fim: number }) {
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
  collection: any,
  data: number | null,
) {
  if (!collection || !character) return ctx.t("success-dominar-fallback");
  const success_dominar_title = ctx.t("success_dominar_title", {
    usermention: CreateMentionUser({
      Nome: ctx.from?.first_name || "user",
      telegramiduser: ctx.from?.id || 0,
    }),
    genero: ctx.t(
      ctx.botType === ChatType.WAIFU
        ? "success-dominar-genero-waifu"
        : "success-dominar-genero-husbando",
    ),
  });

  const success_dominar_name = ctx.t("success_dominar_name", {
    character_name: character.name,
  });

  const success_dominar_anime = ctx.t("success_dominar_anime", {
    anime: `${character.origem} ${collection.count}x`,
  });
  const { emoji_event, emoji_raridade: rarityEmojis } =
    extractListEmojisCharacter(character, false);
  const char = character as any;
  const raritys: any[] =
    ctx.botType === ChatType.WAIFU ? char.WaifuRarity : char.HusbandoRarity;

  const rarity_name =
    raritys && raritys.length > 1
      ? `[${raritys.map((r: any) => r.Rarity?.name || r.rarity?.name).join(", ")}]`
      : raritys && raritys.length === 1
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
  const time: string =
    calcularTempo({
      inicio: ctx.message?.date || 0,
      fim: data || 0,
    }) || "0";
  const lasttime: string = `<tg-time unix=${ctx.message?.date} format="r">22:45 tomorrow</tg-time>`;
  const success_dominar_time = ctx.t("success_dominar_time", {
    time: `<code>${time}</code>`,
  });

  const success_dominar = `${success_dominar_title}\n\n${success_dominar_name}\n${success_dominar_anime}\n${success_dominar_rarity}\n${success_dominar_time} \n\n Quando?: ${lasttime}`;

  return success_dominar;
}

const LOCK_TIMEOUT = 10000;

function acquireLock(runtime: any, userId: number, now: number): boolean {
  const currentLock = runtime.lock;
  if (
    currentLock &&
    now - currentLock.timestamp < LOCK_TIMEOUT &&
    currentLock.userId !== userId
  ) {
    return false;
  }
  runtime.lock = { userId, timestamp: now };
  return true;
}

export async function CapturarCharacter(ctx: MyContext) {
  // return SendMensageCustom({
  //   ctx,
  //   caption: "Dominação de persogem temporariamente desativada :(",
  // });
  const tentativa = String(ctx.match).trim().toLocaleLowerCase();
  if (!ctx.chat?.id) return;
  const runtime = getRuntime(ctx.chat.id);
  const character = runtime.characterId
    ? await GetCharacterById(ctx.botType, runtime.characterId)
    : null;
  const type = ctx.botType;
  const userId = Number(ctx.from?.id);

  info(`CapturarCharacter - tentativa: "${tentativa}"`, {
    userId,
    chatId: ctx.chat?.id,
    usermention: CreateMentionUser({
      Nome: ctx.from?.first_name || "user",
      telegramiduser: ctx.from?.id || 0,
    }),
    hasCharacter: !!character,
    type,
  });

  const now = Date.now();
  if (!acquireLock(runtime, userId, now)) {
    const lockAge = now - runtime.lock!.timestamp;
    warn(`CapturarCharacter - operação bloqueada (lock ativo)`, {
      lockOwner: runtime.lock!.userId,
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
          await SendMensageCustom({
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

      const url = LinkMsg(Number(ctx.chat?.id), Number(runtime.dropId));

      try {
        const msg = await SendMensageCustom({
          ctx,
          caption: ctx.t("drop_character_attempt_incorrect"),
          reply_markup: CreateOneBtn({
            text: ctx.t("drop_character_attempt_incorrect_btn"),
            callback: url,
            typeBtn: BTN_TYPE.url,
          } as CreateOneBtnOptions),
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

    const config = await getDropConfig();
    const withinLimit = await checkDailyLimit(userId, config.dailyLimit);
    if (!withinLimit) {
      warn(`CapturarCharacter - limite diário atingido`, { userId });
      try {
        await SendMensageCustom({
          ctx,
          caption: ctx.t("daily_dominar_limit", {
            genero: type === ChatType.WAIFU ? "waifu" : "husbando",
          }),
        });
      } catch (e) {
        error("Erro ao enviar mensagem de limite diário", e);
      }
      return;
    }

    runtime.characterId = null;
    runtime.dropId = null;
    runtime.cont = 0;

    info(`CapturarCharacter - nome correto, adicionando personagem`, {
      userId,
      characterId: character.id,
      characterName: character.name,
    });

    const character_collection: any | null = await AddCharacterCollection({
      type,
      userId,
      from: ctx.from || {},
      characterId: character.id,
      fromIdChat:ctx.chat.id
    });

    if (!character_collection) {
      error(`AddCharacterCollection retornou null`, {
        userId,
        characterId: character.id,
      });
      return SendMensageCustom({
        ctx,
        caption: ctx.t("error_adding_character"),
      });
    }
    const successDominarMessageResult = successDominarMessage(
      ctx,
      character,
      character_collection,
      runtime.data,
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
      await SendMensageCustom({
        ctx,
        caption: successDominarMessageResult,
        reply_markup: CreateOneBtn({
          text: ctx.t("success_dominar_btn"),
          callback: "harem_user_" + ctx.from?.id,
          typeBtn: BTN_TYPE.switch_inline_query_current_chat,
        } as CreateOneBtnOptions),
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

    runtime.cont = 0;
    runtime.dropId = null;
    runtime.characterId = null;
    runtime.data = null;
    delete runtime.lock;

    return true;
  } finally {
    delete runtime.lock;
  }
}
