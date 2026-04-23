import { Bot, session } from "grammy";
import { I18n } from "@grammyjs/i18n";
import { limit } from "@grammyjs/ratelimiter";
import { PrismaAdapter } from "@grammyjs/storage-prisma";
import { prisma } from "../lib/prisma.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

import localeNegotiator from "./utils/localeNegotiator.js";
import {
  ChatType,
  NODE_ENV,
  type MyContext,
  type SessionData,
} from "./utils/customTypes.js";
import { listeners } from "./listeners.js";
import { callbacks } from "./callbackQuery.js";
import { privateCommands } from "./CommandesManage/private.js";
import {  UserCommands } from "./CommandesManage/User.js";
import { adminCommands_bot } from "./CommandesManage/adminCommands_bot.js";
import { adminGroupsCommands } from "./CommandesManage/admin_groups.js";
import { devCommands } from "./CommandesManage/devcommands.js";
import { isUserBanned } from "./utils/permissions.js";
import { customCommands } from "./CommandesManage/custom_commands.js";
import { error, warn } from "./utils/log.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const localesDir = path.join(__dirname, "locales");

const fallbackSession = new Map<string, SessionData>();

function getInitialSession(chatTypeBot: string): SessionData {
  return {
    settings: { genero: chatTypeBot as any },
    grupo: {
      title: null,
      directMessagesTopicId: null,
      cont: 0,
      dropId: null,
      data: null,
      character: null,
    },
  };
}

export default async function initializeBot(
  ChatTypeBot: ChatType,
  BOT_TOKEN: string,
) {
  const bot = new Bot<MyContext>(BOT_TOKEN);

  bot.use(
    session({
      getSessionKey: (ctx) => `${ChatTypeBot}_${ctx.chat?.id || ctx.from?.id}`,
      initial: () => getInitialSession(ChatTypeBot),
      storage: new PrismaAdapter(prisma.session as any),
    }),
  );

  const i18n = new I18n<MyContext>({
    defaultLocale: "pt",
    directory: localesDir,
    fluentBundleOptions: { useIsolating: false },
    localeNegotiator,
  });

  bot.use(i18n.middleware());

//  bot.use(
//limit({
//      timeFrame: 1000,
//      limit: 3,
//    }),
//  );


// ingnora mensagem de user banido
  bot.use(async (ctx, next) => {
    if (!ctx.from) return;
    const banned = await isUserBanned(ctx.from.id);
    if (banned) {
      return;
    }
    await next();
  });

  bot.use(privateCommands);
  bot.use(UserCommands);
  bot.use(adminCommands_bot);
  bot.use(adminGroupsCommands);
  bot.use(devCommands);
  bot.use(customCommands);

  bot.use(listeners);
  bot.use(callbacks);

if (process.env.NODE_ENV === "production") {
  try {
    console.log("Configurando comandos do bot...");

    await privateCommands.setCommands(bot);//comandos privado
    await UserCommands.setCommands(bot); // comandos publicos
    await adminGroupsCommands.setCommands(bot);// comandos para adms do grupos
   // await devCommands.setCommands(bot);// comandos dev
   // await adminCommands_bot.setCommands(bot); // comando para adms do bot
    await customCommands.setCommands(bot);

  } catch (e: any) {
    if (e.error_code === 429) {
      const wait = e.parameters?.retry_after ?? 60;
      console.log(`Rate limit atingido. Aguardando ${wait}s...`);

      await new Promise(res => setTimeout(res, wait * 1000));

      console.log("Tentando novamente...");

      // tenta de novo (uma vez só)
      await privateCommands.setCommands(bot);
      await UserCommands.setCommands(bot);
      await adminGroupsCommands.setCommands(bot);
      await devCommands.setCommands(bot);
      await adminCommands_bot.setCommands(bot);
      await customCommands.setCommands(bot);

    } else {
      console.error("Erro ao configurar comandos:", e);
    }
  }
}
  bot.catch((err: any) => {
    const ctx = err.ctx;
    const msg = err.error?.message || "";
    
    if (msg.includes("timeout") || err.error?.code === "P2010") {
      warn(`Timeout no banco, inicializando sessão em memória`);
      ctx.session = getInitialSession(ChatTypeBot);
      return;
    }
    
    error(`Erro no update ${ctx.update.update_id}`, err.error);
  });

  return bot;
}