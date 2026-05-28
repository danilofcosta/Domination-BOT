import initializeBot from "./initializeBot.js";
import "dotenv/config";

import { Environment_validation } from "./utils/testes/environment_validation.js";
import { testDBConnection } from "./utils/testes/test_db_Connection.js";
import { ChatType, NODE_ENV } from "./utils/customTypes.js";
import { fatal, info } from "./utils/log.js";
import { RunPolling } from "./index_Polling.js";
// import { RunWebHook } from "./index_webhook.js";

await Environment_validation();
await testDBConnection();

// 🔐 tokens
const BOT_TOKEN_WAIFU = process.env.BOT_TOKEN_WAIFU;
const BOT_TOKEN_HUSBANDO = process.env.BOT_TOKEN_HUSBANDO;

if (!BOT_TOKEN_WAIFU || !BOT_TOKEN_HUSBANDO) {
  fatal("Tokens não definidos no .env");
  process.exit(1);
}

// 🤖 bots
const bots = {
  waifu: await initializeBot(ChatType.WAIFU, BOT_TOKEN_WAIFU),
  husbando: await initializeBot(ChatType.HUSBANDO, BOT_TOKEN_HUSBANDO),
};

// 🚀 bootstrap
async function main() {
  const env = process.env.NODE_ENV;

  if (!env) {
    fatal("NODE_ENV não definido");
    process.exit(1);
  }

  if (env === NODE_ENV.DEVELOPMENT) {
    await Promise.all([
      RunPolling(bots.waifu, true),
      RunPolling(bots.husbando, true),
    ]);
    info("Bots rodando em polling (dev)");
    return;
  }

  if (env === NODE_ENV.PRODUCTION) {
    const endpoint = process.env.ENDPOINT;

    if (!endpoint) {
      fatal("ENDPOINT não definido");
      process.exit(1);
    }

    info("Bots rodando com webhook (prod)");
    return;
  }

  fatal("NODE_ENV inválido:", env);
  process.exit(1);
}

await main();
