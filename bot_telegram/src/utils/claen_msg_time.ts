import type { MyContext } from "./customTypes.js";
import { error } from "./log.js";

export function ClenMgsTime(ctx: MyContext,timeMs:number=2000) {
  try {
    setTimeout(() => {
      if (!ctx.chat!.id || !ctx.msg?.message_id) {
        return console.log("n tem id");
      }
      ctx.api.deleteMessage(ctx.chat!.id, ctx.msg?.message_id!).catch((e) => {
        error("sucess ao enviar mensagem de nome incorreto", e);
      });
    }, timeMs);
  } catch (e) {
    error("Erro ao enviar mensagem de nome incorreto", e);
  }
}
