import express from "express";
import { webhookCallback } from "grammy";

export async function RunWebHook(bot: any) {
  const app = express();

  app.use(express.json());

  app.all("/webhook", webhookCallback(bot, "express"));

  const port = process.env.PORT || 3000;

  app.listen(port, async () => {
    console.log(`Webhook server running on port ${port}`);
    if (process.env.CHAT_ID_DEV) {
      await bot.api.sendMessage(
        process.env.CHAT_ID_DEV,
        `Bot Iniciado ${process.env.TYPE_BOT}\nModo : ${process.env.NODE_ENV}\nConectado ao banco: `
      );
    }
  });
}
