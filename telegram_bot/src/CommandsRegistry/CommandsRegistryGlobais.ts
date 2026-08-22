import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import {
  category_user,
  type CommandConfig,
  addMenuCommand,
} from "./botConfigCommands.js";

import { StartHandler } from "../handlers/Commands/CommandsGlobal/start.js";
import { helpHandler } from "../handlers/Commands/CommandsGlobal/helpHandler.js";

export const GlobaisCommandsRegistryDict: Record<string, CommandConfig> = {
  start: {
    command: "start",
    category_user:category_user.Main,
    commandPrivate: "start",
    description: {
      pt: "Mostra o top de jogadores",
      en: "Show the top players",
    },
    commandInChat:false,
    commandPrivateInChat:true,
    handler: StartHandler,
     
  },
  help: {
    command: "help",
    commandPrivate: "help",
    commandInChat:false,
    category_user: category_user.Main,
    description: {
      pt: "Mostra o guia de comandos",
      en: "Show the commands guide",
    },
    handler: helpHandler
  },
};

/**
 * Registra start/help no menu agregado (grupos + privado).
 * commandPrivate === command -> o proprio nome principal cobre os dois chats.
 */
export function addGlobalCommandsToMenu(menu: CommandGroup<MyContext>): void {
  for (const cfg of Object.values(GlobaisCommandsRegistryDict)) {
    addMenuCommand(menu, cfg);
  }
}
