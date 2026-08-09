import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../../utils/customTypes.js";
import {
  getGroupConfig,
  setGroupConfig,
  type GroupConfig,
} from "../../../cache/groupConfig.js";
import { getDropConfig } from "../../../cache/dropConfig.js";
import { isGroupAdmin } from "../../../utils/permissions.js";
import { info, warn } from "../../../utils/log.js";

const MIN_DROP_MSG = 100;
const DROP_STEP = 100;

export async function buildConfigMenu(ctx: MyContext, config: GroupConfig) {
  const global = await getDropConfig();
  const dropsEnabled = config.dropsEnabled ?? true;
  const dropMsg = Math.max(config.dropMsg ?? global.dropMsg, MIN_DROP_MSG);

  const botLabel =
    ctx.botType === "waifu"
      ? "da Federação"
      : `do @${ctx.me?.username ?? "Husbando"}`;

  const caption = ctx.t("config_title", {
    group: ctx.chat?.title ?? String(ctx.chat?.id ?? ""),
    dropStatus: ctx.t(dropsEnabled ? "config_status_on" : "config_status_off"),
    dropMsg: String(dropMsg),
    configTitleLabel: botLabel,
  });

  const reply_markup = new InlineKeyboard()
    .text(
      ctx.t(dropsEnabled ? "config_btn_toggle_off" : "config_btn_toggle_on"),
      "config_toggle_drop",
    )
    .row()
    .text(ctx.t("config_btn_minus"), "config_drop_minus")
    .text(ctx.t("config_btn_plus"), "config_drop_plus")
    .row()
    .text(ctx.t("btn-close"), "close");

  return { caption, reply_markup };
}

export async function configCallbackHandler(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;
  const chatId = ctx.chat?.id;
  const userId = ctx.from?.id;
  if (!chatId || !userId) return;

  const isAdmin = await isGroupAdmin(ctx, userId, chatId);
  if (!isAdmin) {
    await ctx.answerCallbackQuery({
      text: ctx.t("config_only_admin"),
      show_alert: true,
    });
    return;
  }

  const config = await getGroupConfig(chatId, ctx.botType);
  const global = await getDropConfig();

  const patch: GroupConfig = {};
  switch (ctx.callbackQuery.data) {
    case "config_toggle_drop":
      patch.dropsEnabled = !(config.dropsEnabled ?? true);
      break;
    case "config_drop_minus":
      patch.dropMsg = Math.max(
        (config.dropMsg ?? global.dropMsg) - DROP_STEP,
        MIN_DROP_MSG,
      );
      break;
    case "config_drop_plus":
      patch.dropMsg = (config.dropMsg ?? global.dropMsg) + DROP_STEP;
      break;
    default:
      await ctx.answerCallbackQuery();
      return;
  }

  await setGroupConfig(chatId, ctx.botType, patch, ctx.chat?.title);

  const { caption, reply_markup } = await buildConfigMenu(ctx, {
    ...config,
    ...patch,
  });

  try {
    await ctx.editMessageText(caption, {
      parse_mode: "HTML",
      reply_markup,
    });
  } catch (e: any) {
    if (!String(e?.description ?? "").includes("message is not modified")) {
      warn("configCallback - erro ao editar mensagem", e);
    }
  }

  await ctx.answerCallbackQuery(
    ctx.callbackQuery.data === "config_toggle_drop"
      ? ctx.t(
          patch.dropsEnabled
            ? "config_drops_enabled"
            : "config_drops_disabled",
        )
      : ctx.t("config_updated"),
  );
  info("configCallback - config atualizada", {
    chatId,
    userId,
    action: ctx.callbackQuery.data,
    patch,
  });
}
