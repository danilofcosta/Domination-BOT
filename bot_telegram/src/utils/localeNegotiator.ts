import { prisma } from "../lib/prisma.js";

export default async function localeNegotiator(ctx: any) {
  if (ctx.session?.locale) {
    return ctx.session.locale;
  }

  if (!ctx.chat) {
    return "pt";
  }
  const chatType = ctx.chat.type || "unknown";

  if (chatType === "private" && ctx.from?.id) {
    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(ctx.from.id) },
        select: { language: true },
      });
      if (user?.language) {
        const lang = user.language.toLowerCase();
        if (ctx.session) ctx.session.locale = lang;
        return lang;
      }
    } catch {
      // fallback
    }
  }

  return "pt";
}
