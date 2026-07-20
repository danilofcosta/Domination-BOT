import type { MyContext } from "../../../uteis/CustomTypes.js";
import { debug, error } from "../../../uteis/log.js";

interface showResultsparams {
  ctx: MyContext;
  results: any[];
  next_offset?: string | undefined;
  text?: string;
  maxCacheTelegram?: boolean;
}

export async function showResults({
  ctx,
  results,
  next_offset,
  text,
  maxCacheTelegram,
}: showResultsparams) {
  debug(`showResults - respondendo inline query`, {
    userId: ctx.from?.id,
    resultCount: results.length,
  });

  const btnText = text || ctx.t("inline-default-btn");

  try {
    await ctx.answerInlineQuery(results, {
      cache_time: maxCacheTelegram ? 300 : 7200,
    // 
    
   // cache_time:0,
      ...(next_offset !== undefined && { next_offset }),
      button: {
        text: btnText.slice(0, 64),
        start_parameter: `harem_user_${ctx.from?.id}`,
      },
    });
  } catch (e) {
    error("showResults - erro ao responder inline query", e);
  }
}
