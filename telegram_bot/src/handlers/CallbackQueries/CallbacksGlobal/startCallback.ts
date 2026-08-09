import type { MyContext } from "../../../utils/customTypes.js";
import { sendMessageCustom } from "../../../utils/sendMessageCustom.js";
import { getLatestCharacter } from "../../../utils/extras/getLatestCharacter.js";
import { info, warn, error } from "../../../utils/log.js";
import { guiaHandler } from "./guiaHandler.js";

export async function startCallback(ctx: MyContext) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  try {
    if (data.startsWith("start_guia_")) {
      info("start - guia solicitado", { fromId: ctx.from?.id });
      await guiaHandler(ctx);
      return;
    }

    // if (data.startsWith("start_redirect_")) {
    //   info("start - redirecionando para ultimo personagem", {
    //     fromId: ctx.from?.id,
    //   });
    //   const character = await getLatestCharacter(ctx.botType);
    //   if (character) {
    //     await sendMessageCustom({
    //       ctx,
    //       character,
    //       caption: ctx.t("start_redirect_caption"),
    //     });
    //   } else {
    //     await sendMessageCustom({
    //       ctx,
    //       caption: ctx.t("start_redirect_empty"),
    //     });
    //   }
    //   await ctx.answerCallbackQuery();
    //   return;
    // }
  } catch (e) {
    error("start - erro no callback", e);
    await ctx.answerCallbackQuery("❌ Erro");
  }
}
