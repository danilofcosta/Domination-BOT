import type { MyContext } from "../../../utils/customTypes.js";
import { debug, error } from "../../../utils/log.js";

interface ShowResultsParams {
  ctx: MyContext;
  results: any[];

  next_offset?: string | undefined;
  text?: string;

  /**
   * Cache máximo do Telegram (2 horas)
   */
  maxCacheTelegram?: boolean;

  /**
   * Não salvar cache no Telegram
   */
  notCacheTelegram?: boolean;

  /**
   * Resultado visível apenas para o usuário que fez a query
   */
  is_personal?: boolean;
}

export async function showResultsInline({
  ctx,
  results,
  next_offset,
  text,
  maxCacheTelegram = false,
  notCacheTelegram = false,
  is_personal = false,
}: ShowResultsParams) {
  debug("showResultsInline - respondendo inline query", {
    userId: ctx.from?.id,
    resultCount: results.length,
  });

  const btnText = (text ?? ctx.t("inline-default-btn")).slice(0, 64);

  const cacheTime = notCacheTelegram
    ? 0
    : maxCacheTelegram
      ? 7200
      : 300;

  try {
    await ctx.answerInlineQuery(results, {
      cache_time: cacheTime,
      is_personal,

      ...(next_offset && {
        next_offset,
      }),

      button: {
        text: btnText,
        start_parameter: `harem_user_${ctx.from?.id}`,
      },
    });
  } catch (e) {
    error("showResultsInline - erro ao responder inline query", e);
  }
}