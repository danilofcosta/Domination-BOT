import { InlineKeyboard } from "grammy";
import { ChatType, type MyContext } from "../../../uteis/CustomTypes.js";
import { prisma } from "../../../lib/prisma.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";
import { info, warn } from "../../../uteis/log.js";
import { haremModes, getDefaultHaremMode } from "./haremModes.js";

export async function HaremmodeHandler(ctx: MyContext) {
  let currentMode = getDefaultHaremMode();

  if (ctx.from?.id) {
    try {
      const user = await prisma.telegramUser.findUnique({
        where: { telegramId: BigInt(ctx.from.id) },
        select: { husbandoConfig: true, waifuConfig: true },
      });

      if (user) {
        const config = (
          ctx.botType === ChatType.HUSBANDO
            ? user.husbandoConfig
            : user.waifuConfig
        ) as Record<string, any> | null;
        currentMode = (config?.haremMode as string) || getDefaultHaremMode();
      }
    } catch {
      warn("HaremmodeHandler - erro ao buscar config do usuário");
    }
  }

  const keyboard = InlineKeyboard.from([
    ...chunk(haremModes, 2).map((row) =>
      row.map((mode) => ({
        text: `${currentMode === mode.id ? "✅ " : ""}${ctx.t(mode.labelKey)}`,
        callback_data: `haremmode_${mode.id}`,
      })),
    ),
    [{ text: ctx.t("btn-close"), callback_data: "close" }],
  ]);

  info("HaremmodeHandler - exibindo modos", {
    userId: ctx.from?.id,
    currentMode,
  });

  await SendMensageCustom({
    ctx,
    caption: ctx.t("haremmode-caption"),
    reply_markup: keyboard,
  });
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size)
    result.push(arr.slice(i, i + size));
  return result;
}
