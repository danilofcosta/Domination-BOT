import express from "express";
import { webhookCallback } from "grammy";
//import { info } from "./utils/log.js";
let init  :boolean = false
const app = express();

app.use(express.json());

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
        init =true
      }

      return app;
}


