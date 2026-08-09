import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../../uteis/CustomTypes.js";
import { ProfileType } from "../../../../../generated/prisma/client.js";
import {
  getUserRole,
  onlyRoleBotAdmin,
  roleWeights,
} from "../../../../uteis/permissions.js";
import { permissionCache } from "../../../../cache/cache.js";
import { EditOrSendText } from "../../../../uteis/uteis_telegram/EditOrSendText.js";
import { info, warn, error } from "../../../../uteis/log.js";

export async function upadminCallback(ctx: MyContext) {
  await onlyRoleBotAdmin(ProfileType.SUPER_ADMIN)(ctx, async () => {
    await upadminCallbackService(ctx);
  });
}

async function upadminCallbackService(ctx: MyContext) {
  try {
    const data = ctx.callbackQuery?.data;
    if (!data) return;

    const match = data.match(/^upadmin_(yes|no)_(-?\d+)_(-?\d+)$/);
    if (!match) {
      await ctx.answerCallbackQuery();
      return;
    }

    const action = match[1]!;
    const targetId = Number(match[2]!);
    const executorId = Number(match[3]!);

    if (ctx.from?.id !== executorId) {
      warn("upadmin - callback de outro usuario", {
        fromId: ctx.from?.id,
        executorId,
        targetId,
      });
      await ctx.answerCallbackQuery(ctx.t("upadmin_error_not_requester"));
      return;
    }

    if (action === "no") {
      info("upadmin - cancelado pelo executor", { executorId, targetId });
      await EditOrSendText({ ctx, caption: ctx.t("upadmin_cancelled") });
      return;
    }

    const targetRole = await getUserRole(targetId);

    if (roleWeights[targetRole] >= roleWeights[ProfileType.ADMIN]) {
      warn("upadmin - alvo ja e admin ou superior no confirmacao", {
        executorId,
        targetId,
        targetRole,
      });
      await ctx.answerCallbackQuery(ctx.t("upadmin_error_already_admin"));
      return;
    }

    await prisma.telegramUser.upsert({
      where: { telegramId: BigInt(targetId) },
      update: { profileType: ProfileType.ADMIN },
      create: {
        telegramId: BigInt(targetId),
        profileType: ProfileType.ADMIN,
        telegramData: {},
        waifuConfig: {},
        husbandoConfig: {},
      },
    });

    permissionCache.delete(String(targetId));

    info("upadmin - usuario promovido", {
      executorId,
      targetId,
    });
    await EditOrSendText({ ctx, caption: ctx.t("upadmin_success") });
  } catch (e) {
    error("upadmin - erro ao promover usuario", e);
    await ctx.answerCallbackQuery(
      ctx.t("upadmin_error", { error: "erro interno" }),
    );
  }
}
