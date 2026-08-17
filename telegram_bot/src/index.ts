import "dotenv/config";

import { ChatType, NODE_ENV } from "./utils/customTypes.js";
import initializeBot from "./initializeBot.js";
import { RunPolling } from "./indexPolling.js";
import { checkBotToken } from "./utils/checkBot.js";
import { fatal, info } from "./utils/log.js";
import { environmentValidation } from "./bot/tests/environmentValidation.js";
import { startInvalidationSubscriber } from "./cache/invalidationSubscriber.js";
import { RunWebHook } from "./index_webhook.js";

const start = async () => {
  await environmentValidation()
   let app;
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

  info(`Iniciando o bot... (tipo: ${type})`);
  const bot = await initializeBot(type, BOT_TOKEN);
  info(`Checando o token do bot... (tipo: ${type})`);
  const me = await checkBotToken(BOT_TOKEN, () => bot.api.getMe());
 
  await startInvalidationSubscriber();
 


 


  
  if (
    process.env.VERCEL === "true" ||
    process.env.NODE_ENV === NODE_ENV.PRODUCTION
  ) {
    app = await RunWebHook({bot});
  } else if (process.env.NODE_ENV === NODE_ENV.DEVELOPMENT) {
    
  RunPolling({ bot: bot, dbtest: true, botInfo: me });
  } else {
    info("NODE_ENV não definido, usando polling");

  RunPolling({ bot: bot, dbtest: true, botInfo: me });
  }

  return app;

};

export default start();
