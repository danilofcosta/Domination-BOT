import { Bot, session } from "grammy";
import { autoRetry } from "@grammyjs/auto-retry";
import type { ChatType, MyContext, SessionData } from "./uteis/CustomTypes.js";
import { listeners } from "./listeners.js";
import { callbacks } from "./callbackQuery.js";
import { translationService } from "./locales/translationService.js";
import { i18nMiddleware } from "./locales/i18nFlavor.js";
import { userCommandsRegistry } from "./CommandsRegistry/CommandsRegistryUser.js";
import { HiddenCommandsRegistry } from "./CommandsRegistry/CommandsRegistryHidden.js";
import { AdminCommandsRegistry } from "./CommandsRegistry/CommandsRegistryAdminBot.js";
import { devCommands } from "./CommandsRegistry/CommandsRegistryAdminDev.js";
import { GlobaisCommandsRegistry } from "./CommandsRegistry/CommandsRegistryGlobais.js";
import { info } from "./uteis/log.js";
import { blockDetection } from "./bot/middleware/blockDetection.js";
import { rateLimiter } from "./bot/middleware/rateLimiter.js";
import { banCheck } from "./bot/middleware/banCheck.js";

function initialSessionData(): SessionData {
  return {
    chatType: "private",
    chatTypeBot: process.env.CHAT_TYPE_BOT as ChatType,
    chatTitle: "",
  };
}

export default async function initializeBot(
  ChatTypeBot: ChatType,
  BOT_TOKEN: string,
) {
  const bot = new Bot<MyContext>(BOT_TOKEN);

  await translationService.init();

  bot.api.config.use(autoRetry());

  bot.use(
    session({
      initial: initialSessionData,
      getSessionKey: (ctx) => `${ctx.chat?.type}_${ctx.chat?.id}`,
      prefix: "user-",
      type: "single",
    }),
  );

  bot.use(async (ctx, next) => {
    const chat = ctx.chat;
    const chatType = (chat?.type ?? "private") as SessionData["chatType"];
    ctx.session.chatType = chatType;
    ctx.session.chatTitle =
      chatType === "private"
        ? (ctx.from?.first_name ?? ctx.from?.username ?? "")
        : chat && "title" in chat
          ? ((chat as { title?: string }).title ?? "")
          : "";
    await next();
  });

  bot.use(async (ctx, next) => {
    ctx.botType = ChatTypeBot;
    await next();
  });

  bot.use(i18nMiddleware);
  bot.use(blockDetection);
  bot.use(rateLimiter);
  bot.use(banCheck);

  // bot.api.deleteMyCommands()
  // userCommandsRegistry.setCommands(bot)

  info('registrando comandos')
  bot.use(userCommandsRegistry)
  bot.use(HiddenCommandsRegistry)
  bot.use(AdminCommandsRegistry)
  bot.use(
    GlobaisCommandsRegistry
  )
  bot.use(devCommands)

  info('registrando listeners')

  bot.use(listeners);
  bot.use(callbacks);
  bot.catch((err) => {
    console.error("BOT ERROR:", err);
  });
  return bot;
}
