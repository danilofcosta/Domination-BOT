import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../utils/customTypes.js";
import { mentionUser } from "../../../utils/metion_user.js";
import { ChatType } from "../../../utils/types.js";
import { Sendmedia } from "../../../utils/sendmedia.js";

export async function topHandler(ctx: MyContext) {
  const isHusbando = ctx.session.settings.genero === ChatType.HUSBANDO;

  // 1️⃣ ranking direto no banco (MUITO mais eficiente)
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

  // 2️⃣ buscar usuários
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

  // 3️⃣ montar ranking
  const top_users: string[] = [];

  ranking.forEach((item, index) => {
    const userData = userMap.get(Number(item.userId)) ?? {};

    const name = userData.first_name || userData.username || "user";

    const mention = mentionUser(name, Number(item.userId));

    top_users.push(` ${index + 1}. ${mention} — ${item._count.characterId}`);
  });

  // 4️⃣ texto final
  const text = [ctx.t("top_header"), "", ...top_users].join("\n");

  // 5️⃣ pegar último personagem (visual)
  const character = isHusbando
    ? await prisma.characterHusbando.findFirst({
        orderBy: { id: "desc" },
      })
    : await prisma.characterWaifu.findFirst({
        orderBy: { id: "desc" },
      });

  if (character) {
    return Sendmedia({
      ctx,
      per: character,
      caption: text,
    });
  }

  return ctx.reply(text);
}
