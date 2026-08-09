import type { MyContext } from "../../../utils/customTypes.js";
import { getGroupConfig } from "../../../cache/groupConfig.js";
import { isGroupAdmin } from "../../../utils/permissions.js";
import { sendMessageCustom } from "../../../utils/sendMessageCustom.js";
import { buildConfigMenu } from "../../CallbackQueries/CallbacksAdminBot/configCallback.js";
import { AdminGroupCommandsRegistryDict } from "../../../CommandsRegistry/CommandsRegistryAdminGroup.js";

export async function configHandler(ctx: MyContext) {
  const chatId = ctx.chat?.id;
  const userId = ctx.from?.id;
  if (!chatId || !userId) return;

  if (ctx.chat?.type !== "group" && ctx.chat?.type !== "supergroup") {
    const commands = Object.values(AdminGroupCommandsRegistryDict)
      .map((c) => `/${c.command}`)
      .join(" ou ");
    await sendMessageCustom({
      ctx,
      caption: ctx.t("config_group_only", { commands }),
    });
    return;
  }

  const isAdmin = await isGroupAdmin(ctx, userId, chatId);
  if (!isAdmin) {
    await sendMessageCustom({ ctx, caption: ctx.t("config_only_admin") });
    return;
  }

  const config = await getGroupConfig(chatId, ctx.botType);
  const { caption, reply_markup } = await buildConfigMenu(ctx, config);
  await sendMessageCustom({ ctx, caption, reply_markup });
}
