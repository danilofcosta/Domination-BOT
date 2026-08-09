import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../../utils/customTypes.js";
import { ProfileType } from "../../../../../generated/prisma/client.js";
import { onlyRoleBotAdmin } from "../../../../utils/permissions.js";
import { setHarem } from "../../../../cache/cache.js";
import { editOrSendText } from "../../../../utils/telegram/editOrSendText.js";
import { info, warn, error } from "../../../../utils/log.js";

export async function cleanCollectionCallback(ctx: MyContext) {
  await onlyRoleBotAdmin(ProfileType.ADMIN)(ctx, async () => {
    await cleanCollectionCallbackService(ctx);
  });
}

async function cleanCollectionCallbackService(ctx: MyContext) {
  try {
    const data = ctx.callbackQuery?.data;
    if (!data) return;

    const match = data.match(/^clean_(yes|no)_(-?\d+)_(-?\d+)$/);
    if (!match) {
      await ctx.answerCallbackQuery();
      return;
    }

    const action = match[1]!;
    const targetId = Number(match[2]!);
    const executorId = Number(match[3]!);

    if (ctx.from?.id !== executorId) {
      warn("cleanCollection - callback de outro usuario", {
        fromId: ctx.from?.id,
        executorId,
        targetId,
      });
      await ctx.answerCallbackQuery(ctx.t("clean_error_not_requester"));
      return;
    }

    if (action === "no") {
      info("cleanCollection - cancelado pelo executor", {
        executorId,
        targetId,
      });
      await editOrSendText({ ctx, caption: ctx.t("clean_cancelled") });
      return;
    }

    const userId = BigInt(targetId);

    const [waifuResult, husbandoResult] = await prisma.$transaction([
      prisma.waifuCollection.deleteMany({ where: { userId } }),
      prisma.husbandoCollection.deleteMany({ where: { userId } }),
    ]);

    setHarem(targetId, null);

    const total = waifuResult.count + husbandoResult.count;

    info("cleanCollection - colecao limpa", {
      executorId,
      targetId,
      deleted: total,
    });
    await editOrSendText({
      ctx,
      caption: ctx.t("clean_success", { count: String(total) }),
    });
  } catch (e) {
    error("cleanCollection - erro ao limpar colecao", e);
    await ctx.answerCallbackQuery(
      ctx.t("clean_error", { error: "erro interno" }),
    );
  }
}
