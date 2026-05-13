import { Language } from "../../../../generated/prisma/client.js";
import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../utils/customTypes.js";
import { getUserRole, roleWeights } from "../../../utils/permissions.js";
import { ProfileType } from "../../../../generated/prisma/client.js";
import { warn } from "../../../utils/log.js";

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

  if (lang !== "pt" && lang !== "en") {
    await ctx.answerCallbackQuery(ctx.t("setlang-invalid"));
    return;
  }

  ctx.session.locale = lang;
  ctx.i18n.useLocale(lang);

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
    warn("setlangCallback - erro ao salvar no db", e);
  }

  const label = lang === "pt" ? ctx.t("setlang-name-pt") : ctx.t("setlang-name-en");

  await ctx.editMessageText(ctx.t("setlang-success", { lang: label }));
  await ctx.answerCallbackQuery();
}
