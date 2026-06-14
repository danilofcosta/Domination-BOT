"use server";

import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";

export async function getUserCollection(telegramId: string) {
  const id = BigInt(telegramId);
  const [waifuCount, husbandoCount] = await Promise.all([
    prisma.waifuCollection.count({ where: { userId: id } }),
    prisma.husbandoCollection.count({ where: { userId: id } }),
  ]);

  return { waifuCount, husbandoCount, total: waifuCount + husbandoCount };
}

export async function clearUserCollection(telegramId: string) {
  const id = BigInt(telegramId);
  await Promise.all([
    prisma.waifuCollection.deleteMany({ where: { userId: id } }),
    prisma.husbandoCollection.deleteMany({ where: { userId: id } }),
  ]);
  return { success: true, message: "Coleção limpa com sucesso!" };
}

export async function deleteUser(telegramId: string) {
  const id = BigInt(telegramId);
  await prisma.telegramUser.delete({ where: { telegramId: id } });
  return { success: true, message: "Usuário deletado permanentemente!" };
}

export async function updateUserProfileType(
  telegramId: string,
  profileType: string,
) {
  const id = BigInt(telegramId);
  await prisma.telegramUser.update({
    where: { telegramId: id },
    data: { profileType: profileType as any },
  });
  return { success: true, message: "Tipo de perfil atualizado!" };
}

async function getDailyCapture(userId: number): Promise<number | null> {
  try {
    const redis = await getRedis();
    const val = await redis.get(`daily_dominar:${userId}`);
    return val !== null ? Number(val) : null;
  } catch {
    return null;
  }
}

export async function lookupUser(telegramId: string) {
  const id = BigInt(telegramId);
  const user = await prisma.telegramUser.findUnique({
    where: { telegramId: id },
    select: {
      id: true,
      telegramId: true,
      telegramData: true,
      profileType: true,
      language: true,
      coins: true,
    },
  });

  if (!user) return { error: "Usuário não encontrado" };

  const data = user.telegramData as Record<string, unknown> | null;
  const name =
    [data?.first_name, data?.last_name].filter(Boolean).join(" ") || "—";
  const username = (data?.username as string) || "";

  const [waifuCount, husbandoCount, dailyCaptures] = await Promise.all([
    prisma.waifuCollection.count({ where: { userId: id } }),
    prisma.husbandoCollection.count({ where: { userId: id } }),
    getDailyCapture(Number(telegramId)),
  ]);

  return {
    id: user.id,
    telegramId: String(user.telegramId),
    name,
    username,
    profileType: user.profileType,
    language: user.language,
    coins: user.coins,
    waifuCount,
    husbandoCount,
    dailyCaptures,
    blocked: false,
  };
}
