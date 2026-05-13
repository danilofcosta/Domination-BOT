import { prisma } from "../../lib/prisma.js";
import { ChatType, type MyContext } from "../../utils/customTypes.js";
import { createResult } from "./create_inline_result.js";

export async function animeInlineQuery(ctx: MyContext) {
  const query = ctx.inlineQuery?.query || '';
  const genero = (ctx.session.settings?.genero || process.env.TYPE_BOT || 'waifu') as ChatType;

  const animeName = query.replace('anime_', '');

  const characters = genero === ChatType.HUSBANDO
    ? await prisma.characterHusbando.findMany({
        where: { origem: animeName },
        take: 50,
        orderBy: { name: 'asc' },
        include: {
          HusbandoRarity: { include: { Rarity: true } },
          HusbandoEvent: { include: { Event: true } },
        },
      })
    : await prisma.characterWaifu.findMany({
        where: { origem: animeName },
        take: 50,
        orderBy: { name: 'asc' },
        include: {
          WaifuRarity: { include: { Rarity: true } },
          WaifuEvent: { include: { Event: true } },
        },
      });

  if (characters.length === 0) {
    return await ctx.answerInlineQuery([]);
  }

  const results = characters.map((char: any) => {
    return createResult({
      character: char,
      ctx,
      noformat: true,
      chatType: genero,
    });
  });

  return await ctx.answerInlineQuery(results as any);
}
