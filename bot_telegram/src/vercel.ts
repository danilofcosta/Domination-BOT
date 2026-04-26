import "dotenv/config";
import express from "express";
import { webhookCallback } from "grammy";
import initializeBot from "./initializeBot.js";
import { Environment_validation } from "./utils/testes/environment_validation.js";
import { testDBConnection } from "./utils/testes/test_db_Connection.js";
import { ChatType, NODE_ENV } from "./utils/customTypes.js";
import { fatal, info } from "./utils/log.js";

await Environment_validation();
await testDBConnection();

const BOT_TOKEN =
  process.env.TYPE_BOT?.toLowerCase() === ChatType.WAIFU
    ? process.env.BOT_TOKEN_WAIFU
    : process.env.BOT_TOKEN_HUSBANDO;

if (!BOT_TOKEN) {
  fatal("BOT_TOKEN não definido");
  process.exit(1);
}

const bot = await initializeBot(process.env.TYPE_BOT as ChatType, BOT_TOKEN);
info("Bot instanciado com sucesso");

const app = express();

app.use(express.json());

app.all("/webhook", webhookCallback(bot, "express"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;