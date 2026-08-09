import type { MyContext } from "../../../../uteis/CustomTypes.js";
import { HaremHandler } from "../../CommandsUser/harem.js";
import { Extract_id_user } from "../../../../uteis/uteis_telegram/extract_id_user.js";
import { SendMensageCustom } from "../../../../uteis/sendMensageCustom.js";
import { info, error } from "../../../../uteis/log.js";

export async function openharem(ctx: MyContext) {
  try {
    const mentionedUser = await Extract_id_user(ctx);
    if (!mentionedUser) {
      await SendMensageCustom({
        ctx,
        caption: ctx.t("openharem_reply_instruction"),
      });
      return;
    }

    if (mentionedUser.is_bot || mentionedUser.id === ctx.me?.id) {
      await SendMensageCustom({ ctx, caption: ctx.t("openharem_error_bot") });
      return;
    }

    info("openharem - abrindo colecao", {
      executorId: ctx.from?.id,
      targetId: mentionedUser.id,
    });

    await HaremHandler(ctx, mentionedUser.id);
  } catch (e) {
    error("openharem - erro ao abrir colecao", e);
    await SendMensageCustom({
      ctx,
      caption: ctx.t("openharem_error", { error: "erro interno" }),
    });
  }
}
