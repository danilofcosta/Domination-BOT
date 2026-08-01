import "dotenv/config";

import { ChatType } from "./uteis/CustomTypes.js";
import initializeBot from "./initializeBot.js";
import { RunPolling } from "./index_Polling.js";
import { checkBotToken } from "./uteis/checkBot.js";
import { fatal } from "./uteis/log.js";

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
    fatal(
      "BOT_TOKEN não encontrado. Defina BOT_TOKEN_WAIFU ou BOT_TOKEN_HUSBANDO no .env",
    );
  }

  console.log(`Iniciando o bot... (tipo: ${type})`);
  const bot = await initializeBot(type, BOT_TOKEN);

  const me = await checkBotToken(BOT_TOKEN, () => bot.api.getMe());
  RunPolling({ bot: bot, dbtest: true, botInfo: me });

};

start();
