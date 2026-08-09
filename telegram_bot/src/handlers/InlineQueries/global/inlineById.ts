import { prisma } from "../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../uteis/CustomTypes.js";
import { createResult } from "../uteis/create_inline_result.js";

export async function inline_per(ctx: MyContext, charListData: { userId: number; characterIds: number[]; genero: string }) {
  const genero = ctx.botType;

  const characters = await (genero === ChatType.HUSBANDO
    ? prisma.characterHusbando.findMany({
        where: { id: { in: charListData.characterIds } },
        take: 20,
        include: {
          HusbandoEvent: { include: { Event: true } },
          HusbandoRarity: { include: { Rarity: true } },
        },
      })
    : prisma.characterWaifu.findMany({
        where: { id: { in: charListData.characterIds } },
        take: 20,
        include: {
          WaifuEvent: { include: { Event: true } },
          WaifuRarity: { include: { Rarity: true } },
        },
      }));

  const results = characters.map((char: any) =>
    createResult({
      character: char,
      t: ctx.t,
      rawEmoji: true,
      chatType: genero,
    }),
  );

  return results;
}
