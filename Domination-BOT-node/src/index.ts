import initializeBot from "./initializeBot.js";
import "dotenv/config";
import { Environment_validation } from "./utils/environment_validation.js";
import { testDBConnection } from "./utils/test_db_Connection.js";
import { ChatType } from "./utils/types.js";

await Environment_validation();
testDBConnection();

let BOT_TOKEN :string | undefined= process.env.TYPE_BOT === ChatType.WAIFU
  ? process.env.BOT_TOKEN_WAIFU : process.env.BOT_TOKEN_HUSBANDO


// if (process.env.NODE_ENV && process.env.NODE_ENV ===  NODE_ENV.DEVELOPMENT) {
//   console.log("Ambiente de desenvolvimento");
// BOT_TOKEN = process.env.BOT_TOKEM_TESTE
// }
 // BOT_TOKEN = '7526140142:AAF_BiaMhp2FrjmXUFYahEBFBWuGD9YUdhk'

const bot = await initializeBot(
  process.env.TYPE_BOT as ChatType,
  BOT_TOKEN as string
);

//await bot.api.deleteWebhook({ drop_pending_updates: true });
// console.log('Bot instanciado com sucesso');


await bot.start({
  drop_pending_updates: true,
  onStart: async () => {
    if (process.env.CHAT_ID_DEV) {
      await bot.api.sendMessage(process.env.CHAT_ID_DEV as string, "Bot iniciado");
      console.log("Bot iniciado", process.env.NODE_ENV, process.env.TYPE_BOT);
      
    }
  },
});


// parar o bot
process.once("SIGINT", async () => {
  if (process.env.CHAT_ID) {
    await bot.api.sendMessage(process.env.CHAT_ID_DEV as string, "Bot parado");
    console.log("Bot parado", process.env.NODE_ENV, process.env.TYPE_BOT);
  }
  await bot.stop();
});
