import initializeBot from "./initializeBot.js";
import "dotenv/config";

import { Environment_validation } from "./utils/testes/environment_validation.js";
import { testDBConnection } from "./utils/testes/test_db_Connection.js";
import { ChatType, NODE_ENV } from "./utils/customTypes.js";
import { fatal, info } from "./utils/log.js";
import { RunPolling } from "./index_Polling.js";
import { RunWebHook } from "./index_webhook.js";

await Environment_validation();
await testDBConnection();

const BOT_TOKEN =
  process.env.TYPE_BOT?.toLowerCase() === ChatType.WAIFU
    ? process.env.BOT_TOKEN_WAIFU
    : process.env.BOT_TOKEN_HUSBANDO;

if (!BOT_TOKEN) {
  fatal("BOT_TOKEN não definido nas variáveis de ambiente");
  process.exit(1);
}

const bot = await initializeBot(process.env.TYPE_BOT as ChatType, BOT_TOKEN);

await bot.api.deleteWebhook({ drop_pending_updates: true });
info("Bot instanciado com sucesso");

if (process.env.NODE_ENV === NODE_ENV.DEVELOPMENT || !process.env.ENDPOINT) {
  await RunPolling(bot, true);
} else if (
  process.env.NODE_ENV === NODE_ENV.PRODUCTION &&
  process.env.ENDPOINT
) {
  await RunWebHook(
    process.env.TYPE_BOT?.toLowerCase() ?? "waifu",
    bot,
    process.env.ENDPOINT!,
  );
} else {
  info("NODE_ENV não definido corretamente");
   await RunPolling(bot, true);
}
