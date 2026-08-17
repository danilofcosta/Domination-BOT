import type { MyContext } from "../customTypes.js";
import { warn } from "../log.js";

export function deleteMessageAfter(
  ctx: MyContext,
  messageId: number,
  delay = 5000,
) {
  setTimeout(async () => {
    try {
      await ctx.api.deleteMessage(ctx.chat!.id, messageId);
    } catch (e) {
      warn(`Falha ao deletar mensagem`, {
        msgId: messageId,
        error: e,
      });
    }
  }, delay);
}