"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getRedis } from "@/lib/redis";
import { sessionHasPermission } from "@/lib/session";

const INVALIDATION_CHANNEL = "bot:cache:invalidate";

async function publishInvalidation(type: string) {
  try {
    const redis = await getRedis();
    await redis.publish(
      INVALIDATION_CHANNEL,
      JSON.stringify({ type }),
    );
  } catch (e) {
    console.error("Falha ao publicar invalidação no Redis:", e);
  }
}

export async function saveConfig(
  entries: { key: string; value: string }[],
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!(await sessionHasPermission("manage_config"))) {
    return { success: false, count: 0, error: "Sem permissão para alterar a configuração." };
  }

  try {
    await prisma.$transaction(
      entries.map(({ key, value }) =>
        prisma.botConfig.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value), label: key, type: "number" },
        }),
      ),
    );
    revalidatePath("/setup/dados-bot");
    revalidatePath("/setup");
    await publishInvalidation("dropConfig");
    return { success: true, count: entries.length };
  } catch (e) {
    console.error("saveConfig error:", e);
    return { success: false, count: 0, error: "Erro interno ao salvar configuração." };
  }
}
