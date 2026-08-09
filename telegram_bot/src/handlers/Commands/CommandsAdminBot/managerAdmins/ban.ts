import { prisma } from "../../../../lib/prisma.js";
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

export async function ban(ctx: MyContext) {
  try {
    const mentionedUser = await extractUserId(ctx);
    if (!mentionedUser) {
      await sendMessageCustom({
        ctx,
        caption: ctx.t("ban_reply_instruction"),
      });
      return;
    }

    if (mentionedUser.id === ctx.from?.id) {
      warn("ban - tentativa de banir a si mesmo", { userId: ctx.from?.id });
      await sendMessageCustom({ ctx, caption: ctx.t("ban_error_self") });
      return;
    }

    if (mentionedUser.is_bot || mentionedUser.id === ctx.me?.id) {
      warn("ban - tentativa de banir um bot", { userId: ctx.from?.id });
      await sendMessageCustom({ ctx, caption: ctx.t("ban_error_bot") });
      return;
    }

    const executorId = ctx.from?.id ?? 0;
    const executorRole = await getUserRole(executorId);
    const targetRole = await getUserRole(mentionedUser.id);

    if (targetRole === ProfileType.BANNED) {
      await sendMessageCustom({
        ctx,
        caption: ctx.t("ban_error_already_banned"),
      });
      return;
    }

    if (
      roleWeights[targetRole] >= roleWeights[ProfileType.ADMIN] &&
      roleWeights[executorRole] < roleWeights[ProfileType.SUPER_ADMIN]
    ) {
      warn("ban - permissao insuficiente para banir um adm", {
        executorId,
        targetId: mentionedUser.id,
        executorRole,
        targetRole,
      });
      await sendMessageCustom({
        ctx,
        caption: ctx.t("ban_error_need_super_admin"),
      });
      return;
    }

    const reply_markup = CreateButtunConfirmation(
      ctx,
      `ban_yes_${mentionedUser.id}_${executorId}`,
      `ban_no_${mentionedUser.id}_${executorId}`,
      ctx.t("ban_btn_confirm"),
      ctx.t("ban_btn_cancel"),
    );

    await sendMessageCustom({
      ctx,
      caption: ctx.t("ban_confirm", {
        user: createMentionUser({
          Nome: mentionedUser.first_name,
          telegramiduser: mentionedUser.id,
        }),
        role: targetRole,
      }),
      reply_markup,
    });

    info("ban - confirmacao solicitada", {
      executorId,
      executorRole,
      targetId: mentionedUser.id,
      targetRole,
    });
  } catch (e) {
    error("ban - erro ao iniciar ban", e);
    await sendMessageCustom({
      ctx,
      caption: ctx.t("ban_error", { error: "erro interno" }),
    });
  }
}
