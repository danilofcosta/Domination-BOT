import { CommandGroup, LanguageCodes } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { botPrefix, options, typeBot } from "./botConfigCommands.js";
import { helpCommand } from "../handlers/Comandos/globais/help.js";
import { StartGreetings } from "../handlers/Comandos/globais/Start.js";
import { HaremHandler } from "../handlers/Comandos/users/harem.js";
import { Ramdon_Character_Handler } from "../handlers/Comandos/globais/random_character.js";
import { topHandler } from "../handlers/Comandos/users/top.js";
import { HaremmodeHandler } from "../handlers/Comandos/users/haremmode.js";
import { animelistCommand } from "../handlers/Comandos/users/animelist.js";
import { debug } from "../utils/log.js";

const privateCommands = new CommandGroup<MyContext>();

privateCommands
  .command("start", "Start the bot and get a greeting message", options)
  .addToScope({ type: "all_private_chats" }, (ctx) => StartGreetings(ctx))
  .localize(LanguageCodes.Portuguese, "start", "Inicia a configuração do bot")
  .localize(LanguageCodes.English, "start", "Start the bot");

privateCommands
  .command("help", "Get help and information about the bot", options)
  .addToScope({ type: "all_private_chats" }, (ctx) => helpCommand(ctx))
  .localize(LanguageCodes.Portuguese, "help", "Obtém ajuda e informações sobre o bot")
  .localize(LanguageCodes.English, "help", "Get help and information about the bot");

const userCommands_dict = {
  harem: {
    command: typeBot === "waifu" ? "mywaifus" : "myhusbandos",
    description: {
      pt: "Mostra o seu Harem",
      en: "Show your Harem",
    },
    handler: HaremHandler,
  },
  random: {
    command: "random",
    description: {
      pt: "Traz um personagem aleatorio do DB",
      en: "Brings a random character from the DB",
    },
    handler: Ramdon_Character_Handler,
  },
  top: {
    command: botPrefix + "top",
    description: {
      pt: "Mostra o top de jogadores",
      en: "Show the top players",
    },
    handler: topHandler,
  },
  haremmode: {
    command: botPrefix + "haremmode",
    description: {
      pt: "Altera o modo de visualizacao do seu Harem",
      en: "Change the display mode of your Harem",
    },
    handler: HaremmodeHandler,
  },
  animelist: {
    command: "animelist",
    description: {
      pt: "Lista de animes por letra",
      en: "List animes by letter",
    },
    handler: animelistCommand,
  },
} as const;

for (const [key, value] of Object.entries(userCommands_dict)) {
  privateCommands
    .command(value.command, value.description.en, options)
    .addToScope({ type: "all_group_chats" }, async (ctx: MyContext) => {
      debug("Comando private " + value.command + " executado por", ctx.from?.username || ctx.from?.id);
      await value.handler(ctx);
    })
    .localize(LanguageCodes.Portuguese, value.command, value.description.pt)
    .localize(LanguageCodes.English, value.command, value.description.en);
}

export { privateCommands };