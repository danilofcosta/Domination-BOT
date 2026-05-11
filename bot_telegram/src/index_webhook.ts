import express from "express";
import { webhookCallback } from "grammy";

//let init = false;

export async function RunWebHook(bot) {
  console.log("RODANDO BOT Webhook");

  const app = express();
  app.use(express.json());

  // 🔥 rota específica (ESSENCIAL)
  app.post("/webhook", webhookCallback(bot, "express"));


  app.post("/ping", (req, res) => {
    res.status(200).json({ message: "pong" });
  });

  // if (process.env.CHAT_ID_DEV && !init) {
  //   await bot.api.sendMessage(
  //     process.env.CHAT_ID_DEV,
  //     `Bot Iniciado ${process.env.TYPE_BOT}\nModo : ${process.env.NODE_ENV}`
  //   );
  //   init = true;
  // }

  return app;
}
