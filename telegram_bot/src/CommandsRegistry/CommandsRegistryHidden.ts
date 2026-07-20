import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../uteis/CustomTypes.js";
import { debug } from "../uteis/log.js";
import { options, type CommandConfig } from "./botConfigCommands.js";
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
    scopes: ["all_group_chats", "all_chat_administrators"],
  },
};

function registerCommand(cfg: CommandConfig) {
  const handlerWrapper = async (ctx: MyContext) => {
    debug("Comando", cfg.command, "executado por", ctx.from?.username);
    return cfg.handler(ctx);
  };

  const groupCmd = HiddenCommandsRegistry.command(
    cfg.command,
    cfg.description.pt,
    handlerWrapper,
    options,
  );

  groupCmd.addToScope({ type: "all_group_chats" }, handlerWrapper);

  if (cfg.commandPrivate) {
    const privateCmd = HiddenCommandsRegistry.command(
      cfg.commandPrivate,
      cfg.description.pt,
      handlerWrapper,
      options,
    );

    privateCmd.addToScope({ type: "all_private_chats" }, handlerWrapper);
  }
}

for (const cfg of Object.values(userCommandsRegistryDict)) {
  registerCommand(cfg);
}

export { HiddenCommandsRegistry };
