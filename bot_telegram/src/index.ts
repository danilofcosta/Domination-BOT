import initializeBot from "./initializeBot.js";
import "dotenv/config";

import { Environment_validation } from "./utils/testes/environment_validation.js";
import { testDBConnection } from "./utils/testes/test_db_Connection.js";
import { ChatType, NODE_ENV } from "./utils/customTypes.js";
import { fatal, info } from "./utils/log.js";
import { RunPolling } from "./index_Polling.js";
import { RunWebHook } from "./index_webhook.js";
import express from "express";

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

info("Bot instanciado com sucesso");

if (process.env.VERCEL === "true" || process.env.NODE_ENV === NODE_ENV.PRODUCTION) {
  const app = await RunWebHook(bot);
  module.exports = app;
} else if (process.env.NODE_ENV === NODE_ENV.DEVELOPMENT) {
  await RunPolling(bot, true);
} else {
  info("NODE_ENV não definido, usando polling");
  await RunPolling(bot, true);
}
