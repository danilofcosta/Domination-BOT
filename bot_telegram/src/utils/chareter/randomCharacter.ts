import { prisma } from "../../../lib/prisma.js";
import { ChatType, type Character } from "../customTypes.js";
import { info, error, debug } from "../log.js";

async function getRandom<T>(
  model: {
    count: () => Promise<number>;
    findFirst: (args: any) => Promise<T | null>;
  },
  include: object,
): Promise<T | null> {
  try {
    return prisma.$transaction(async () => {
      const count = await model.count();
      if (count === 0) {
        debug(`getRandom - banco vazio, sem personagens`);
        return null;
      }

      const skip = Math.floor(Math.random() * count);
      debug(`getRandom - buscando personagem`, { skip, total: count });

      const result = await model.findFirst({
        skip,
        include,
      });

      return result;
    });
  } catch (e) {
    error("getRandom - erro ao buscar personagem", e);
    return null;
  }
}

export async function RandomCharacter(
  genero: ChatType,
): Promise<Character | null> {
  info(`RandomCharacter - buscando personagem aleatório`, { genero });

  if (genero === ChatType.HUSBANDO) {
    return getRandom<Character>(prisma.characterHusbando, {
      HusbandoEvent: {
        include: { Event: true },
      },
      HusbandoRarity: {
        include: { Rarity: true },
      },
    });
  } else if (genero === ChatType.WAIFU) {
    return getRandom<Character>(prisma.characterWaifu, {
      WaifuEvent: {
        include: { Event: true },
      },
      WaifuRarity: {
        include: { Rarity: true },
      },
    });
  }
  return null;
}

export async function LastRandomCharacter(
  genero: ChatType,
): Promise<Character | null> {
  info(`LastRandomCharacter - buscando último personagem`, { genero });
  try {
    const lastCharacter =
      genero === ChatType.HUSBANDO
        ? await prisma.characterHusbando.findFirst({
            include: {
              HusbandoEvent: { include: { Event: true } },
              HusbandoRarity: { include: { Rarity: true } },
            },
            orderBy: { id: "desc" },
          })
        : await prisma.characterWaifu.findFirst({
            include: {
              WaifuEvent: { include: { Event: true } },
              WaifuRarity: { include: { Rarity: true } },
            },
            orderBy: { id: "desc" },
          });

    return lastCharacter;
  } catch (e) {
    error("LastRandomCharacter - erro ao buscar último personagem", e);
    return null;
  }
}
