import { Composer } from "grammy";
import type { MyContext } from "./uteis/CustomTypes.js";
import { CountMessages } from "./handlers/listeners/message_counter.js";
import { haremInlineQuery } from "./handlers/InlineQuerys/inlines/harem_inline_query.js";
import {
  getCharacters,
  getCharactersall,
  QueryCharacet,
} from "./handlers/InlineQuerys/global/inline_query.js";
import { animeInlineQuery } from "./handlers/InlineQuerys/global/anime_inline_query.js";
import { Gift_Inline_query } from "./handlers/InlineQuerys/inlines/gift_iniline_query.js";
import { Fav_Inline_query } from "./handlers/InlineQuerys/inlines/fav_iniline_query.js";
import { searchHarem } from "./handlers/InlineQuerys/inlines/search_haren.js";
import { inline_per } from "./handlers/InlineQuerys/global/inline_by_id.js";
import { getCharList } from "./cache/cache.js";
import { ChatType } from "./uteis/CustomTypes.js";

import { getListener, clearListener } from "./cache/listenerStore.js";
import { debug, error, info } from "./uteis/log.js";
import { TradeInlineQuery } from "./handlers/InlineQuerys/inlines/tradeInlineQuery.js";

const listeners = new Composer<MyContext>();

listeners.on("message", async (ctx, next) => {
  console.log(`mensagem recebida :${ctx.chat?.type} ${ctx.from?.id}`)
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;
  if (!userId || !chatId) {
    await next();
    return;
  }

  const stored = getListener(userId, chatId);
  if (stored && stored.type === 'text' && (ctx.message?.text || ctx.message?.caption || ctx.message?.photo || ctx.message?.video)) {
    clearListener(userId, chatId);
    await stored.action(ctx);
    return;
  }

  // await next();
if (["group", "supergroup"].includes(ctx.chat.type)) {
  return await CountMessages(ctx);
}
});
// listeners
//   .chatType(["group", "supergroup"])
//   .on("message", CountMessages);
const userLatestQuery = new Map<number, string>();

setInterval(() => {
  if (userLatestQuery.size > 100) {
    userLatestQuery.clear();
  }
}, 60000);

listeners.on("inline_query", async (ctx) => {
  const start = Date.now();
  const query = ctx.inlineQuery?.query || "";
  const userId = ctx.from?.id;
  if (!userId) return;

  const queryId = ctx.inlineQuery?.id;
  if (!queryId) return;

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
      if (query.startsWith("trade_")) {
      return await TradeInlineQuery(ctx);
    }

    if (query.startsWith("anime_")) {
      return await animeInlineQuery(ctx);
    }

    if (query.startsWith("select_gift_to_")) {
      return await Gift_Inline_query(ctx);
    }

    if (query.startsWith("select_my_fav")) {
      return await Fav_Inline_query(ctx);
    }

    if (firstPart === "harem" && queryParts[1] === "user") {
      return haremInlineQuery(ctx);
    }

    if (
      firstPart === "list" &&
      queryParts[1] === "char" &&
      queryParts[2] === "user"
    ) {
      const targetUserId = Number(queryParts[3]);
      const genero = (queryParts[4] as ChatType) || ctx.botType;

      const charListData = getCharList(targetUserId, genero);
      if (!charListData) return;
      return await inline_per(ctx, charListData);
    }

    if (query.startsWith("my:")) {
      return await searchHarem(ctx);
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

    await QueryCharacet(ctx);
    return;
  };

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), 2500),
    );
    await Promise.race([processQuery(), timeoutPromise]);
  } catch (err: any) {
    if (err.message === "TIMEOUT") {
      debug("inline_query_timeout", { query, userId });
      if (!answered && userLatestQuery.get(userId) === queryId) {
        try {
          await originalAnswer([]);
          answered = true;
        } catch (e) {}
      }
    } else {
      error("inline_query_error", err);
    }
  } finally {
    const duration = Date.now() - start;
    info(`Inline query [${query}] do usuario ${userId}  levou ${duration}ms`);
  }
});

export { listeners };
