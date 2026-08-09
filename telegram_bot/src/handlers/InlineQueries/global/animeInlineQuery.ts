import { prisma } from "../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { createInlineResult } from "../utils/createInlineResult.js";
import { showResultsInline } from "../utils/showResultsInline.js";

export async function animeInlineQuery(ctx: MyContext) {
  const query = ctx.inlineQuery?.query || "";
  const genero = ctx.botType;

  const animeName = query.replace("anime_", "");

  const characters = genero === ChatType.HUSBANDO
    ? await prisma.characterHusbando.findMany({
        where: { origem: animeName },
        take: 20,
        orderBy: { name: "asc" },
        include: {
          HusbandoRarity: { include: { Rarity: true } },
          HusbandoEvent: { include: { Event: true } },
        },
      })
    : await prisma.characterWaifu.findMany({
        where: { origem: animeName },
        take: 20,
        orderBy: { name: "asc" },
        include: {
          WaifuRarity: { include: { Rarity: true } },
          WaifuEvent: { include: { Event: true } },
        },
      });

  if (characters.length === 0) {
    return await ctx.answerInlineQuery([]);
  }

  const results = characters.map((char: any) =>
    createInlineResult({
      character: char,
      t: ctx.t,
      rawEmoji: true,
      chatType: genero,
    }),
  );

  await showResultsInline({ ctx, results, maxCacheTelegram: false });
}
