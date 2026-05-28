import { prisma } from "../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
//topuser_ ation
export async function topCallbackQuery(ctx: MyContext) {
  console.log("comando top ");
  const parts = ctx.match ? (ctx.match as any).input.split("_") : [];
  const [Command, action] = parts;

  if (action === "position") {
    const userId = ctx.from?.id;

    if (!userId) {
      return ctx.answerCallbackQuery({
        text: ctx.t("topcb-not-identified"),
        show_alert: true,
      });
    }

    const isHusbando = ctx.botType === ChatType.HUSBANDO;

    const ranking = isHusbando
      ? await prisma.husbandoCollection.groupBy({
          by: ["userId"],
          _count: { characterId: true },
          orderBy: {
            _count: { characterId: "desc" },
          },
        })
      : await prisma.waifuCollection.groupBy({
          by: ["userId"],
          _count: { characterId: true },
          orderBy: {
            _count: { characterId: "desc" },
          },
        });

    // encontrar posição do usuário
    const position = ranking.findIndex((r) => Number(r.userId) === userId);

    if (position === -1) {
      return ctx.answerCallbackQuery({
        text: ctx.t("topcb-not-ranked"),
        show_alert: true,
      });
    }

    const userData = ranking[position]!;

    return ctx.answerCallbackQuery({
      text: ctx.t("topcb-position", { position: position + 1, total: ranking.length }),
      show_alert: true,
    });
  }

  if (action === "close") {
    try {
      ctx.deleteMessage();
    } catch {
      return;
    }
  }
}
