import { prisma } from "../../../../lib/prisma.js";
import { bts_yes_or_no } from "../../../utils/bts.js";
import type { MyContext } from "../../../utils/customTypes.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { ChatType } from "../../../utils/types.js";

;
export async function favCharacter(ctx: MyContext) {
  if (!ctx.match) {
    return ctx.reply(ctx.t("error-not-id"));
  }
  console.log("favCharacter:", ctx.match);
  const favid = Number(ctx.match);

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
            character: {
              include: {
                events: { include: { event: true } },
                rarities: { include: { rarity: true } },
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
            character: {
              include: {
                events: { include: { event: true } },
                rarities: { include: { rarity: true } },
              },
            },
          },
        });
  if (!FavCharacter) {
    return ctx.reply(
      ctx.t("fav-not-found", { genero: ctx.session.settings.genero.toLocaleLowerCase() }),
    );
  }
  console.log(" character encontrado:");
  // Determinar se é waifu ou husbando e extrair os dados do personagem
  const characterData =
    "characters_waifu" in FavCharacter
      ? FavCharacter.character
      : FavCharacter.character;

  // Gerar a legenda usando i18n
  const text = ctx.t("fav-character", {
    id_personagem: ctx.match[1] || "",
    character_name: characterData.name || "",
    character_anime: characterData.origem || "",
  });

  const reply_markup = bts_yes_or_no(
    ctx,
    `fav_yes_${favid}_${userid}`,
    `fav_no_${favid}_${userid}`,
  );

  return await Sendmedia({ctx: ctx, per: characterData, caption: text, reply_markup});
}
