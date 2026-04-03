import { prisma } from "../../../../lib/prisma.js";
import { bts_yes_or_no } from "../../../utils/bts.js";
import type { MyContext } from "../../../utils/customTypes.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { ChatType } from "../../../utils/types.js";

export async function favCharacter(ctx: MyContext) {
  let favid: number | undefined;


if (ctx.match) {
  favid = Number(ctx.match);
}
if (!favid && ctx.message?.reply_to_message) {
  const reply = ctx.message.reply_to_message;

  const text =
    reply.text ||
    reply.caption ||
    "";

  const match = text.match(/\d+/); // pega primeiro número

  if (match) {
    favid = Number(match[0]);
  }
}

if (!favid || isNaN(favid)) {
  return ctx.reply(ctx.t("error-not-id"));
}

  const userid = ctx.from!.id;
  // Busca do personagem favorito na coleção do usuário
  const FavCharacter =
    ctx.session.settings.genero === ChatType.WAIFU
      ? await prisma.waifuCollection.findFirst({
          where: {
            characterId: favid,
            userId: ctx.from!.id,
          },
          include: {
            Character: {
              include: {
                WaifuEvent: { include: { Event: true } },
                WaifuRarity: { include: { Rarity: true } },
              },
            },
          },
        })
      : await prisma.husbandoCollection.findFirst({
          where: {
            characterId: favid,
            userId: ctx.from!.id,
          },
          include: {
            Character: {
              include: {
                HusbandoEvent: { include: { Event: true } },
                HusbandoRarity: { include: { Rarity: true } },
              },
            },
          },
        });
  if (!FavCharacter) {
    return ctx.reply(
      ctx.t("fav-not-found", {
        genero: ctx.session.settings.genero.toLocaleLowerCase(),
      }),
    );
  }
  

  // Gerar a legenda usando i18n
  const text = ctx.t("fav-character", {
    id_personagem: favid|| "",
    character_name: FavCharacter.Character.name || "",
    character_anime: FavCharacter.Character.origem || "",
  });

  const reply_markup = bts_yes_or_no(
    ctx,
    `fav_yes_${favid}_${userid}`,
    `fav_no_${favid}_${userid}`,
  );

  return await Sendmedia({
    ctx: ctx,
    per: FavCharacter.Character,
    caption: `<b>${text.trim()}</b>`,
    reply_markup,
  });
}
