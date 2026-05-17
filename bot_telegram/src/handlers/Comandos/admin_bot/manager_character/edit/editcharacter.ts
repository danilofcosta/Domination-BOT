import { prisma } from "../../../../../lib/prisma.js";
import type { MyContext } from "../../../../../utils/customTypes.js";
import { ChatType } from "../../../../../utils/customTypes.js";

export async function editCharHandler(ctx: MyContext) {
  let charid: number | undefined;

  if (ctx.match) {
    charid = Number(ctx.match);
  }

  if (!charid && ctx.message?.reply_to_message) {
    const reply = ctx.message.reply_to_message;
    const text = reply.text || reply.caption || "";
    const match = text.match(/\d+/);
    if (match) {
      charid = Number(match[0]);
    }
  }

  if (!charid || isNaN(charid)) {
    return ctx.reply(ctx.t("error-not-id"));
  }

  const genero = ctx.session.settings.genero || ChatType.WAIFU;
  const isWaifu = genero === ChatType.WAIFU;

  const character = isWaifu
    ? await prisma.characterWaifu.findUnique({
        where: { id: charid },
        include: {
          WaifuRarity: { include: { Rarity: true } },
          WaifuEvent: { include: { Event: true } },
        },
      })
    : await prisma.characterHusbando.findUnique({
        where: { id: charid },
        include: {
          HusbandoRarity: { include: { Rarity: true } },
          HusbandoEvent: { include: { Event: true } },
        },
      });

  if (!character) {
    return ctx.reply(ctx.t("error-character-not-found"));
  }

  await ctx.reply(ctx.t("edit-char-info", { id: character.id, name: character.name, origem: character.origem }), {
    parse_mode: "HTML",
  });
}
