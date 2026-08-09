import "dotenv/config";

import { ChatType } from "./utils/customTypes.js";
import initializeBot from "./initializeBot.js";
import { RunPolling } from "./indexPolling.js";
import { checkBotToken } from "./utils/checkBot.js";
import { fatal } from "./utils/log.js";
import { environmentValidation } from "./bot/tests/environmentValidation.js";
import { startInvalidationSubscriber } from "./cache/invalidationSubscriber.js";

const start = async () => {
  await environmentValidation()
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
 
  await startInvalidationSubscriber();
 
 
  RunPolling({ bot: bot, dbtest: true, botInfo: me });

};

start();
