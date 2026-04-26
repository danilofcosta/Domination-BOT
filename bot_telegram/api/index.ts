import initializeBot from "../src/initializeBot.js";
import "dotenv/config";

import { Environment_validation } from "../src/utils/testes/environment_validation.js";
import { testDBConnection } from "../src/utils/testes/test_db_Connection.js";
import { ChatType } from "../src/utils/customTypes.js";
import { RunWebHook } from "../src/index_webhook.js";

await Environment_validation();
await testDBConnection();

const BOT_TOKEN =
  process.env.TYPE_BOT?.toLowerCase() === ChatType.WAIFU
    ? process.env.BOT_TOKEN_WAIFU
    : process.env.BOT_TOKEN_HUSBANDO;

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN não definido");
}

const bot = await initializeBot(process.env.TYPE_BOT as ChatType, BOT_TOKEN);

const app = await RunWebHook(bot);

export default app;