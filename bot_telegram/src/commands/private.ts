import { CommandGroup, LanguageCodes } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { botPrefix, options, typeBot } from "./botConfigCommands.js";
import { helpCommand } from "../handlers/commands/globais/help.js";
import { StartGreetings } from "../handlers/commands/globais/Start.js";

import { debug } from "../utils/log.js";
import { ComandosUser } from "./User.js";

const privateCommands = new CommandGroup<MyContext>();

privateCommands
  .command("start", "Start the bot and get a greeting message", options)
 .addToScope({ type: "default" }, (ctx) => StartGreetings(ctx))
  .localize(LanguageCodes.Portuguese, "start", "Inicia a configuração do bot")
  .localize(LanguageCodes.English, "start", "Start the bot");

privateCommands
  .command("help", "Get help and information about the bot", options)
  .addToScope({ type: "all_private_chats" }, (ctx) => helpCommand(ctx))
  .localize(LanguageCodes.Portuguese, "help", "Obtém ajuda e informações sobre o bot")
  .localize(LanguageCodes.English, "help", "Get help and information about the bot");

privateCommands
  .command("login", "Get help and information about the bot", options)
  .addToScope({ type: "all_private_chats" }, (ctx) => helpCommand(ctx))
  .localize(LanguageCodes.Portuguese, "login", "Obtém ajuda e informações sobre o bot")
  .localize(LanguageCodes.English, "login", "Get help and information about the bot");

for (const [key, value] of Object.entries(ComandosUser)) {

if(true)continue;


  privateCommands
    .command(value.command, value.description.en, options)
    .addToScope({ type: "all_private_chats" }, async (ctx: MyContext) => {
      debug("Comando private " + value.command + " executado por", ctx.from?.username || ctx.from?.id);
      await value.handler(ctx);
    })
    .localize(LanguageCodes.Portuguese, value.command, value.description.pt)
    .localize(LanguageCodes.English, value.command, value.description.en);
}

export { privateCommands };