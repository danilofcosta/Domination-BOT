import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../../utils/customTypes.js";
import { extractUserId } from "../../../../utils/telegram/extractUserId.js";
import { createMentionUser } from "../../../../utils/telegram/createMentionUser.js";
import { CreateButtunConfirmation } from "../../../../utils/buildButtons/createButtonConfirmation.js";
import { sendMessageCustom } from "../../../../utils/sendMessageCustom.js";
import { info, warn, error } from "../../../../utils/log.js";

export async function cleanCollection(ctx: MyContext) {
  try {
    const mentionedUser = await extractUserId(ctx);
    if (!mentionedUser) {
      await sendMessageCustom({
        ctx,
        caption: ctx.t("clean_reply_instruction"),
      });
      return;
    }

    if (mentionedUser.id === ctx.from?.id) {
      warn("cleanCollection - tentativa de limpar a propria colecao", {
        userId: ctx.from?.id,
      });
      await sendMessageCustom({ ctx, caption: ctx.t("clean_error_self") });
      return;
    }

    if (mentionedUser.is_bot || mentionedUser.id === ctx.me?.id) {
      warn("cleanCollection - tentativa de limpar colecao de um bot", {
        userId: ctx.from?.id,
      });
      await sendMessageCustom({ ctx, caption: ctx.t("clean_error_bot") });
      return;
    }

    const executorId = ctx.from?.id ?? 0;
    const userId = BigInt(mentionedUser.id);

    const [waifuCount, husbandoCount] = await prisma.$transaction([
      prisma.waifuCollection.count({ where: { userId } }),
      prisma.husbandoCollection.count({ where: { userId } }),
    ]);
    const total = waifuCount + husbandoCount;

    if (total === 0) {
      info("cleanCollection - colecao ja vazia", {
        executorId,
        targetId: mentionedUser.id,
      });
      await sendMessageCustom({ ctx, caption: ctx.t("clean_error_nothing") });
      return;
    }

    const reply_markup = CreateButtunConfirmation(
      ctx,
      `clean_yes_${mentionedUser.id}_${executorId}`,
      `clean_no_${mentionedUser.id}_${executorId}`,
      ctx.t("clean_btn_confirm"),
      ctx.t("clean_btn_cancel"),
    );

    await sendMessageCustom({
      ctx,
      caption: ctx.t("clean_confirm", {
        user: createMentionUser({
          Nome: mentionedUser.first_name,
          telegramiduser: mentionedUser.id,
        }),
        count: String(total),
      }),
      reply_markup,
    });

    info("cleanCollection - confirmacao solicitada", {
      executorId,
      targetId: mentionedUser.id,
      total,
    });
  } catch (e) {
    error("cleanCollection - erro ao iniciar limpeza", e);
    await sendMessageCustom({
      ctx,
      caption: ctx.t("clean_error", { error: "erro interno" }),
    });
  }
}
