import express from "express";
import { webhookCallback } from "grammy";
import { prisma } from "./lib/prisma.js";

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


  app.post("/webhook", webhookCallback(bot, "express"));


  app.get("/ping", (req, res) => {
    res.status(200).json({ message: "pong" });
  });
  app.get("/me", (req, res) => {

    res.status(200).json({ info: bot.api.getMe() });
  });

  // if (process.env.CHAT_ID_DEV && !init) {
  //   await bot.api.sendMessage(
  //     process.env.CHAT_ID_DEV,cls
  //     `Bot Iniciado ${process.env.TYPE_BOT}\nModo : ${process.env.NODE_ENV}`
  //   );
  //   init = true;
  // }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  async function shutdown() {
    await prisma.$disconnect();
    process.exit(0);
  }

  return app;
}
