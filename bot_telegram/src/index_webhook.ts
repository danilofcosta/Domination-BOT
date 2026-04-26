import express from "express";
import { webhookCallback } from "grammy";

const app = express();

app.use(express.json());

export async function RunWebHook(bot: any) {
console.log('RODANDO BOT Webhool')

const app = express(); // or whatever you're using
app.use(express.json()); // parse the JSON request body

// "express" is also used as default if no argument is given.
app.use(webhookCallback(bot, "express"));
}


