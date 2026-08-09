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

export async function upadmin(ctx: MyContext) {
  try {
    const mentionedUser = await extractUserId(ctx);
    if (!mentionedUser) {
      await sendMessageCustom({
        ctx,
        caption: ctx.t("upadmin_reply_instruction"),
      });
      return;
    }

    if (mentionedUser.id === ctx.from?.id) {
      warn("upadmin - tentativa de promover a si mesmo", {
        userId: ctx.from?.id,
      });
      await sendMessageCustom({ ctx, caption: ctx.t("upadmin_error_self") });
      return;
    }

    if (mentionedUser.is_bot || mentionedUser.id === ctx.me?.id) {
      warn("upadmin - tentativa de promover um bot", {
        userId: ctx.from?.id,
      });
      await sendMessageCustom({ ctx, caption: ctx.t("upadmin_error_bot") });
      return;
    }

    const executorId = ctx.from?.id ?? 0;
    const targetRole = await getUserRole(mentionedUser.id);

    if (roleWeights[targetRole] >= roleWeights[ProfileType.ADMIN]) {
      warn("upadmin - alvo ja e admin ou superior", {
        executorId,
        targetId: mentionedUser.id,
        targetRole,
      });
      await sendMessageCustom({
        ctx,
        caption: ctx.t("upadmin_error_already_admin"),
      });
      return;
    }

    const reply_markup = CreateButtunConfirmation(
      ctx,
      `upadmin_yes_${mentionedUser.id}_${executorId}`,
      `upadmin_no_${mentionedUser.id}_${executorId}`,
      ctx.t("upadmin_btn_confirm"),
      ctx.t("upadmin_btn_cancel"),
    );

    await sendMessageCustom({
      ctx,
      caption: ctx.t("upadmin_confirm", {
        user: createMentionUser({
          Nome: mentionedUser.first_name,
          telegramiduser: mentionedUser.id,
        }),
        role: targetRole,
      }),
      reply_markup,
    });

    info("upadmin - confirmacao solicitada", {
      executorId,
      targetId: mentionedUser.id,
      targetRole,
    });
  } catch (e) {
    error("upadmin - erro ao iniciar promocao", e);
    await sendMessageCustom({
      ctx,
      caption: ctx.t("upadmin_error", { error: "erro interno" }),
    });
  }
}
