import express from "express";
import { webhookCallback } from "grammy";

let init = false;

export async function RunWebHook(bot: any) {
console.log('RODANDO BOT Webhook')

const app = express();
app.use(express.json());

app.use(webhookCallback(bot, "express"));

 if (process.env.CHAT_ID_DEV && !init) {
        await bot.api.sendMessage(
          process.env.CHAT_ID_DEV as string,
          `Bot Iniciado ${process.env.TYPE_BOT}\nModo : ${process.env.NODE_ENV}`,
        );
        init = true;
      }

      return app;
}


