import { prisma } from "../../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { mentionUser } from "../../../utils/manege_caption/metion_user.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { InlineKeyboard } from "grammy";
import { info, warn, error, debug } from "../../../utils/log.js";

export async function topHandler(ctx: MyContext) {
  const isHusbando = ctx.session.settings.genero === ChatType.HUSBANDO;
  info(`topHandler - carregando ranking`, { userId: ctx.from?.id, genero: ctx.session.settings.genero });

  const ranking = isHusbando
    ? await prisma.husbandoCollection.groupBy({
        by: ["userId"],
        _count: {
          characterId: true,
        },
        orderBy: {
          _count: {
            characterId: "desc",
          },
        },
        take: 10,
      })
    : await prisma.waifuCollection.groupBy({
        by: ["userId"],
        _count: {
          characterId: true,
        },
        orderBy: {
          _count: {
            characterId: "desc",
          },
        },
        take: 10,
      });

  if (!ranking.length) {
    warn(`topHandler - ranking vazio`, { userId: ctx.from?.id });
    return ctx.reply("Nenhum usuário no ranking ainda.");
  }

  debug(`topHandler - usuários no ranking`, { count: ranking.length });

  const users = await prisma.user.findMany({
    where: {
      telegramId: {
        in: ranking.map((r) => r.userId),
      },
    },
    select: {
      telegramId: true,
      telegramData: true,
    },
  });

  const userMap = new Map(
    users.map((u) => [Number(u.telegramId), u.telegramData as any]),
  );

  const top_users: string[] = [];

  ranking.forEach((item, index) => {
    const userData = userMap.get(Number(item.userId)) ?? {};

    const name = userData.first_name || userData.username || "user";

    const mention = mentionUser(name, Number(item.userId));

    top_users.push(` ${index + 1}. ${mention} — ${item._count.characterId}`);
  });

  const text = [ctx.t("top_header"), "", ...top_users].join("\n");

  const character = isHusbando
    ? await prisma.characterHusbando.findFirst({
        orderBy: { id: "desc" },
      })
    : await prisma.characterWaifu.findFirst({
        orderBy: { id: "desc" },
      });

  const reply_markup = new InlineKeyboard()
    .text(ctx.t("top_user_btn"), "topuser_position")
    .row()
    .text(ctx.t("top_btn_close"), "topuser_close");

  if (character) {
    try {
      return Sendmedia({
        ctx,
        per: character,
        caption: text,
        reply_markup: reply_markup,
      });
    } catch (e) {
      error(`topHandler - erro ao enviar mídia`, e);
      return ctx.reply(text);
    }
  }

  return ctx.reply(text);
}
