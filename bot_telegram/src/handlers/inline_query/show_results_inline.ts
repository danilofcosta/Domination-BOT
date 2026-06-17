import type { MyContext } from "../../utils/customTypes.js";
import { error, debug } from "../../utils/log.js";

interface showResultsparams {
  ctx: MyContext;
  results: any[];
  next_offset?: string | undefined;
  text?: string;
  isharem?: boolean;
}

export async function showResults({
  ctx,
  results,
  next_offset,
  text,
  isharem,
}: showResultsparams) {
  debug(`showResults - respondendo inline query`, {
    userId: ctx.from?.id,
    resultCount: results.length,
  });

  const btnText = text || ctx.t("inline-default-btn");

  try {
    // caso uso de cache o telegram n chama o webhook || polling
    await ctx.answerInlineQuery(results, {
      //cache compartilhado entre consulta caso isharem = true
   //  is_personal:isharem? true:false,
      //cache 10 m caso  isharem  caso false 2 h

      cache_time: isharem ? 300 : 7200,
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
