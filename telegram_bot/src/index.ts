import "dotenv/config";

import { ChatType } from "./uteis/CustomTypes.js";
import initializeBot from "./initializeBot.js";
import { RunPolling } from "./index_Polling.js";

const start = async () => {
  const type =
    process.env.TYPE_BOT?.toLowerCase() === ChatType.WAIFU
      ? ChatType.WAIFU
      : ChatType.HUSBANDO;

  const BOT_TOKEN =
    type === ChatType.WAIFU
      ? process.env.BOT_TOKEN_WAIFU
      : process.env.BOT_TOKEN_HUSBANDO;

  if (!BOT_TOKEN) {
    console.error(
      "BOT_TOKEN não encontrado. Defina BOT_TOKEN_WAIFU ou BOT_TOKEN_HUSBANDO no .env",
    );
    process.exit(1);
  }

  console.log(`Iniciando o bot... (tipo: ${type})`);
  const bot = await initializeBot(type, BOT_TOKEN);
  RunPolling({ bot: bot, dbtest: true });

};

start();
