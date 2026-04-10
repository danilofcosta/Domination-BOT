import { Bot, session } from "grammy";
import { I18n } from "@grammyjs/i18n";
import { limit } from "@grammyjs/ratelimiter";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaAdapter } from "@grammyjs/storage-prisma";
import { prisma } from "../lib/prisma.js";

import localeNegotiator from "./utils/localeNegotiator.js";
import { ChatType, type MyContext, type SessionData } from "./utils/customTypes.js";
import { listeners } from "./listeners.js";
import { callbacks } from "./callbackQuery.js";
import { privateCommands } from "./CommandesManage/private.js";
import { botCommands } from "./CommandesManage/User.js";
import { adminCommands } from "./CommandesManage/adminCommands.js";
import { devCommands } from "./CommandesManage/devcommands.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const localesDir = path.join(__dirname, "locales");

export default async function initializeBot(
  ChatTypeBot: ChatType,
  BOT_TOKEN: string,
) {
  const bot = new Bot<MyContext>(BOT_TOKEN);

  bot.use(
    session({
  getSessionKey: (ctx) => `${ChatTypeBot}_${ctx.chat?.id ||ctx.from?.id}` ,
      initial: (): SessionData => ({
        settings: {
          genero: ChatTypeBot,
    
        },
        grupo: {
          title: null,

          cont: 0,
          dropId: null,
          data: null,
          character: null,
        },
      }),
      storage: new PrismaAdapter(prisma.session as any),
    }),
  );

  const i18n = new I18n<MyContext>({
    defaultLocale: "pt",
    directory: localesDir,
    fluentBundleOptions: { useIsolating: false },
    localeNegotiator,
  });

  // i18n middleware
  bot.use(i18n.middleware());

  bot.use(limit({
    timeFrame: 1000,
    limit: 3,
  }));

  // comandos
  bot.use(privateCommands);
  bot.use(botCommands);
  bot.use(adminCommands);
  bot.use(devCommands);

  //LISTENERS
  bot.use(listeners);
  bot.use(callbacks);

//   if (process.env.NODE_ENV === NODE_ENV.PRODUCTION) {
//    await botCommands.setCommands(bot);
//  //   await adminCommands.setCommands(bot);
//   }

  // Error handling
  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Erro no update ${ctx.update.update_id}:`, err.error);

    if (err.error instanceof Error) {
      console.error(err.error.message);
    }
  });

  return bot;
}
