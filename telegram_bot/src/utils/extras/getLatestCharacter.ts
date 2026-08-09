import { prisma } from "../../lib/prisma.js";
import { ChatType } from "../customTypes.js";

export async function getLatestCharacter(botType: ChatType) {
  return botType === ChatType.HUSBANDO
    ? prisma.characterHusbando.findFirst({
        select: { media: true, mediaType: true },
        orderBy: { id: "desc" },
      })
    : prisma.characterWaifu.findFirst({
        select: { media: true, mediaType: true },
        orderBy: { id: "desc" },
      });
}
