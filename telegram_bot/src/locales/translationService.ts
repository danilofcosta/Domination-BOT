import { prisma } from "../lib/prisma.js";

type TranslationMap = Map<string, Map<string, string>>;

class TranslationService {
  private translations: TranslationMap = new Map();
  private initialized = false;

  async init() {
    if (this.initialized) return;
    await this.reload();
    this.initialized = true;
  }

  async reload() {
    const keys = await prisma.localeKey.findMany({
      include: { translations: true },
    });

    console.log(`[i18n] ${keys.length} LocaleKeys carregados`);
    if (keys.length > 0) {
      const sample = keys[0]!;
      // console.log(`[i18n] Sample key:`, JSON.stringify(sample, null, 2));
    }

    const map: TranslationMap = new Map();
    let loadedCount = 0;

    for (const key of keys) {
      const translations = key.translations
        ? Array.isArray(key.translations) ? key.translations : [key.translations]
        : [];
      if (translations.length === 0) {
        console.log(`[i18n] Key "${key.key}" sem tradução`);
        continue;
      }
      for (const t of translations) {
        const raw = t.locale;
        const rawLocale = typeof raw === "object" && raw !== null
          ? String((raw as Record<string, unknown>).lang ?? (raw as Record<string, unknown>).locale ?? "pt")
          : String(raw);
        const locale = (rawLocale.split("-")[0] ?? "pt").toLowerCase();
        if (!map.has(locale)) map.set(locale, new Map());
        map.get(locale)!.set(key.key, t.value);
        loadedCount++;
      }
    }

    console.log(`[i18n] ${loadedCount} traduções carregadas, locales:`, [...map.keys()].map(l => `${l}(${map.get(l)!.size})`));

    this.translations = map;
  }

  t(locale: string, key: string, variables?: Record<string, string>): string {
    const localeMap = this.translations.get(locale);
    let value = localeMap?.get(key);
    if (!value) {
      const fallback = this.translations.get("pt")?.get(key);
      if (!fallback) return key;
      value = fallback;
    }
    if (!variables) return value;
    return value.replace(/\$\{(\w+)\}|\{\s*\$(\w+)\s*\}/g, (_, v1: string, v2: string) => {
      const v = v1 ?? v2;
      return variables[v] ?? `{${v}}`;
    });
  }

  async getKey(key: string) {
    return prisma.localeKey.findUnique({
      where: { key },
      include: { translations: true },
    });
  }

  async setTranslation(key: string, locale: string, value: string) {
    const existing = await prisma.localeKey.upsert({
      where: { key },
      create: { key },
      update: {},
    });

    await prisma.localeTranslation.upsert({
      where: { keyId_locale: { keyId: existing.id, locale } },
      create: { keyId: existing.id, locale, value },
      update: { value },
    });

    await this.reload();
  }

  async getAllKeys() {
    return prisma.localeKey.findMany({
      include: { translations: true },
      orderBy: { key: "asc" },
    });
  }
}

export const translationService = new TranslationService();
