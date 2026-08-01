import type { MyContext } from "../../../uteis/CustomTypes.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";
import { getLatestCharacter } from "../../../uteis/extras/getLatestCharacter.js";
import { info, warn, error } from "../../../uteis/log.js";

export async function startCallback(ctx: MyContext) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  try {
    if (data.startsWith("start_guia_")) {
      info("start - guia solicitado", { fromId: ctx.from?.id });
      await SendMensageCustom({
        ctx,
        caption: ctx.t("start_guia_text"),
      });
      await ctx.answerCallbackQuery();
      return;
    }

    // if (data.startsWith("start_redirect_")) {
    //   info("start - redirecionando para ultimo personagem", {
    //     fromId: ctx.from?.id,
    //   });
    //   const character = await getLatestCharacter(ctx.botType);
    //   if (character) {
    //     await SendMensageCustom({
    //       ctx,
    //       character,
    //       caption: ctx.t("start_redirect_caption"),
    //     });
    //   } else {
    //     await SendMensageCustom({
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
