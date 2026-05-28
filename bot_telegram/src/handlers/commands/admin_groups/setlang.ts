import { InlineKeyboard } from "grammy";
import { i18n } from "../../../initializeBot.js";
import { ProfileType, type MyContext } from "../../../utils/customTypes.js";
import { getUserRole, roleWeights } from "../../../utils/permissions.js";
import { warn } from "../../../utils/log.js";
import { prisma } from "../../../lib/prisma.js";
import { getCachedLocale, setCachedLocale } from "../../../cache/localeCache.js";
import localeNegotiator from "../../../utils/localeNegotiator.js";

async function canChangeLanguage(ctx: MyContext): Promise<boolean> {
  const userId = ctx.from?.id;
  if (!userId) return false;

  const chatId = ctx.chat?.id;
  if (chatId) {
    try {
      const member = await ctx.api.getChatMember(chatId, userId);
      if (member.status === "creator") return true;
      if (member.status === "administrator" && (member as any).can_change_info) return true;
    } catch {
      warn("setlang - erro ao verificar admin do grupo");
    }
  }

  const role = await getUserRole(userId);
  if (roleWeights[role] >= roleWeights[ProfileType.ADMIN]) return true;

  return false;
}

async function setLanguage(ctx: MyContext, lang: string) {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  ctx.i18n.useLocale(lang);
  setCachedLocale(chatId, lang);

  const chatType = ctx.chat?.type;
  if (chatType === "private" && ctx.from?.id) {
    const langMap: Record<string, any> = { pt: "PT", en: "EN", es: "ES", ja: "JA" };
    await prisma.user.upsert({
      where: { telegramId: BigInt(ctx.from.id) },
      update: { language: langMap[lang] || "PT" },
      create: {
        telegramId: BigInt(ctx.from.id),
        language: langMap[lang] || "PT",
        telegramData: {},
        favoriteWaifuId: null,
        favoriteHusbandoId: null,
        waifuConfig: {},
        husbandoConfig: {},
      },
    }).catch(() => warn("setlang - erro ao salvar locale no User"));
  } else if (chatType === "group" || chatType === "supergroup") {
    try {
      const existing = await prisma.telegramGroup.findUnique({
        where: { groupId: BigInt(chatId) },
        select: { configuration: true },
      });
      const config = (existing?.configuration as Record<string, any>) || {};
      config.locale = lang;
      await prisma.telegramGroup.update({
        where: { groupId: BigInt(chatId) },
        data: { configuration: config },
      });
    } catch (e) {
      warn("setlang - erro ao salvar locale no TelegramGroup", e);
    }
  }
}

export async function setlangHandler(ctx: MyContext) {
  if (!(await canChangeLanguage(ctx))) {
    await ctx.reply(ctx.t("error-permission-denied"));
    return;
  }

  const input = ctx.match ? String(ctx.match).trim().toLowerCase() : "";

  if (!input) {
    const currentLang = ctx.chat ? (getCachedLocale(ctx.chat.id) || await localeNegotiator(ctx) || "pt") : "pt";
    const currentLabel = ctx.t(`setlang-name-${currentLang}`);

    const keyboard =InlineKeyboard.from(
  i18n.locales.map((locale: string) => [{
    text: `${currentLang === locale ? "✅ " : ""}${ctx.t(`setlang-btn-${locale}`)}`,
    callback_data: `setlang_${locale}`,
  }]),
);

    await ctx.reply(
      `${ctx.t("setlang-title")}\n${ctx.t("setlang-current", { lang: currentLabel })}`,
      { reply_markup: keyboard },
    );
    return;
  }

  if (i18n.locales.includes(input)) {
    await setLanguage(ctx, input);
    const label = ctx.t(`setlang-name-${input}`);
    await ctx.reply(ctx.t("setlang-success", { lang: label }));
    return;
  }

  await ctx.reply(ctx.t("setlang-invalid"));
}
