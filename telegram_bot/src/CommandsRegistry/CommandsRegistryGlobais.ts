import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../uteis/CustomTypes.js";
import { debug } from "../uteis/log.js";
import {
  botPrefix,
  category,
  type CommandConfig,
  registerCommand,
} from "./botConfigCommands.js";

import { StartHandler } from "../handlers/Commands/CommandsGlobais/start.js";

const GlobaisCommandsRegistry = new CommandGroup<MyContext>();

export const GlobaisCommandsRegistryDict: Record<string, CommandConfig> = {
  start: {
    command: "start",
    category:category.main,
    commandPrivate: "start",
    description: {
      pt: "Mostra o top de jogadores",
      en: "Show the top players",
    },
    commandPrivateInChat:true,
    handler: StartHandler,
    scopes: ["all_group_chats", "all_private_chats"],
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
