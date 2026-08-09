import type { MyContext } from "../../../../utils/customTypes.js";
import { ProfileType } from "../../../../../generated/prisma/client.js";
import {
  getUserRole,
  roleWeights,
} from "../../../../utils/permissions.js";
import { extractUserId } from "../../../../utils/telegram/extractUserId.js";
import { createMentionUser } from "../../../../utils/telegram/createMentionUser.js";
import { CreateButtunConfirmation } from "../../../../utils/buildButtons/createButtonConfirmation.js";
import { sendMessageCustom } from "../../../../utils/sendMessageCustom.js";
import { info, warn, error } from "../../../../utils/log.js";

export async function unadmin(ctx: MyContext) {
  try {
    const mentionedUser = await extractUserId(ctx);
    if (!mentionedUser) {
      await sendMessageCustom({
        ctx,
        caption: ctx.t("unadmin_reply_instruction"),
      });
      return;
    }

    if (mentionedUser.id === ctx.from?.id) {
      warn("unadmin - tentativa de rebaixar a si mesmo", {
        userId: ctx.from?.id,
      });
      await sendMessageCustom({ ctx, caption: ctx.t("unadmin_error_self") });
      return;
    }

    if (mentionedUser.is_bot || mentionedUser.id === ctx.me?.id) {
      warn("unadmin - tentativa de rebaixar um bot", {
        userId: ctx.from?.id,
      });
      await sendMessageCustom({ ctx, caption: ctx.t("unadmin_error_bot") });
      return;
    }

    const executorId = ctx.from?.id ?? 0;
    const targetRole = await getUserRole(mentionedUser.id);

    if (roleWeights[targetRole] < roleWeights[ProfileType.ADMIN]) {
      warn("unadmin - alvo nao e admin ou superior", {
        executorId,
        targetId: mentionedUser.id,
        targetRole,
      });
      await sendMessageCustom({
        ctx,
        caption: ctx.t("unadmin_error_not_admin"),
      });
      return;
    }

    const reply_markup = CreateButtunConfirmation(
      ctx,
      `unadmin_yes_${mentionedUser.id}_${executorId}`,
      `unadmin_no_${mentionedUser.id}_${executorId}`,
      ctx.t("unadmin_btn_confirm"),
      ctx.t("unadmin_btn_cancel"),
    );

    await sendMessageCustom({
      ctx,
      caption: ctx.t("unadmin_confirm", {
        user: createMentionUser({
          Nome: mentionedUser.first_name,
          telegramiduser: mentionedUser.id,
        }),
        role: targetRole,
      }),
      reply_markup,
    });

    info("unadmin - confirmacao solicitada", {
      executorId,
      targetId: mentionedUser.id,
      targetRole,
    });
  } catch (e) {
    error("unadmin - erro ao iniciar rebaixamento", e);
    await sendMessageCustom({
      ctx,
      caption: ctx.t("unadmin_error", { error: "erro interno" }),
    });
  }
}
