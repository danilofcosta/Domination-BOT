"use server";

import { prisma } from "@/lib/prisma";

export async function saveMalExtras(
  characterId: string,
  type: "waifu" | "husbando",
  extras: Record<string, unknown>,
) {
  const model = type === "waifu" ? prisma.characterWaifu : prisma.characterHusbando;
  await (model as any).update({
    where: { id: characterId },
    data: { extras: extras as any },
  });
}
