import type { MyContext } from "../../../../utils/customTypes.js";
import { HaremHandler } from "../../CommandsUser/harem.js";
import { extractUserId } from "../../../../utils/telegram/extractUserId.js";
import { sendMessageCustom } from "../../../../utils/sendMessageCustom.js";
import { info, error } from "../../../../utils/log.js";

export async function openharem(ctx: MyContext) {
  try {
    const mentionedUser = await extractUserId(ctx);
    if (!mentionedUser) {
      await sendMessageCustom({
        ctx,
        caption: ctx.t("openharem_reply_instruction"),
      });
      return;
    }

    if (mentionedUser.is_bot || mentionedUser.id === ctx.me?.id) {
      await sendMessageCustom({ ctx, caption: ctx.t("openharem_error_bot") });
      return;
    }

    info("openharem - abrindo colecao", {
      executorId: ctx.from?.id,
      targetId: mentionedUser.id,
    });

    await HaremHandler(ctx, mentionedUser.id);
  } catch (e) {
    error("openharem - erro ao abrir colecao", e);
    await sendMessageCustom({
      ctx,
      caption: ctx.t("openharem_error", { error: "erro interno" }),
    });
  }
}
