import express from "express";
import { webhookCallback } from "grammy";

const app = express();

app.use(express.json());

export async function RunWebHook(bot: any) {
  app.all("/webhook", webhookCallback(bot, "express"));

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/", (req, res) => {
    res.json({ status: "DominarBot running", bot: process.env.TYPE_BOT });
  });

  return app;
}

export default app;
