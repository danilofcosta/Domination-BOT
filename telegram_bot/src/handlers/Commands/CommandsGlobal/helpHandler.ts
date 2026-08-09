import type { MyContext } from "../../../utils/customTypes.js";
import { debug } from "../../../utils/log.js";
import { guiaHandler } from "../../CallbackQueries/CallbacksGlobal/guiaHandler.js";

export async function helpHandler(ctx: MyContext) {
  if (ctx.chat?.type !== "private") return debug("Comando help ignorado em", ctx.chat?.type, "executado por", ctx.from?.username);
  await guiaHandler(ctx);
}
