import type { Context } from "@grammyjs/commands/out/deps.node.js";
import { error } from "../log.js";

export async function cleanupCallback(ctx: Context) {
  try {
    await ctx.deleteMessage().catch(() => {});
    await ctx.answerCallbackQuery();
  } catch (e) {
    await ctx.editMessageReplyMarkup();

    error("cleanupCallback - erro ao deletar mensagem", e);
  }
}
