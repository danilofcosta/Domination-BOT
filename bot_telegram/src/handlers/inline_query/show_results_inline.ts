import type { MyContext } from "../../utils/customTypes.js";
import { error, debug } from "../../utils/log.js";

interface showResultsparams {
  ctx: MyContext;
  results: any[];
  next_offset?: string|undefined;
  text?: string;
}

export async function showResults({
  ctx,
  results,
  next_offset,
  text = "𝕯𝖔𝖒𝖎𝖓𝖆𝖙𝖎𝖔𝖓𝕾",
}: showResultsparams) {
  debug(`showResults - respondendo inline query`, { userId: ctx.from?.id, resultCount: results.length });

  try {
    await ctx.answerInlineQuery(results, {
      cache_time: 0,
      is_personal: true,
      ...(next_offset !== undefined && { next_offset }),
      button: {
        text: text,
        start_parameter: `harem_user_${ctx.from?.id}`,
      },
    });
  } catch (e) {
    error("showResults - erro ao responder inline query", e);
  }
}
