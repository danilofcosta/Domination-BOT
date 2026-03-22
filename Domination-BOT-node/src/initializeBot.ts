import { Bot, session } from "grammy";
import { I18n } from "@grammyjs/i18n";
import path from "node:path";
import { fileURLToPath } from "node:url";

import localeNegotiator from "./utils/localeNegotiator.js";
import { type MyContext, type SessionData } from "./utils/customTypes.js";
import { tagbotCommands, devCommands, adminCommands } from "./commands.js";
import { listeners } from "./listeners.js";
import { callbacks } from "./callbackQuery.js";
import { NODE_ENV, type ChatType } from "./utils/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localesDir = path.join(__dirname, "locales");

export default async function initializeBot(
  ChatTypeBot: ChatType,
  BOT_TOKEN: string,
) {
  console.log("ChatTypeBot", ChatTypeBot);
  const bot = new Bot<MyContext>(BOT_TOKEN);

  bot.use(
    session({
      getSessionKey: (ctx) => ctx.chat?.id.toString(),
      initial: (): SessionData => ({
        settings: {
          genero: ChatTypeBot,
        },
        grupo: {
          cont: 0,
          dropId: null,
          data: null,
          character: null,
        },
      }),
    }),
  );

  const i18n = new I18n<MyContext>({
    defaultLocale: "pt",
    directory: localesDir,
    fluentBundleOptions: { useIsolating: false },
    localeNegotiator,
  });

  bot.use(i18n.middleware());

  /* =========================
   * COMMANDS
   * ========================= */
  bot.use(tagbotCommands);
  bot.use(adminCommands);
  bot.use(devCommands);



  if (process.env.NODE_ENV === NODE_ENV.PRODUCTION) {
    await tagbotCommands.setCommands(bot);
     // await adminCommands.setCommands(bot);
  }

  /* =========================
   * LISTENERS
   * ========================= */
  bot.use(listeners);
  bot.use(callbacks);

  /* =========================
   * ERROR HANDLER
   * ========================= */
  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Erro no update ${ctx.update.update_id}:`, err.error);

    if (err.error instanceof Error) {
      console.error(err.error.message);
    }
  });

  console.log("✅ Bot iniciado com sucesso");

  return bot;
}
