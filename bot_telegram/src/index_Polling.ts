import { fatal, info } from "./utils/log";

export async function RunPolling( bot:any,dbtest:Boolean) {
  await bot.start({
    drop_pending_updates: true,
    onStart: async () => {
      if (process.env.CHAT_ID_DEV) {
        await bot.api.sendMessage(
          process.env.CHAT_ID_DEV as string,
          `Bot Iniciado ${process.env.TYPE_BOT}\nModo : ${process.env.NODE_ENV}\nConectado ao banco: ${dbtest}`,
        );
        info("Bot iniciado", process.env.NODE_ENV, process.env.TYPE_BOT);
      }
    },
  });

  // parar o bot
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);

  async function shutdown() {
    if (process.env.CHAT_ID_DEV) {
      await bot.api.sendMessage(process.env.CHAT_ID_DEV, "Bot parado");
    }

    fatal("Bot parado", process.env.NODE_ENV, process.env.TYPE_BOT);
    await bot.stop();
  }
}
