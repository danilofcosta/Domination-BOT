import type { MyContext } from "../../../utils/customTypes.js";
import { prisma } from "../../../lib/prisma.js";
import { ChatType } from "../../../utils/customTypes.js";
import { info, warn } from "../../../utils/log.js";
import { haremModes } from "../../Commands/CommandsUser/haremModes.js";
import { sendMessageCustom } from "../../../utils/sendMessageCustom.js";
import { editOrSendText } from "../../../utils/telegram/editOrSendText.js";

export async function haremModeCallback(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;

  const modeMatch = ctx.callbackQuery.data.replace("haremmode_", "");
  const userId = ctx.from?.id;
  if (!userId) return;

  const isValid = haremModes.some((m) => m.id === modeMatch);
  if (!isValid) {
    warn("haremModeCallback - modo inválido", { modeMatch });
    await ctx.answerCallbackQuery();
    return;
  }

  const user = await prisma.telegramUser.findUnique({
    where: { telegramId: BigInt(userId) },
  });

  if (!user) {
    await ctx.answerCallbackQuery(ctx.t("haremmodecb-user-not-found"));
    return;
  }

  const isHusbando = ctx.botType === ChatType.HUSBANDO;
  let config = (isHusbando ? user.husbandoConfig : user.waifuConfig) as Record<
    string,
    any
  > | null;
  if (!config || typeof config !== "object") config = {};

  const currentMode = (config.haremMode as string) || "default";
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

  const modeLabel =
    haremModes.find((m) => m.id === modeMatch)?.labelKey ?? modeMatch;
  const modeText = ctx.t(modeLabel);

  try {
    await ctx.editMessageCaption({
      caption: ctx.t("haremmodecb-selected", { mode: modeText }),
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [] },
    });
  } catch (e: any) {
    if (e?.description?.includes("there is no caption")) {
      await ctx
        .editMessageText(ctx.t("haremmodecb-selected", { mode: modeText }), {
          parse_mode: "HTML",
          reply_markup: { inline_keyboard: [] },
        })
        .catch(() => {});
    }
  }

  await ctx.answerCallbackQuery(
    ctx.t("haremmodecb-updated", { mode: modeText }),
  );
  await editOrSendText({
    ctx,
    caption: ctx.t("haremmodecb-updated", { mode: modeText }),
  });

  info("haremModeCallback - modo atualizado", { userId, mode: modeMatch });
}
