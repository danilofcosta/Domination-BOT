import { type MyContext } from "../../utils/customTypes.js";
import { Sendmedia } from "../../utils/sendmedia.js";
import { createSecretCaption } from "../../utils/manage_captures/form_caption.js";
import { RandomCharacter } from "../../utils/character/random_character.js";
import { info, warn, error, debug } from "../../utils/log.js";
import { getRuntime } from "../../runtime/groupRuntime.js";
import { prisma } from "../../lib/prisma.js";

export async function DropCharacter(ctx: MyContext): Promise<boolean | null> {
  info(`DropCharacter - drop iniciado`, {
    chatId: ctx.chat?.id,
    genero: ctx.botType,
  });

  // const character = await RandomCharacter(ctx.botType);
  let character;
  if (ctx.botType === "waifu") {
    character = await sortearWaifu();
  } else {
    character = await sortearHusbando();
  }
  if (!character) {
    warn(`DropCharacter - nenhum personagem disponível`, {
      chatId: ctx.chat?.id,
    });
    return null;
  }

  debug(`DropCharacter - personagem selecionado`, {
    charId: character.id,
    charName: character.name,
  });

  const caption = await createSecretCaption(ctx, character);

  try {
    const message = await Sendmedia({
      ctx,
      per: character,
      caption,
    });

    if (!message) {
      error(`DropCharacter - Sendmedia retornou null`, {
        chatId: ctx.chat?.id,
      });
      return null;
    }

    info(`DropCharacter - personagem dropado com sucesso`, {
      chatId: ctx.chat?.id,
      messageId: message.message_id,
      charId: character.id,
      charName: character.name,
    });

    if (!ctx.chat?.id) return null;
    const runtime = getRuntime(ctx.chat.id);
    runtime.dropId = message.message_id;
    runtime.cont = 100;
    runtime.characterId = character.id;
    runtime.data = message.date;
    return true;
  } catch (e) {
    error(`DropCharacter - erro ao enviar mídia`, e);
    return null;
  }
}


async function sortearRaridade() {
  const raridades = await prisma.rarity.findMany({
    select: {
      id: true,
      code: true,
      weight: true,
    },
  });

  const pesoTotal = raridades.reduce(
    (acc: any, r: { weight: any; }) => acc + r.weight,
    0
  );

  let sorteio = Math.random() * pesoTotal;

  for (const raridade of raridades) {
    sorteio -= raridade.weight;

    if (sorteio <= 0) {
      return raridade;
    }
  }

  return raridades[0];
}

async function sortearWaifu() {
  const raridade = await sortearRaridade();

  const total = await prisma.characterWaifu.count({
    where: {
      WaifuRarity: {
        some: {
          rarityId: raridade.id,
        },
      },
    },
  });

  if (total === 0) {
    return null;
  }

  const skip = Math.floor(Math.random() * total);

  const waifu = await prisma.characterWaifu.findFirst({
    where: {
      WaifuRarity: {
        some: {
          rarityId: raridade.id,
        },
      },
    },
    skip,
    include: {
      WaifuRarity: {
        include: {
          Rarity: true,
        },
      },
    },
  });

  return waifu;
}

async function sortearHusbando() {
  const raridade = await sortearRaridade();

  const total = await prisma.characterHusbando.count({
    where: {
      HusbandoRarity: {
        some: {
          rarityId: raridade.id,
        },
      },
    },
  });

  if (total === 0) {
    return null;
  }

  const skip = Math.floor(Math.random() * total);

  const husbando = await prisma.characterHusbando.findFirst({
    where: {
      HusbandoRarity: {
        some: {
          rarityId: raridade.id,
        },
      },
    },
    skip,
    include: {
      HusbandoRarity: {
        include: {
          Rarity: true,
        },
      },
    },
  });

  return husbando;
}