import express from "express";
import { webhookCallback } from "grammy";

export async function RunWebHook(
  TYPE_BOT: string,
  bot: any,
  endpoint: string
) {
  if (!TYPE_BOT) {
    throw new Error("TYPE_BOT não definido");
  }

  if (!endpoint) {
    throw new Error("ENDPOINT não definido");
  }

  const path = `/webhook/${TYPE_BOT.toLowerCase()}`;
  const port = Number(`600${TYPE_BOT.length}`);

  await bot.api.deleteWebhook({ drop_pending_updates: true });
  await bot.api.setWebhook({
    url: `${endpoint}${path}`,
    drop_pending_updates: true,
  });

  const app = express();

  app.use(express.json());

  app.post(path, webhookCallback(bot, "express"));

  app.listen(port, () => {
    console.log(`[WEBHOOK] ${TYPE_BOT} rodando em ${path} na porta ${port}`);
  });
}