import { prisma } from "../../lib/prisma.js";
import type { MyContext } from "../../utils/customTypes.js";
import { info, warn, error } from "../../utils/log.js";
import { sendMessageCustom } from "../../utils/sendMessageCustom.js";
import { createSecretCaption } from "../../utils/buildCaption/formCaption.js";
import { getRuntime } from "../../runtime/groupRuntime.js";
import { ChatType } from "../../utils/customTypes.js";
import { getDropConfig } from "../../cache/dropConfig.js";
import { getGroupConfig } from "../../cache/groupConfig.js";
import { getRecentDropIds, trackDrop } from "../../cache/recentDrops.js";

export async function dropCharacter(ctx: MyContext): Promise<boolean | null> {
  info("dropCharacter - drop iniciado", { chatId: ctx.chat?.id, genero: ctx.botType });

  if (ctx.chat?.id) {
    const groupConfig = await getGroupConfig(ctx.chat.id, ctx.botType);
    if ((groupConfig.dropsEnabled ?? true) === false) {
      warn("dropCharacter - drops desativados no grupo", { chatId: ctx.chat.id });
      return null;
    }
  }

  const chatId = ctx.chat?.id;
  const excluded = chatId ? getRecentDropIds(chatId, ctx.botType) : [];
  const character =
    ctx.botType === ChatType.WAIFU
      ? await sortearWaifu(excluded)
      : await sortearHusbando(excluded);
  if (!character) {
    warn("dropCharacter - nenhum personagem disponível", { chatId: ctx.chat?.id });
    return null;
  }
  info("dropCharacter - personagem sorteado", {nome: character.name, chatId: ctx.chat?.id, characterId: character.id , genero: ctx.botType });
  const caption = await createSecretCaption(ctx, character);

  try {
    const message = await sendMessageCustom({ ctx, character, caption });

    if (!message) {
      error("dropCharacter - sendMessageCustom retornou null", { chatId: ctx.chat?.id });
      return null;
    }

    if (!ctx.chat?.id) return null;

    trackDrop(ctx.chat.id, ctx.botType, character.id as number);

    const { dropMsg } = await getDropConfig();
    const runtime = getRuntime(ctx.chat.id);
    runtime.dropId = message.message_id;
    runtime.cont = dropMsg;
    runtime.characterId = character.id as number;
    runtime.data = message.date;
    return true;
  } catch (e) {
    error("dropCharacter - erro ao enviar mídia", e);
    return null;
  }
}

async function sortearRaridade() {
  const raridades = await prisma.rarity.findMany({
    select: { id: true, code: true, weight: true },
  });

  if (raridades.length === 0) return null;

  const pesoTotal = raridades.reduce((acc, r) => acc + r.weight, 0);
  let sorteio = Math.random() * pesoTotal;

  for (const r of raridades) {
    sorteio -= r.weight;
    if (sorteio <= 0) return r;
  }

  return raridades[0];
}

async function sortearWaifu(excluded: number[]) {
  const raridade = await sortearRaridade();
  if (!raridade) return null;

  const where = (ex: number[]) => ({
    id: { notIn: ex },
    WaifuRarity: { some: { rarityId: raridade.id } },
  });

  for (const ex of [excluded, []]) {
    const total = await prisma.characterWaifu.count({
      where: {
        ...where(ex),
        WaifuRarity: {
          some: { rarityId: raridade.id },
          every: { CharacterWaifu: { mediaType: "IMAGE_URL" } },
        },
      },
    });
    if (total === 0) continue;

    const skip = Math.floor(Math.random() * total);
    return prisma.characterWaifu.findFirst({
      where: where(ex),
      skip,
      include: {
        WaifuRarity: { include: { Rarity: true } },
        WaifuEvent: { include: { Event: true } },
      },
    });
  }

  return null;
}

async function sortearHusbando(excluded: number[]) {
  const raridade = await sortearRaridade();
  if (!raridade) return null;

  const where = (ex: number[]) => ({
    id: { notIn: ex },
    HusbandoRarity: { some: { rarityId: raridade.id } },
  });

  for (const ex of [excluded, []]) {
    const total = await prisma.characterHusbando.count({
      where: where(ex),
    });
    if (total === 0) continue;

    const skip = Math.floor(Math.random() * total);
    return prisma.characterHusbando.findFirst({
      where: where(ex),
      skip,
      include: {
        HusbandoRarity: { include: { Rarity: true } },
        HusbandoEvent: { include: { Event: true } },
      },
    });
  }

  return null;
}
