import { InlineKeyboard } from "grammy";
import { i18n } from "../../../initializeBot.js";
import { prisma } from "../../../../lib/prisma.js";
import { ProfileType, type MyContext } from "../../../utils/customTypes.js";
import { Language } from "../../../../generated/prisma/enums.js";
import { getUserRole, roleWeights } from "../../../utils/permissions.js";
import { info, warn } from "../../../utils/log.js";

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
  ctx.session.locale = lang;
  ctx.i18n.useLocale(lang);

  if (ctx.from?.id) {
    try {
      const langMap: Record<string, Language> = {
        pt: Language.PT,
        en: Language.EN,
        es: Language.ES,
        ja: Language.JA,
      };
      const dbLang = langMap[lang] ?? Language.PT;
      await prisma.user.upsert({
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
      });
    } catch (e) {
      warn("setlang - erro ao salvar no db", e);
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
    const currentLang = ctx.session.locale || "pt";
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
