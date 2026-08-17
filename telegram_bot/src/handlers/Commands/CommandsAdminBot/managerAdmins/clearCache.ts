import type { MyContext } from "../../../../utils/customTypes.js";
import { clearAllBotCaches } from "../../../../cache/clearAll.js";
import { info, error } from "../../../../utils/log.js";

export async function clearCache(ctx: MyContext) {
  try {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    // if (chatId !== Number(process.env.GROUP_ADM)  || Number(chatId) !== Number(process.env.CHAT_ID_DEV)) {
    //   error("clearCache - grupo nao e de adms", chatId);
    //   return;
    // }

    await clearAllBotCaches();

    info("clearCache", chatId, "cache limpo");
    await ctx.reply(ctx.t("clearcache_success"));
  } catch (e) {
    error("clearCache - erro ao limpar cache", e);
    await ctx.reply(ctx.t("clearcache_error", { error: "erro interno" }));
  }
}
