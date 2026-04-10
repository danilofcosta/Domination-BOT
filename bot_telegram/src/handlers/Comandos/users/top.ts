import { prisma } from "../../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { mentionUser } from "../../../utils/manege_caption/metion_user.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { InlineKeyboard } from "grammy";

export async function topHandler(ctx: MyContext) {
  const isHusbando = ctx.session.settings.genero === ChatType.HUSBANDO;

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
    return ctx.reply("Nenhum usuário no ranking ainda.");
  }

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
    .text(ctx.t("top_btn_close"), "top_close");

  if (character) {
    return Sendmedia({
      ctx,
      per: character,
      caption: text,
      reply_markup: reply_markup,
    });
  }

  return ctx.reply(text);
}
