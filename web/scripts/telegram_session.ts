import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import readline from "readline";
import "dotenv/config";

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession("");
const Token = process.env.BOT_TOKEN_HUSBANDO || "";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
console.log("Starting Telegram session...");

(async () => {
  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, apiId, apiHash || "", {
    connectionRetries: 5,
  });
  await client.start({
    botAuthToken: Token,
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
  console.log("Session string:", client.session.save());
})();
