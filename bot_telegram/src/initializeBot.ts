import { Bot } from "grammy";
import { I18n } from "@grammyjs/i18n";
import path from "node:path";
import { fileURLToPath } from "node:url";

import localeNegotiator from "./utils/localeNegotiator.js";
import { ChatType, type MyContext } from "./utils/customTypes.js";
import { listeners } from "./listeners.js";
import { callbacks } from "./callbackQuery.js";
import { privateCommands } from "./commands/private.js";
import { UserCommands } from "./commands/User.js";
import { adminCommands_bot } from "./commands/adminCommands_bot.js";
import { adminGroupsCommands } from "./commands/admin_groups.js";
import { devCommands } from "./commands/devcommands.js";
import { customCommands } from "./commands/custom_commands.js";
import { error } from "./utils/log.js";
import { Harem_setup } from "./handlers/callbacks/users_callback/harem_setup/harem_setup.js";
import { blockDetection } from "./bot/middleware/block_detection.js";
import { rateLimiter } from "./bot/middleware/rate_limiter.js";
import { banCheck } from "./bot/middleware/ban_check.js";
import { registerCommands } from "./bot/middleware/command_registrar.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const localesDir = path.join(__dirname, "locales");

export const i18n = new I18n<MyContext>({
  defaultLocale: "pt",
  directory: localesDir,
  fluentBundleOptions: { useIsolating: false },
  localeNegotiator,
});

export default async function initializeBot(
  ChatTypeBot: ChatType,
  BOT_TOKEN: string,
) {
  const bot = new Bot<MyContext>(BOT_TOKEN);

  bot.use(async (ctx, next) => {
    ctx.botType = ChatTypeBot;
    await next();
  });

  bot.use(i18n.middleware());
  bot.use(blockDetection);
  bot.use(rateLimiter);
  bot.use(banCheck);

  // if (process.env.NODE_ENV === "production") {
  //   await registerCommands(bot);
  // }

  bot.use(privateCommands);
  bot.use(UserCommands);
  bot.use(adminCommands_bot);
  bot.use(adminGroupsCommands);
  bot.use(devCommands);
  bot.use(customCommands);
  Harem_setup(bot);

  bot.use(listeners);
  bot.use(callbacks);

  return bot;
}
