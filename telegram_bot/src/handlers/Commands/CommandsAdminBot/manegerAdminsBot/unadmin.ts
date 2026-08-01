import type { MyContext } from "../../../../uteis/CustomTypes.js";
import { ProfileType } from "../../../../../generated/prisma/client.js";
import {
  getUserRole,
  roleWeights,
} from "../../../../uteis/permissions.js";
import { Extract_id_user } from "../../../../uteis/uteis_telegram/extract_id_user.js";
import { CreateMentionUser } from "../../../../uteis/uteis_telegram/CreateMentionUser.js";
import { CreateButtunConfirmation } from "../../../../uteis/buildButtons/createButtonConfirmation.js";
import { SendMensageCustom } from "../../../../uteis/sendMensageCustom.js";
import { info, warn, error } from "../../../../uteis/log.js";

export async function unadmin(ctx: MyContext) {
  try {
    const mentionedUser = await Extract_id_user(ctx);
    if (!mentionedUser) {
      await SendMensageCustom({
        ctx,
        caption: ctx.t("unadmin_reply_instruction"),
      });
      return;
    }

    if (mentionedUser.id === ctx.from?.id) {
      warn("unadmin - tentativa de rebaixar a si mesmo", {
        userId: ctx.from?.id,
      });
      await SendMensageCustom({ ctx, caption: ctx.t("unadmin_error_self") });
      return;
    }

    if (mentionedUser.is_bot || mentionedUser.id === ctx.me?.id) {
      warn("unadmin - tentativa de rebaixar um bot", {
        userId: ctx.from?.id,
      });
      await SendMensageCustom({ ctx, caption: ctx.t("unadmin_error_bot") });
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
      await SendMensageCustom({
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

    await SendMensageCustom({
      ctx,
      caption: ctx.t("unadmin_confirm", {
        user: CreateMentionUser({
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
    await SendMensageCustom({
      ctx,
      caption: ctx.t("unadmin_error", { error: "erro interno" }),
    });
  }
}
