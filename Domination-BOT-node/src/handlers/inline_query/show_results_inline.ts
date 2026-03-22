import type { MyContext } from "../../utils/customTypes.js";
import type { InlineQueryResult, } from "grammy/types";

interface showResultsparams {
  ctx: MyContext;
  results: any[]; // Use o tipo correto da grammY
  next_offset?: string|undefined;         // Opcional para aceitar o default
  text?: string;                // Opcional para aceitar o default
}

export async function showResults({
  ctx,
  results,
  next_offset  ,
  text = "𝕯𝖔𝖒𝖎𝖓𝖆𝖙𝖎𝖔𝖓𝕾",
}: showResultsparams) {
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
  } catch (error) {
    console.error("Error answering inline query:", error);
  }
}