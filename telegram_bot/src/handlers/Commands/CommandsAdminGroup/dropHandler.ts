import type { MyContext } from "../../../utils/customTypes.js";
import { getGroupConfig, setGroupConfig } from "../../../cache/groupConfig.js";
import { isGroupAdmin } from "../../../utils/permissions.js";
import { sendMessageCustom } from "../../../utils/sendMessageCustom.js";

const VALID_PARAMS = ["yes", "no", "on", "off"] as const;
type DropParam = (typeof VALID_PARAMS)[number];

function parseDropParam(ctx: MyContext): string {
  const text = ctx.message?.text ?? "";
  const space = text.indexOf(" ");
  return space === -1 ? "" : text.slice(space + 1).trim().toLowerCase();
}

export async function dropHandler(ctx: MyContext) {
  const chatId = ctx.chat?.id;
  const userId = ctx.from?.id;
  if (!chatId || !userId) return;

  if (ctx.chat?.type !== "group" && ctx.chat?.type !== "supergroup") {
    await sendMessageCustom({ ctx, caption: ctx.t("drop_cmd_group_only") });
    return;
  }

  const isAdmin = await isGroupAdmin(ctx, userId, chatId);
  if (!isAdmin) {
    await sendMessageCustom({ ctx, caption: ctx.t("drop_cmd_only_admin") });
    return;
  }

  const param = parseDropParam(ctx);

  if (param === "") {
    const config = await getGroupConfig(chatId, ctx.botType);
    const dropsEnabled = config.dropsEnabled ?? true;
    await sendMessageCustom({
      ctx,
      caption: ctx.t("drop_cmd_status", {
        typeBot: ctx.botType,
        status: dropsEnabled ? "verdadeiro" : "falso",
      }),
    });
    return;
  }

  if (!VALID_PARAMS.includes(param as DropParam)) {
    await sendMessageCustom({ ctx, caption: ctx.t("drop_cmd_invalid") });
    return;
  }

  const dropsEnabled = param === "yes" || param === "on";
  await setGroupConfig(
    chatId,
    ctx.botType,
    { dropsEnabled },
    ctx.chat?.title,
  );

  await sendMessageCustom({
    ctx,
    caption: ctx.t(dropsEnabled ? "config_drops_enabled" : "config_drops_disabled"),
  });
}
