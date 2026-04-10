import { ProfileType } from "../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";
import type { MyContext } from "../../utils/customTypes.js";


interface Entities {
  offset:number
  length:number
  type:string
custom_emoji_id:string|null|undefined
}
export async function emoji_id(ctx: MyContext) {
  if (!ctx.message?.reply_to_message) return;

  const msg = ctx.message.reply_to_message;
  const text = msg.text || "";
  const entities = msg.entities || [];

  let result = "";
  let currentIndex = 0;

  for (const entity of entities) {
    // adiciona texto normal antes da entity
    result += text.slice(currentIndex, entity.offset);

    if (entity.type === "custom_emoji") {
      const emoji = text.slice(entity.offset, entity.offset + entity.length);
      const id = (entity as any).custom_emoji_id;

      result += `<code>${id}</code> ${emoji } <tg-emoji emoji-id="${id}">${emoji}</tg-emoji>`;
    } else {
      // texto normal (ou outros tipos)
      result += text.slice(entity.offset, entity.offset + entity.length);
    }

    currentIndex = entity.offset + entity.length;
  }

  // adiciona o resto do texto
  result += text.slice(currentIndex);

  ctx.reply(result, {
    parse_mode: "HTML"
  });
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