import { prisma } from "../../lib/prisma.js";
import type {
  CharacterWaifu,
  CharacterHusbando,
} from "../../generated/prisma/client.js";
import { ChatType, type Character } from "./types.js";

async function getRandom<T>(
  model: any,
): Promise<T | null> {
  try {
    const max = await model.aggregate({
      _max: { id: true },
    });

    const maxId = max._max.id;
    if (!maxId) return null;

    const randomId = Math.floor(Math.random() * maxId) + 1;

    const result = await model.findFirst({
      where: { id: { gte: randomId } },
      include: {
        events: { include: { event: true } },
        rarities: { include: { rarity: true } },
      },
    });

    return (
      result ??
      model.findFirst({
        include: {
          events: { include: { event: true } },
          rarities: { include: { rarity: true } },
        },
      })
    );
  } catch (error) {
    console.error("Erro ao buscar personagem:", error);
    return null;
  }
}

/* =========================
 * Função principal
 * ========================= */
export async function RandomCharacter(
  genero: ChatType,
): Promise<Character | null> {

  if (genero === ChatType.HUSBANDO) {
    return getRandom<CharacterHusbando>(prisma.characterHusbando);
  }

  return getRandom<CharacterWaifu>(prisma.characterWaifu);
}