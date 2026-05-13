import { InlineKeyboard } from "grammy";
import { prisma } from "../../../../lib/prisma.js";
import { Language, ProfileType, type MyContext } from "../../../utils/customTypes.js";
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
      await prisma.user.upsert({
        where: { telegramId: BigInt(ctx.from.id) },
        update: { language: lang === "en" ? Language.EN : Language.PT },
        create: {
          telegramId: BigInt(ctx.from.id),
          language: lang === "en" ? Language.EN : Language.PT,
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
    const currentLabel = currentLang === "pt" ? ctx.t("setlang-name-pt") : ctx.t("setlang-name-en");

    const keyboard = new InlineKeyboard()
      .text(
        `${currentLang === "pt" ? "✅ " : ""}${ctx.t("setlang-btn-pt")}`,
        "setlang_pt",
      )
      .text(
        `${currentLang === "en" ? "✅ " : ""}${ctx.t("setlang-btn-en")}`,
        "setlang_en",
      );

    await ctx.reply(
      `${ctx.t("setlang-title")}\n${ctx.t("setlang-current", { lang: currentLabel })}`,
      { reply_markup: keyboard },
    );
    return;
  }

  if (input === "pt" || input === "en") {
    await setLanguage(ctx, input);
    const label = input === "pt" ? ctx.t("setlang-name-pt") : ctx.t("setlang-name-en");
    await ctx.reply(ctx.t("setlang-success", { lang: label }));
    return;
  }

  await ctx.reply(ctx.t("setlang-invalid"));
}
