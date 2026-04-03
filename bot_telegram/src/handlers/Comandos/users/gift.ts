import { prisma } from "../../../../lib/prisma.js";
import { SetGiftUser } from "../../../cache/cache.js";
import { bts_yes_or_no } from "../../../utils/bts.js";
import type { MyContext } from "../../../utils/customTypes.js";
import { mentionUser } from "../../../utils/metion_user.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { ChatType } from "../../../utils/types.js";

export async function giftHandler(ctx: MyContext) {
  if (!ctx.message?.reply_to_message) {
    await ctx.reply(ctx.t("gift_reply_instruction"));
    return;
  }

  const giftid = Number(ctx.match);
  if (!giftid || isNaN(giftid)) {
    await ctx.reply(ctx.t("error-not-id"));
    return;
  }

  const mentionedUser = ctx.message.reply_to_message.from;

  if (!mentionedUser?.id) {
    await ctx.reply("Usuário inválido.");
    return;
  }

  if (mentionedUser.id === ctx.from?.id) {
    await ctx.reply("Você não pode enviar presente para si mesmo.");
    return;
  }
  if (mentionedUser.id === ctx.me?.id) {
    await ctx.reply("agradeço, Mais não posso receber presentes ");
    return;
  }

  const mention = mentionUser(mentionedUser.first_name, mentionedUser.id);

  const GiftCharacter =
    ctx.session.settings.genero === ChatType.WAIFU
      ? await prisma.waifuCollection.findFirst({
          where: {
            characterId: giftid,
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
            characterId: giftid,
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

  if (!GiftCharacter) {
    await ctx.reply(
      ctx.t("fav-not-found", {
        genero: ctx.session.settings.genero.toLowerCase(),
      }),
    );
    return;
  }

  const characterData =
    ctx.session.settings.genero === ChatType.WAIFU
      ? (GiftCharacter as any).Character
      : (GiftCharacter as any).Character;

  const text = ctx.t("gift_confirmation_message", {
    username: mention,
    character_name: characterData.name,
    character_anime: characterData.origem,
  });

  const reply_markup = bts_yes_or_no(
    ctx,
    `gift_yes_${giftid}_${mentionedUser.id}_${ctx.from?.id}`,
    `gift_no_${giftid}_${mentionedUser.id}_${ctx.from?.id}`,
  );
  SetGiftUser(mentionedUser.id, {
    fromuser: mentionedUser,
  });

  return await Sendmedia({
    ctx,
    per: characterData,
    caption: text,
    reply_markup,
  });
}
