import { Bot, session } from "grammy";
import { autoRetry } from "@grammyjs/auto-retry";
import type { ChatType, MyContext, SessionData } from "./utils/customTypes.js";
import { listeners } from "./listeners.js";
import { callbacks } from "./callbackQuery.js";
import { translationService } from "./locales/translationService.js";
import { i18nMiddleware } from "./locales/i18nFlavor.js";
import { userCommandsRegistry } from "./CommandsRegistry/CommandsRegistryUser.js";
import { HiddenCommandsRegistry } from "./CommandsRegistry/CommandsRegistryHidden.js";
import {
  AdminBotCommandsRegistry,
  AdminBotCommandsRegistryDict,
} from "./CommandsRegistry/CommandsRegistryAdminBot.js";
import { devCommands } from "./CommandsRegistry/CommandsRegistryAdminDev.js";
import { GlobaisCommandsRegistry } from "./CommandsRegistry/CommandsRegistryGlobais.js";
import { AdminGroupCommandsRegistry } from "./CommandsRegistry/CommandsRegistryAdminGroup.js";
import { error, info } from "./utils/log.js";
import { blockDetection } from "./bot/middleware/blockDetection.js";
import { rateLimiter } from "./bot/middleware/rateLimiter.js";
import { banCheck } from "./bot/middleware/banCheck.js";
import { testDbConnection } from "./bot/tests/testDbConnection.js";

function initialSessionData(): SessionData {
  return {
    chatType: "private",
    chatTypeBot: process.env.CHAT_TYPE_BOT as ChatType,
    chatTitle: "",
  };
}
async function deleteAllCommands(bot: Bot<MyContext>) {
  await Promise.all([
    bot.api.deleteMyCommands({
      scope: { type: "default" },
    }),

    bot.api.deleteMyCommands({
      scope: { type: "all_private_chats" },
    }),

    bot.api.deleteMyCommands({
      scope: { type: "all_group_chats" },
    }),

    bot.api.deleteMyCommands({
      scope: { type: "all_chat_administrators" },
    }),
  ]);
}

export default async function initializeBot(
  ChatTypeBot: ChatType,
  BOT_TOKEN: string,
): Promise<Bot<MyContext>> {
  const bot = new Bot<MyContext>(BOT_TOKEN);
  const testDbConnectionResult: boolean = await testDbConnection();

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
    // definição do tipo de chat e título do chat na sessão
    const chat = ctx.chat;
    const chatType = (chat?.type ?? "private") as SessionData["chatType"];
    ctx.session.chatType = chatType; // definição do tipo de chat na sessão (private, group, supergroup, channel)
    ctx.botType = ChatTypeBot; // definição do tipo de bot na sessão WAIFU ou HUSBANDO
    ctx.session.chatTitle =
      chatType === "private"
        ? (ctx.from?.first_name ?? ctx.from?.username ?? "")
        : chat && "title" in chat
          ? ((chat as { title?: string }).title ?? "")
          : ""; // definição do título do chat na sessão (nome do usuário ou título do grupo/canal)
    await next();
  });
  // inicialização do serviço de tradução e registro dos middlewares
  await translationService.init();
  bot.use(i18nMiddleware);
  bot.use(blockDetection);
  bot.use(rateLimiter);
  bot.use(banCheck);

  // registro dos comandos do bot visiveis para os usuários
  await deleteAllCommands(bot);
  await userCommandsRegistry.setCommands(bot);
   await GlobaisCommandsRegistry.setCommands(bot);
  if (process.env.GROUP_ADM) {
    await bot.api.setMyCommands(
      Object.values(AdminBotCommandsRegistryDict).map((cfg) => ({
        command: cfg.command,
        description: cfg.description.pt,
      })),
      {
        scope: {
          type: "chat",
          chat_id: process.env.GROUP_ADM || 0,
        },
      },
    );
  }

  info("registrando comandos");
  bot.use(userCommandsRegistry);
  bot.use(HiddenCommandsRegistry);
  bot.use(AdminBotCommandsRegistry);
  bot.use(GlobaisCommandsRegistry);
  bot.use(AdminGroupCommandsRegistry);
  bot.use(devCommands);

  info("registrando listeners");
  bot.use(listeners);
  bot.use(callbacks);
  // tratamento de erros do bot
  bot.catch((err) => {
    error("BOT ERROR:", err);
  });

  return bot;
}
