import { ProfileType } from "../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";
import type { MyContext } from "../../utils/customTypes.js";

export async function emoji_id(ctx: MyContext) {
  console.log("buscando infos da mensagem");
  if (!ctx.message?.reply_to_message) {
    console.log("mensagem vazia");
    return;
  }
  ctx.reply(JSON.stringify(ctx.message?.reply_to_message));
}
//  await Sendmedia(ctx, character_db as characters_husbando, capiton);

// }
export async function add_evento(ctx: MyContext) {
  try {
    const s = await prisma.characterHusbando.update({
      where: { id: 3 },
      data: {
        // HusbandoEvent: {
        //   create: { Event: { connect: { id:  3} } }  // creates a record in HusbandoEvent linking character 3 to event 1
        // }
        HusbandoRarity: {
          create: { Rarity: { connect: { id: 1 } } }, // creates a record in HusbandoRarity linking character
        },
      },
    });
    return ctx.reply(JSON.stringify(s));
  } catch (err) {
    console.error(err);
    return ctx.reply("Failed to update character.");
  }
}

export function testeemoj(ctx: MyContext) {
  const rarity_emoji_local =
    '<tg-emoji emoji-id="5325547803936572038">✨</tg-emoji>';
  const rarity_emoji_globalapis =
    '<tg-emoji emoji-id="5395444784611480792">✏️</tg-emoji>';

  ctx.reply(rarity_emoji_local, { parse_mode: "HTML" });
  ctx.reply(rarity_emoji_globalapis, { parse_mode: "HTML" });
}

export async function teste(ctx: MyContext) {
  try {
    const s = await prisma.characterHusbando.findFirst({
      where: { id: 3 },
      include: {
        HusbandoEvent: { include: { Event: true } },
        HusbandoRarity: { include: { Rarity: true } },
      },
    });
    return ctx.reply(JSON.stringify(s, null, 2));
  } catch (err) {
    console.error(err);
    return ctx.reply("Failed to update character.");
  }
}
export async function createSecureServer(ctx: MyContext) {
  const userId = ctx.from?.id;

  // Validação básica
  if (!userId) {
    await ctx.reply("Erro: usuário não identificado.");
    return;
  }

  try {
    const user = await prisma.user.upsert({
      where: { telegramId: Number(userId) },
      update: {}, // mantém vazio se não quiser atualizar nada
      create: {
        telegramId: Number(userId),
        telegramData: (ctx.from ?? {}) as Record<string, any>,
        favoriteWaifuId: null,
        favoriteHusbandoId: null,
        waifuConfig: {},
        husbandoConfig: {},
        profileType:
          Number(userId) === Number(process.env.CHAT_ID_DEV)
            ? ProfileType.SUPREME
            : ProfileType.USER,
      },
    });

    if (user) {
      await ctx.reply("Usuário criado com sucesso ✅");
    }
  } catch (error) {
    console.error("Erro ao criar usuário:", error);

    await ctx.reply("Erro ao criar usuário ❌");
  }
}