import type { Bot } from "grammy";
import type { MyContext } from "./utils/customTypes.js";
import { fatal, info } from "./utils/log.js";
import type { User } from "grammy/types";

export async function RunPolling({
  bot,
  dbtest,
  botInfo,
}: {
  bot: Bot<MyContext>;
  dbtest: boolean;
  botInfo?: User;
}) {
  if (botInfo) {
    info(
      "RODANDO BOT Polling",
      `rodando em @${botInfo.username ?? ""} com nome ${botInfo.first_name} com id ${botInfo.id}`,
    );
  }

  await bot.start({ 
    drop_pending_updates: true,
    onStart: async () => {
      if (process.env.CHAT_ID_DEV) {
        await bot.api.sendMessage(
          process.env.CHAT_ID_DEV,
          `Bot Iniciado ${process.env.TYPE_BOT}\nModo: ${process.env.NODE_ENV}\nConectado ao banco: ${dbtest}`,
        );
      }
    },
  });

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);

  async function shutdown() {
    if (process.env.CHAT_ID_DEV) {
      await bot.api.sendMessage(process.env.CHAT_ID_DEV, "Bot parado");
    }

    await bot.stop();

    fatal("Bot parado", process.env.NODE_ENV, process.env.TYPE_BOT);
  }
}