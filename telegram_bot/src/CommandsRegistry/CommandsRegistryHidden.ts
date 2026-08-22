import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { debug } from "../utils/log.js";
import { category_user, type CommandConfig, registerCommand } from "./botConfigCommands.js";
import { idHandler } from "../handlers/Commands/CommandsUser/id.js";

const HiddenCommandsRegistry = new CommandGroup<MyContext>();

const userCommandsRegistryDict: Record<string, CommandConfig> = {
  id: {
    command: "id",
    commandPrivate: "id",
    description: {
      pt: "Retona seu id",
      en: "return your id",
    },
    handler: idHandler,
     
    category_user: category_user.Hidden,
  },
};

for (const cfg of Object.values(userCommandsRegistryDict)) {
  const handlerWrapper = async (ctx: MyContext) => {
    debug("Comando", cfg.command, "executado por", ctx.from?.username);
    return cfg.handler(ctx);
  };
  registerCommand(HiddenCommandsRegistry, cfg);
}

export { HiddenCommandsRegistry };
