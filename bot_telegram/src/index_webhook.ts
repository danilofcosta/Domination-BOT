import express from "express";
import { webhookCallback } from "grammy";
import { info } from "./utils/log.js";

const app = express();

app.use(express.json());

export async function RunWebHook(bot: any) {
console.log('RODANDO BOT Webhool')

const app = express(); // or whatever you're using
app.use(express.json()); // parse the JSON request body

// "express" is also used as default if no argument is given.
app.use(webhookCallback(bot, "express"));

 if (process.env.CHAT_ID_DEV) {
        await bot.api.sendMessage(
          process.env.CHAT_ID_DEV as string,
          `Bot Iniciado ${process.env.TYPE_BOT}\nModo : ${process.env.NODE_ENV}`,
        );
        info("Bot iniciado", process.env.NODE_ENV, process.env.TYPE_BOT);
      }
}


