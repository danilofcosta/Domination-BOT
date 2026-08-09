import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { debug } from "../utils/log.js";
import {
  botPrefix,
  category_user,
  type CommandConfig,
  registerCommand,
} from "./botConfigCommands.js";

import { StartHandler } from "../handlers/Commands/CommandsGlobal/start.js";
import { helpHandler } from "../handlers/Commands/CommandsGlobal/helpHandler.js";

const GlobaisCommandsRegistry = new CommandGroup<MyContext>();

export const GlobaisCommandsRegistryDict: Record<string, CommandConfig> = {
  start: {
    command: "start",
    category_user:category_user.Main,
    commandPrivate: "start",
    description: {
      pt: "Mostra o top de jogadores",
      en: "Show the top players",
    },
    commandPrivateInChat:true,
    handler: StartHandler,
    scopes: ["all_group_chats", "all_private_chats"],
  },
  help: {
    command: "help",
    commandPrivate: "help",
    category_user: category_user.Main,
    description: {
      pt: "Mostra o guia de comandos",
      en: "Show the commands guide",
    },
    handler: helpHandler,
    scopes: ["all_private_chats"],
  },
};

for (const cfg of Object.values(GlobaisCommandsRegistryDict)) {
  const handlerWrapper = async (ctx: MyContext) => {
    debug("Comando", cfg.command, ctx.chat?.type, "executado por", ctx.from?.username);
    if
      (ctx.chat?.type !== 'private' && ctx.commandMatch?.command === cfg.commandPrivate && cfg.commandPrivateInChat === false) {
      return debug("Comando privado em", ctx.chat?.type, 'ignorado', cfg.commandPrivate, ctx.chat?.type, "executado por", ctx.from?.username);

    }
    return cfg.handler(ctx);
  };
  registerCommand(GlobaisCommandsRegistry, cfg.command, cfg.description.pt, handlerWrapper, cfg.commandPrivate);
}

export { GlobaisCommandsRegistry };
