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

export type TextoEntry = {
  key: string;
  description: string | null;
  value: string;
  isButton: boolean;
  locale: string;
};

const BUTTON_RE = /btn|buttun/i;

function translationValue(t: unknown): string {
  if (!t || typeof t !== "object") return "";
  const obj = t as Record<string, unknown>;
  if (Array.isArray(obj)) return obj.length > 0 ? String(obj[0]?.value ?? "") : "";
  return typeof obj.value === "string" ? obj.value : "";
}

function translationLocale(t: unknown): string {
  if (!t || typeof t !== "object") return "pt";
  const obj = t as Record<string, unknown>;
  if (Array.isArray(obj)) return obj.length > 0 ? translationLocale(obj[0]) : "pt";
  const lang = obj.lang;
  return typeof lang === "string" ? lang : "pt";
}

export async function getTextos(): Promise<TextoEntry[]> {
  const keys = await prisma.localeKey.findMany({
    include: { LocaleTranslation: true },
    orderBy: { key: "asc" },
  });

  return keys.map((k) => ({
    key: k.key,
    description: k.description,
    value: translationValue(k.LocaleTranslation),
    isButton: BUTTON_RE.test(k.key),
    locale: translationLocale(k.LocaleTranslation),
  }));
}

export async function saveTextos(changes: { key: string; value: string }[]) {
  if (!(await sessionHasPermission("manage_config"))) {
    return { success: false, count: 0, error: "Sem permissão para editar textos." };
  }

  const pairs = changes.filter(
    (c) =>
      typeof c?.key === "string" &&
      c.key.length > 0 &&
      typeof c?.value === "string",
  );

  if (pairs.length === 0) return { success: true, count: 0 };

  try {
    for (const { key, value } of pairs) {
      const existing = await prisma.localeKey.upsert({
        where: { key },
        create: {
          id: crypto.randomUUID(),
          key,
          updatedAt: new Date(),
        },
        update: {},
      });

      const translation = await prisma.localeTranslation.findFirst({
        where: { keyId: existing.id },
      });

      if (translation) {
        await prisma.localeTranslation.update({
          where: { id: translation.id },
          data: { value },
        });
      } else {
        await prisma.localeTranslation.create({
          data: {
            id: crypto.randomUUID(),
            keyId: existing.id,
            locale: { lang: "pt", icon: "🇧🇷" },
            value,
            extrakey: [],
            updatedAt: new Date(),
          },
        });
      }
    }

    revalidatePath("/setup/textos");
    await publishInvalidation("translations");
    return { success: true, count: pairs.length };
  } catch (e) {
    console.error("saveTextos error:", e);
    return { success: false, count: 0, error: "Erro interno ao salvar textos." };
  }
}
