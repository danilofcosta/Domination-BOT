import { prisma } from "../../../lib/prisma.js";
import { ChatType, type Character } from "../customTypes.js";
import { info, error } from "../log.js";

export async function GetCharacterById(
  genero: ChatType,
  id: number | string
): Promise<Character | null |undefined> {
  info(`GetCharacterById - buscando personagem`, { genero, id });

  const isNumeric = !isNaN(Number(id));
  if (!isNumeric){
        error("GetCharacterById - erro ao buscar personagem");
        return null;
  }

  try {
    if (genero === ChatType.WAIFU) {
      return await prisma.characterWaifu.findUnique({
        where: { id: Number(id) },
        include: {
          WaifuEvent: { include: { Event: true } },
          WaifuRarity: { include: { Rarity: true } },
        },
      });
    } else {
      return await prisma.characterHusbando.findUnique({
        where: { id: Number(id) },
        include: {
          HusbandoEvent: { include: { Event: true } },
          HusbandoRarity: { include: { Rarity: true } },
        },
      });
    }
  } catch (e) {
    error("GetCharacterById - erro ao buscar personagem", e);
    return null;
  }
}
