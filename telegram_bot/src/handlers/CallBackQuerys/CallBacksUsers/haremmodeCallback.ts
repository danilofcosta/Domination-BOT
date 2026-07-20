import type { MyContext } from "../../../uteis/CustomTypes.js";
import { prisma } from "../../../lib/prisma.js";
import { ChatType } from "../../../uteis/CustomTypes.js";
import { info, warn } from "../../../uteis/log.js";
import { haremModes } from "../../Commands/CommandsUser/haremModes.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";
import { EditOrSendText } from "../../../uteis/uteis_telegram/EditOrSendText.js";

export async function haremmodeCallback(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;

  const modeMatch = ctx.callbackQuery.data.replace("haremmode_", "");
  const userId = ctx.from?.id;
  if (!userId) return;

  const isValid = haremModes.some((m) => m.id === modeMatch);
  if (!isValid) {
    warn("haremmodeCallback - modo inválido", { modeMatch });
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
  await EditOrSendText({
    ctx,
    caption: ctx.t("haremmodecb-updated", { mode: modeText }),
  });

  info("haremmodeCallback - modo atualizado", { userId, mode: modeMatch });
}
