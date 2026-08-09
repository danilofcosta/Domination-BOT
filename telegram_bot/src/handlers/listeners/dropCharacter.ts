import { prisma } from "../../lib/prisma.js";
import type { MyContext } from "../../uteis/CustomTypes.js";
import { info, warn, error } from "../../uteis/log.js";
import { SendMensageCustom } from "../../uteis/sendMensageCustom.js";
import { createSecretCaption } from "../../uteis/buildCapion/form_caption.js";
import { getRuntime } from "../../runtime/groupRuntime.js";
import { ChatType } from "../../uteis/CustomTypes.js";
import { getDropConfig } from "../../cache/dropConfig.js";

export async function DropCharacter(ctx: MyContext): Promise<boolean | null> {
  info("DropCharacter - drop iniciado", { chatId: ctx.chat?.id, genero: ctx.botType });

  const character = ctx.botType === ChatType.WAIFU ? await sortearWaifu() : await sortearHusbando();
  if (!character) {
    warn("DropCharacter - nenhum personagem disponível", { chatId: ctx.chat?.id });
    return null;
  }
  info("DropCharacter - personagem sorteado", {nome: character.name, chatId: ctx.chat?.id, characterId: character.id , genero: ctx.botType });
  const caption = await createSecretCaption(ctx, character);

  try {
    const message = await SendMensageCustom({ ctx, character, caption });

    if (!message) {
      error("DropCharacter - SendMensageCustom retornou null", { chatId: ctx.chat?.id });
      return null;
    }

    if (!ctx.chat?.id) return null;

    const { dropMsg } = await getDropConfig();
    const runtime = getRuntime(ctx.chat.id);
    runtime.dropId = message.message_id;
    runtime.cont = dropMsg;
    runtime.characterId = character.id as number;
    runtime.data = message.date;
    return true;
  } catch (e) {
    error("DropCharacter - erro ao enviar mídia", e);
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

async function sortearWaifu() {
  const raridade = await sortearRaridade();
  if (!raridade) return null;
  const total = await prisma.characterWaifu.count({
    where: { WaifuRarity: { some: { rarityId: raridade.id },every:{CharacterWaifu:{mediaType:"IMAGE_URL"}} } },
  });

  if (total === 0) return null;

  const skip = Math.floor(Math.random() * total);
  return prisma.characterWaifu.findFirst({
    where: { WaifuRarity: { some: { rarityId: raridade.id } } },
    skip,
    include: { WaifuRarity: { include: { Rarity: true } } },
  });
}

async function sortearHusbando() {
  const raridade = await sortearRaridade();
  if (!raridade) return null;
  const total = await prisma.characterHusbando.count({
    where: { HusbandoRarity: { some: { rarityId: raridade.id } } },
  });

  if (total === 0) return null;

  const skip = Math.floor(Math.random() * total);
  return prisma.characterHusbando.findFirst({
    where: { HusbandoRarity: { some: { rarityId: raridade.id } } },
    skip,
    include: { HusbandoRarity: { include: { Rarity: true } } },
  });
}
