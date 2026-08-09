import type { MyContext } from "../../../../uteis/CustomTypes.js";
import { clearAllBotCaches } from "../../../../cache/clearAll.js";
import { info, error } from "../../../../uteis/log.js";

export async function clearcache(ctx: MyContext) {
  try {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    if (chatId !== Number(process.env.GROUP_ADM)) {
      error("clearcache - grupo nao e de adms", chatId);
      return;
    }

    await clearAllBotCaches();

    info("clearcache", chatId, "cache limpo");
    await ctx.reply(ctx.t("clearcache_success"));
  } catch (e) {
    error("clearcache - erro ao limpar cache", e);
    await ctx.reply(ctx.t("clearcache_error", { error: "erro interno" }));
  }
}
