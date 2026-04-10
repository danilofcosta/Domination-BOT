import { prisma } from "../../../lib/prisma.js";
import { ChatType, type Character } from "../customTypes.js";

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
      if (count === 0) return null;

      const skip = Math.floor(Math.random() * count);

      const result = await model.findFirst({
        skip,
        include,
      });

      return result;
    });
  } catch (error) {
    console.error("Erro ao buscar personagem:", error);
    return null;
  }
}

export async function RandomCharacter(
  genero: ChatType,
): Promise<Character | null> {

  console.log(genero)
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
  console.log(genero);
  const LIMIT = 1;
  try {
    const lastCharacter =
      genero === ChatType.HUSBANDO
        ? await prisma.characterHusbando.findMany({
            include: {
              HusbandoEvent: { include: { Event: true } },
              HusbandoRarity: { include: { Rarity: true } },
            },
            take: LIMIT,
            orderBy: {
              id: "desc",
            },
            //      skip: offset,
          })
        : await prisma.characterWaifu.findMany({
            take: LIMIT,
            include: {
              WaifuEvent: { include: { Event: true } },
              WaifuRarity: { include: { Rarity: true } },
            },
            orderBy: {
              id: "desc",
            },
            //      skip: offset,
          });

    return lastCharacter[0] || null;
  } catch (error) {
    console.error("Erro ao buscar último personagem:", error);
    return null;
  }
}
