import { Composer } from "grammy";
import type { MyContext } from "./utils/customTypes.js";
import { contarMensagens } from "./handlers/listeners/contarMensagens.js";
import { haremInlineQuery } from "./handlers/inline_query/harem_inline_query.js";
import {
  getCharacters,
  getCharactersall,
} from "./handlers/inline_query/inline_query.js";
import { getCharacter, setCharacter, getCharList } from "./cache/cache.js";
import { addCharacter_edit_CallbackData } from "./handlers/Comandos/admin_bot/manager_character/add/add_character_edit.js";
import { debug, info, error as logError } from "./utils/log.js";
import { prisma } from "../lib/prisma.js";
import { ChatType } from "./utils/customTypes.js";
import type { InlineQueryResult } from "grammy/types";
import { inline_per } from "./handlers/inline_query/inline_by_id.js";

const listeners = new Composer<MyContext>();

listeners.on("message:text", async (ctx, next) => {
  if (ctx.session.adminSetup?.action && ctx.session.adminSetup?.targetId) {
    const action = ctx.session.adminSetup.action;
    const targetId = Number(ctx.session.adminSetup.targetId);
    const text = ctx.message.text;

    let character = getCharacter(targetId);
    if (!character) {
      ctx.session.adminSetup = { action: null, targetId: null };
      return;
    }

    if (action === "edit_nome") {
      character.nome = text;
    } else if (action === "edit_anime") {
      character.anime = text;
    }

    setCharacter(targetId, character);
    ctx.session.adminSetup = { action: null, targetId: null };

    await addCharacter_edit_CallbackData(ctx, String(targetId));
    return;
  }
  return next();
});

listeners.chatType(["group", "supergroup"]).on("message", contarMensagens);

const userLatestQuery = new Map<number, string>();

listeners.on("inline_query", async (ctx) => {
  const start = Date.now();
  const query = ctx.inlineQuery.query || "";
  const userId = ctx.from?.id;
  if (!userId) return;

  const queryId = ctx.inlineQuery.id;
  userLatestQuery.set(userId, queryId);

  const queryParts = query.split("_");
  const firstPart = queryParts[0];

  debug("inline_query_start", { query, userId });

  let answered = false;
  const originalAnswer = ctx.answerInlineQuery.bind(ctx);

  ctx.answerInlineQuery = async (results: any, other?: any) => {
    if (answered) return {} as any;
    if (userLatestQuery.get(userId) !== queryId) {
      debug("inline_query_stale_discarded", { query, userId });
      return {} as any;
    }
    answered = true;
    return originalAnswer(results, other);
  };

  const processQuery = async () => {
    if (firstPart === "harem" && queryParts[1] === "user") {
      return haremInlineQuery(ctx);
    }

    if (firstPart === "list" && queryParts[1] === "char" && queryParts[2] === "user") {
      const targetUserId = Number(queryParts[3]);
      const genero = queryParts[4] as ChatType || ChatType.WAIFU;

      const charListData = getCharList(targetUserId, genero);

      if (!charListData) return;
      return await inline_per(ctx, charListData);
    }

    if (query.startsWith("harem_user_")) {
      return haremInlineQuery(ctx);
    }

    if (query !== "" && !isNaN(Number(query))) {
      await getCharacters(ctx);
      return;
    }

    if (query === "") {
      await getCharactersall(ctx);
      return;
    }

    return await ctx.answerInlineQuery([]);
  };

  try {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2500));
    await Promise.race([processQuery(), timeoutPromise]);
  } catch (err: any) {
    if (err.message === 'TIMEOUT') {
      debug("inline_query_timeout", { query, userId });
      if (!answered && userLatestQuery.get(userId) === queryId) {
        try { await originalAnswer([]); answered = true; } catch (e) {}
      }
    } else {
      logError("inline_query_error", err);
    }
  } finally {
    const duration = Date.now() - start;
    info(`Inline query [${query}] do usuário ${userId} levou ${duration}ms`);
  }
});

export { listeners };
