import { prisma } from "../../lib/prisma.js";
import { ChatType, type Character, type MyContext } from "../CustomTypes.js";
import { error, info } from "../log.js";
import { getOrSet, maxIdCache } from "../../cache/cache.js";
// Busca um personagem aleatório do banco de dados, garantindo que o ID seja válido e lidando com possíveis conflitos de chave primária.
async function getRandomCharacter(model: any, include: object, cacheKey: string): Promise<Character | null> {
  try {
    const maxId = await getOrSet(maxIdCache, cacheKey, async () => {
      const result = await model.aggregate({ _max: { id: true } });
      return result._max.id ?? 0;
    });
    if (!maxId) return null;

    const randomId = Math.floor(Math.random() * maxId) + 1;

    let character = await model.findFirst({
      where: { id: { gte: randomId } },
      orderBy: { id: "asc" },
      include,
    });

    if (!character) {
      character = await model.findFirst({
        orderBy: { id: "asc" },
        include,
      });
    }

    return character as Character | null;
  } catch (e) {
    error("RandomCharacter - erro ao buscar personagem aleatório", e);
    return null;
  }
}

const eventSelect = { select: { name: true, emoji: true, emoji_id: true } };
const raritySelect = { select: { name: true, emoji: true, emoji_id: true } };

const husbandoInclude = {
  HusbandoEvent: { select: { Event: eventSelect } },
  HusbandoRarity: { select: { Rarity: raritySelect } },
} as const;

const waifuInclude = {
  WaifuEvent: { select: { Event: eventSelect } },
  WaifuRarity: { select: { Rarity: raritySelect } },
} as const;

export async function RandomCharacter(ctx: MyContext): Promise<Character | null> {
  const genero = ctx.botType;
  info("RandomCharacter - buscando personagem aleatório", { genero });

  if (genero === ChatType.HUSBANDO) {
    return getRandomCharacter(prisma.characterHusbando, husbandoInclude, "maxId:husbando");
  }
  if (genero === ChatType.WAIFU) {
    return getRandomCharacter(prisma.characterWaifu, waifuInclude, "maxId:waifu");
  }
  return null;
}