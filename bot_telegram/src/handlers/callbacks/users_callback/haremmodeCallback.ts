import type { MyContext } from "../../../utils/customTypes.js";
import { prisma } from "../../../lib/prisma.js";
import { ChatType } from "../../../utils/customTypes.js";
import { InlineKeyboard } from "grammy";

export async function haremmodeCallback(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;

  const modeMatch = ctx.callbackQuery.data.replace("haremmode_", ""); // latest, rarity, event
  const userId = ctx.from?.id;

  if (!userId) return;

  const user = await prisma.telegramUser.findUnique({
    where: { telegramId: BigInt(userId) },
  });
  if (!user) {
    await ctx.answerCallbackQuery(ctx.t("haremmodecb-user-not-found"));
    return;
  }

  const isHusbando = ctx.botType === ChatType.HUSBANDO;
  let config = isHusbando
    ? (user.husbandoConfig as any) || {}
    : (user.waifuConfig as any) || {};

  if (typeof config !== "object") config = {}; // safety

  const currentMode = config.haremMode || "latest";
  if (currentMode === modeMatch) {
    await ctx.answerCallbackQuery({
      text: ctx.t("haremmodecb-no-update"),
      show_alert: true,
    });
    return;
  }

  config.haremMode = modeMatch;

  await prisma.telegramUser.update({
    where: { telegramId: BigInt(userId) },
    data: isHusbando ? { husbandoConfig: config } : { waifuConfig: config },
  });

  const modeText =
    modeMatch === "latest"
      ? ctx.t("haremmode-recent")
      : modeMatch === "rarity"
        ? ctx.t("haremmode-rarity")
        : ctx.t("haremmode-event");

  await ctx
    .editMessageCaption({
      caption: ctx.t("haremmodecb-selected", { mode: modeText }),
      parse_mode: "HTML",
      reply_markup: undefined,
    })
    .catch(() => {});

  await ctx.answerCallbackQuery(
    ctx.t("haremmodecb-updated", { mode: modeText }),
  );
}
