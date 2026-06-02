import { prisma } from "../../../lib/prisma.js";
import type { CharListData } from "../../../cache/cache.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { createResult } from "../create_inline_result.js";

export async function inline_per(ctx: MyContext, charListData: CharListData) {
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

  const results = characters.map((char: any) => {
    return createResult({
      character: char,
      t: ctx.t,
      noformat: true,
      chatType: genero,
    });
  });

  return results;
}
