import initializeBot from "./initializeBot.js";
import "dotenv/config";
import { Environment_validation } from "./utils/testes/environment_validation.js";
import { testDBConnection } from "./utils/testes/test_db_Connection.js";
import { ChatType } from "./utils/customTypes.js";
// Validar variáveis de ambiente
await Environment_validation();

// Testar conexão com o banco de dados
const dbtest = await testDBConnection();

let BOT_TOKEN: string | undefined =
  process.env.TYPE_BOT?.toLowerCase() === ChatType.WAIFU
    ? process.env.BOT_TOKEN_WAIFU
    : process.env.BOT_TOKEN_HUSBANDO;

const bot = await initializeBot(
  process.env.TYPE_BOT as ChatType,
  BOT_TOKEN as string,
);

//await bot.api.deleteWebhook({ drop_pending_updates: true });
// console.log('Bot instanciado com sucesso');

await bot.start({
  drop_pending_updates: true,
  onStart: async () => {
    if (process.env.CHAT_ID_DEV) {
      await bot.api.sendMessage(
        process.env.CHAT_ID_DEV as string,
        `Bot Iniciado ${process.env.TYPE_BOT}\nModo : ${process.env.NODE_ENV}\nConectado ao banco: ${dbtest}`,
      );
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
