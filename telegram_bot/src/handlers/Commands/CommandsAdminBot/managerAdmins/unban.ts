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

export async function unban(ctx: MyContext) {
  try {
    const mentionedUser = await extractUserId(ctx);
    if (!mentionedUser) {
      await sendMessageCustom({
        ctx,
        caption: ctx.t("unban_reply_instruction"),
      });
      return;
    }

    if (mentionedUser.id === ctx.from?.id) {
      warn("unban - tentativa de desbanir a si mesmo", {
        userId: ctx.from?.id,
      });
      await sendMessageCustom({ ctx, caption: ctx.t("unban_error_self") });
      return;
    }

    if (mentionedUser.is_bot || mentionedUser.id === ctx.me?.id) {
      warn("unban - tentativa de desbanir um bot", {
        userId: ctx.from?.id,
      });
      await sendMessageCustom({ ctx, caption: ctx.t("unban_error_bot") });
      return;
    }

    const executorId = ctx.from?.id ?? 0;
    const targetRole = await getUserRole(mentionedUser.id);

    if (roleWeights[targetRole] !== roleWeights[ProfileType.BANNED]) {
      warn("unban - alvo nao esta banido", {
        executorId,
        targetId: mentionedUser.id,
        targetRole,
      });
      await sendMessageCustom({
        ctx,
        caption: ctx.t("unban_error_not_banned"),
      });
      return;
    }

    const reply_markup = CreateButtunConfirmation(
      ctx,
      `unban_yes_${mentionedUser.id}_${executorId}`,
      `unban_no_${mentionedUser.id}_${executorId}`,
      ctx.t("unban_btn_confirm"),
      ctx.t("unban_btn_cancel"),
    );

    await sendMessageCustom({
      ctx,
      caption: ctx.t("unban_confirm", {
        user: createMentionUser({
          Nome: mentionedUser.first_name,
          telegramiduser: mentionedUser.id,
        }),
        role: targetRole,
      }),
      reply_markup,
    });

    info("unban - confirmacao solicitada", {
      executorId,
      targetId: mentionedUser.id,
      targetRole,
    });
  } catch (e) {
    error("unban - erro ao iniciar desbanimento", e);
    await sendMessageCustom({
      ctx,
      caption: ctx.t("unban_error", { error: "erro interno" }),
    });
  }
}
