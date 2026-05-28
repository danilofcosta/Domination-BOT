import { prisma } from "../lib/prisma.js";
import { getCachedLocale, setCachedLocale } from "../cache/localeCache.js";

export default async function localeNegotiator(ctx: any) {
  const chatId = ctx.chat?.id;
  if (!chatId) return "pt";

  const cached = getCachedLocale(chatId);
  if (cached) return cached;

  const chatType = ctx.chat?.type || "unknown";

  if (chatType === "private" && ctx.from?.id) {
    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(ctx.from.id) },
        select: { language: true },
      });
      if (user?.language) {
        const lang = user.language.toLowerCase();
        setCachedLocale(chatId, lang);
        return lang;
      }
    } catch { /* fallback */ }
    setCachedLocale(chatId, "pt");
    return "pt";
  }

  if (chatType === "group" || chatType === "supergroup") {
    try {
      const group = await prisma.telegramGroup.findUnique({
        where: { groupId: BigInt(chatId) },
        select: { configuration: true },
      });
      if (group?.configuration && typeof group.configuration === "object" && "locale" in (group.configuration as any)) {
        const lang = String((group.configuration as any).locale).toLowerCase();
        setCachedLocale(chatId, lang);
        return lang;
      }
    } catch { /* fallback */ }
    setCachedLocale(chatId, "pt");
    return "pt";
  }

  return "pt";
}
