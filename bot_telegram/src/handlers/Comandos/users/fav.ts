import { prisma } from "../../../../lib/prisma.js";
import { bts_yes_or_no } from "../../../utils/btns.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { info, warn, error, debug } from "../../../utils/log.js";

export async function favCharacter(ctx: MyContext) {
  let favid: number | undefined;

  if (ctx.match) {
    favid = Number(ctx.match);
  }
  if (!favid && ctx.message?.reply_to_message) {
    const reply = ctx.message.reply_to_message;

    const text = reply.text || reply.caption || "";

    const match = text.match(/\d+/); // pega primeiro número

    if (match) {
      favid = Number(match[0]);
    }
  }

  if (!favid || isNaN(favid)) {
    warn(`favCharacter - ID inválido`, {
      userId: ctx.from?.id,
      favid,
      match: ctx.match,
    });
    return ctx.reply(ctx.t("error-not-id"));
  }

  const userid = ctx.from!.id;
  info(`favCharacter - buscando personagem`, { userId: userid, favid });

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
    warn(`favCharacter - personagem não encontrado na coleção`, {
      userId: userid,
      favid,
    });
    return ctx.reply(
      ctx.t("fav-not-found", {
        genero: ctx.session.settings.genero.toLocaleLowerCase(),
      }),
    );
  }

  debug(`favCharacter - personagem encontrado`, {
    userId: userid,
    favid,
    charName: FavCharacter.Character.name,
  });

  const text = ctx.t("fav-character", {
    id_personagem: favid || "",
    character_name: FavCharacter.Character.name || "",
    character_anime: FavCharacter.Character.origem || "",
  });

  const reply_markup = bts_yes_or_no(
    ctx,
    `fav_yes_${favid}_${userid}`,
    `fav_no_${favid}_${userid}`,
  );

  try {
    await Sendmedia({
      ctx: ctx,
      per: FavCharacter.Character,
      caption: `<b>${text.trim()}</b>`,
      reply_markup,
    });
  } catch (e) {
    error(`favCharacter - erro ao enviar mídia`, e);
  }
}
