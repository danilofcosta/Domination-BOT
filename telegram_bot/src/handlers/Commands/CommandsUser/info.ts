import { prisma } from "../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { error, info } from "../../../utils/log.js";
import { sendMessageCustom } from "../../../utils/sendMessageCustom.js";
import { createMentionUser } from "../../../utils/telegram/createMentionUser.js";
import { extractUserId } from "../../../utils/telegram/extractUserId.js";

export async function InfoHandler(ctx: MyContext) {
  try {
    const mentionedUser = await extractUserId(ctx);
    const targetId = mentionedUser?.id ?? ctx.from?.id ?? 0;

    const isHusbando = ctx.botType === ChatType.HUSBANDO;

    const user = await prisma.telegramUser.findUnique({
      where: { telegramId: BigInt(targetId) },
      select: {
        telegramData: true,
        profileType: true,
      },
    });

    const telegramData = (user?.telegramData ?? {}) as Record<string, any>;
    const firstName =
      telegramData.first_name || mentionedUser?.first_name || "user";
    const username = telegramData.username || mentionedUser?.username || "";

    const userTotal = isHusbando
      ? await prisma.husbandoCollection.count({
          where: { userId: BigInt(targetId) },
        })
      : await prisma.waifuCollection.count({
          where: { userId: BigInt(targetId) },
        });

    const dbTotal = isHusbando
      ? await prisma.characterHusbando.count()
      : await prisma.characterWaifu.count();

    const rankGroup = isHusbando
      ? await prisma.husbandoCollection.groupBy({
          by: ["userId"],
          _count: { characterId: true },
          having: { characterId: { _count: { gt: userTotal } } },
        })
      : await prisma.waifuCollection.groupBy({
          by: ["userId"],
          _count: { characterId: true },
          having: { characterId: { _count: { gt: userTotal } } },
        });

    const globalRank = rankGroup.length + 1;

    const profileType = String(user?.profileType ?? "USER");

    const text = [
      ctx.t("info_id", { id: String(targetId) }),
      ctx.t("info_name", {
        user: createMentionUser({ Nome: firstName, telegramiduser: targetId }),
      }),
      ctx.t("info_username", { username: username ? `@${username}` : "—" }),
      ctx.t("info_status", { status: profileType }),
      ctx.t("info_total", {
        genero: ctx.botType,
        userTotal: String(userTotal),
        dbTotal: String(dbTotal),
      }),
      ctx.t("info_rank", { rank: String(globalRank) }),
    ].join("\n");

    info("InfoHandler - info exibida", {
      executorId: ctx.from?.id,
      targetId,
    });

    await sendMessageCustom({ ctx, caption: text });
  } catch (e) {
    error("InfoHandler - erro ao exibir info", e);
    await sendMessageCustom({
      ctx,
      caption: ctx.t("info_error", { error: "erro interno" }),
    });
  }
}
