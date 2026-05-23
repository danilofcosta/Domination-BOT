import { prisma } from "../../lib/prisma.js";
import { ChatType, type Character } from "../customTypes.js";
import { info, error } from "../log.js";

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

async function getRandom<T>(
  model: {
    aggregate: (args: { _max: { id: true } }) => Promise<{ _max: { id: number | null } }>;
    findFirst: (args: any) => Promise<T | null>;
  },
  include: object,
): Promise<T | null> {
  try {
    const result = await model.aggregate({ _max: { id: true } });
    const maxId = result._max.id;
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

    return character;
  } catch (e) {
    error("getRandom - erro", e);
    return null;
  }
}

export async function RandomCharacter(
  genero: ChatType,
): Promise<Character | null> {
  info(`RandomCharacter - buscando personagem aleatório`, { genero });

  if (genero === ChatType.HUSBANDO) {
    return getRandom<Character>(prisma.characterHusbando, husbandoInclude);
  }
  if (genero === ChatType.WAIFU) {
    return getRandom<Character>(prisma.characterWaifu, waifuInclude);
  }
  return null;
}

export async function LastRandomCharacter(
  genero: ChatType,
): Promise<Character | null> {
  info(`LastRandomCharacter - buscando último personagem`, { genero });
  try {
    return genero === ChatType.HUSBANDO
      ? await prisma.characterHusbando.findFirst({
          include: husbandoInclude,
          orderBy: { id: "desc" },
        })
      : await prisma.characterWaifu.findFirst({
          include: waifuInclude,
          orderBy: { id: "desc" },
        });
  } catch (e) {
    error("LastRandomCharacter - erro ao buscar último personagem", e);
    return null;
  }
}
