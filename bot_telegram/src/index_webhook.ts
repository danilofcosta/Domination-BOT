import express from "express";
import { webhookCallback } from "grammy";

//let init = false;

export async function RunWebHook(
  { bot }: { bot: any }
) {
  console.log("RODANDO BOT Webhook");

  const app = express();
  app.use(express.json());

  app.get("/", (req, res) => {
    res.status(200).json({ message: "Bot Telegram Webhook on" });
  }); 

  // 🔥 rota específica (ESSENCIAL)
  app.post("/webhook", webhookCallback(bot, "express"));


  app.get("/ping", (req, res) => {
    res.status(200).json({ message: "pong" });
  });

  // if (process.env.CHAT_ID_DEV && !init) {
  //   await bot.api.sendMessage(
  //     process.env.CHAT_ID_DEV,cls
  //     `Bot Iniciado ${process.env.TYPE_BOT}\nModo : ${process.env.NODE_ENV}`
  //   );
  //   init = true;
  // }

  return app;
}
