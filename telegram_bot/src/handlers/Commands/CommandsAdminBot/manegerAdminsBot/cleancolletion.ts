import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../../uteis/CustomTypes.js";
import { Extract_id_user } from "../../../../uteis/uteis_telegram/extract_id_user.js";
import { CreateMentionUser } from "../../../../uteis/uteis_telegram/CreateMentionUser.js";
import { CreateButtunConfirmation } from "../../../../uteis/buildButtons/createButtonConfirmation.js";
import { SendMensageCustom } from "../../../../uteis/sendMensageCustom.js";
import { info, warn, error } from "../../../../uteis/log.js";

export async function cleancolletion(ctx: MyContext) {
  try {
    const mentionedUser = await Extract_id_user(ctx);
    if (!mentionedUser) {
      await SendMensageCustom({
        ctx,
        caption: ctx.t("clean_reply_instruction"),
      });
      return;
    }

    if (mentionedUser.id === ctx.from?.id) {
      warn("cleancolletion - tentativa de limpar a propria colecao", {
        userId: ctx.from?.id,
      });
      await SendMensageCustom({ ctx, caption: ctx.t("clean_error_self") });
      return;
    }

    if (mentionedUser.is_bot || mentionedUser.id === ctx.me?.id) {
      warn("cleancolletion - tentativa de limpar colecao de um bot", {
        userId: ctx.from?.id,
      });
      await SendMensageCustom({ ctx, caption: ctx.t("clean_error_bot") });
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
      info("cleancolletion - colecao ja vazia", {
        executorId,
        targetId: mentionedUser.id,
      });
      await SendMensageCustom({ ctx, caption: ctx.t("clean_error_nothing") });
      return;
    }

    const reply_markup = CreateButtunConfirmation(
      ctx,
      `clean_yes_${mentionedUser.id}_${executorId}`,
      `clean_no_${mentionedUser.id}_${executorId}`,
      ctx.t("clean_btn_confirm"),
      ctx.t("clean_btn_cancel"),
    );

    await SendMensageCustom({
      ctx,
      caption: ctx.t("clean_confirm", {
        user: CreateMentionUser({
          Nome: mentionedUser.first_name,
          telegramiduser: mentionedUser.id,
        }),
        count: String(total),
      }),
      reply_markup,
    });

    info("cleancolletion - confirmacao solicitada", {
      executorId,
      targetId: mentionedUser.id,
      total,
    });
  } catch (e) {
    error("cleancolletion - erro ao iniciar limpeza", e);
    await SendMensageCustom({
      ctx,
      caption: ctx.t("clean_error", { error: "erro interno" }),
    });
  }
}
