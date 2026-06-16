import { Language, prisma } from "../../../lib/prisma.js";
import { ProfileType, type MyContext } from "../../../utils/customTypes.js";
import { getUserRole, roleWeights } from "../../../utils/permissions.js";
import { warn } from "../../../utils/log.js";
import {
  getCachedLocale,
  setCachedLocale,
} from "../../../cache/localeCache.js";

async function canChangeLanguage(ctx: MyContext): Promise<boolean> {
  const userId = ctx.from?.id;
  if (!userId) return false;

  const chatId = ctx.chat?.id;
  if (chatId) {
    try {
      const member = await ctx.api.getChatMember(chatId, userId);
      if (member.status === "creator") return true;
      if (member.status === "administrator" && (member as any).can_change_info)
        return true;
    } catch {
      warn("setlangCallback - erro ao verificar admin do grupo");
    }
  }

  const role = await getUserRole(userId);
  if (roleWeights[role] >= roleWeights[ProfileType.ADMIN]) return true;

  return false;
}

export async function setlangCallback(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;

  if (!ctx.from?.id) return;

  if (!(await canChangeLanguage(ctx))) {
    await ctx.answerCallbackQuery(ctx.t("error-permission-denied"));
    return;
  }

  const lang = ctx.callbackQuery.data.replace("setlang_", "");

  const validLocales = ["pt", "en", "es", "ja"];
  if (!validLocales.includes(lang)) {
    await ctx.answerCallbackQuery(ctx.t("setlang-invalid"));
    return;
  }

  const chatId = ctx.chat?.id;
  if (chatId) {
    setCachedLocale(chatId, lang);
  }

  ctx.i18n.useLocale(lang);

  const langMap: Record<string, Language | undefined> = {
    pt: Language.PT,
    en: Language.EN,
    es: Language.ES,
    ja: Language.JA,
  };
  const dbLang = langMap[lang] ?? Language.PT;

  if (ctx.chat?.type === "private" && ctx.from?.id) {
    await prisma.telegramUser
      .upsert({
        where: { telegramId: BigInt(ctx.from.id) },
        update: { language: dbLang },
        create: {
          telegramId: BigInt(ctx.from.id),
          language: dbLang,
          telegramData: {},
          favoriteWaifuId: null,
          favoriteHusbandoId: null,
          waifuConfig: {},
          husbandoConfig: {},
        },
      })
      .catch((e: any) =>
        warn("setlangCallback - erro ao salvar locale no User", e),
      );
  } else if (
    chatId &&
    (ctx.chat?.type === "group" || ctx.chat?.type === "supergroup")
  ) {
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
      warn("setlangCallback - erro ao salvar locale no TelegramGroup", e);
    }
  }

  const label = ctx.t(`setlang-name-${lang}`);

  await ctx.editMessageText(ctx.t("setlang-success", { lang: label }));
  await ctx.answerCallbackQuery();
}
