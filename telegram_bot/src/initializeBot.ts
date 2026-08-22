import { Bot, session } from "grammy";
import type { BotCommandScope, LanguageCode } from "grammy/types";
import { autoRetry } from "@grammyjs/auto-retry";
import type { ChatType, MyContext, SessionData } from "./utils/customTypes.js";
import { listeners } from "./listeners.js";
import { callbacks } from "./callbackQuery.js";
import { translationService } from "./locales/translationService.js";
import { i18nMiddleware } from "./locales/i18nFlavor.js";
import { menuRegistry } from "./CommandsRegistry/menuRegistry.js";
import { HiddenCommandsRegistry } from "./CommandsRegistry/CommandsRegistryHidden.js";
import { AdminGroupCommandsRegistry } from "./CommandsRegistry/CommandsRegistryAdminGroup.js";
import { devCommands } from "./CommandsRegistry/CommandsRegistryAdminDev.js";
import { admGroupScope } from "./CommandsRegistry/botConfigCommands.js";
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
/**
 * Limpeza legada: apaga TODOS os buckets de menu que este bot ja usou,
 * incluindo variantes por idioma (listas manuais antigas em pt/en tem
 * precedencia sobre a lista sem idioma e sombreariam o menu novo).
 * Rodar apenas no startup; depois de estabilizar, pode ser removida.
 */
async function purgeLegacyMenus(bot: Bot<MyContext>) {
  const globalScopes: BotCommandScope[] = [
    { type: "default" },
    { type: "all_private_chats" },
    { type: "all_group_chats" },
    { type: "all_chat_administrators" },
  ];

  const admScope = admGroupScope();
  if (admScope) {
    // "chat": legado do antigo setMyCommands manual; "chat_administrators": atual
    globalScopes.push(
      { type: "chat", chat_id: admScope.chat_id },
      { type: "chat_administrators", chat_id: admScope.chat_id },
    );
  }

  // undefined = lista sem idioma (bucket padrao)
  const languageCodes: (LanguageCode | undefined)[] = [undefined, "pt", "en"];

  await Promise.all(
    globalScopes.flatMap((scope) =>
      languageCodes.map((language_code) =>
        bot.api.deleteMyCommands({
          scope,
          ...(language_code ? { language_code } : {}),
        }),
      ),
    ),
  );
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

  // registro dos comandos visiveis para os usuarios:
  // limpeza legada + UNICO escritor do menu (menuRegistry)
  await purgeLegacyMenus(bot);
  await menuRegistry.setCommands(bot);

  info("registrando comandos");
  bot.use(menuRegistry);
  bot.use(HiddenCommandsRegistry);
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
