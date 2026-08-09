import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { debug } from "../utils/log.js";
import {
  botPrefix,
  category_admin_group,
  type CommandConfig,
  registerCommand,
} from "./botConfigCommands.js";

import { configHandler } from "../handlers/Commands/CommandsAdminGroup/configHandler.js";
import { dropHandler } from "../handlers/Commands/CommandsAdminGroup/dropHandler.js";

const AdminGroupCommandsRegistry = new CommandGroup<MyContext>();

export const AdminGroupCommandsRegistryDict: Record<string, CommandConfig> = {
  config: {
    command: "config" + botPrefix,
    category_admin_group: category_admin_group.main,
    description: {
      pt: "Configurações da Federação neste chat (admin)",
      en: "Federation settings for this chat (admin)",
    },
    handler: configHandler,
    scopes: ["all_group_chats"],
  },
  drop: {
    command: "drop",
    category_admin_group: category_admin_group.main,
    description: {
      pt: "Liga/desliga drops neste chat (admin) — /drop [yes|no|on|off]",
      en: "Enable/disable drops in this chat (admin) — /drop [yes|no|on|off]",
    },
    handler: dropHandler,
    scopes: ["all_group_chats"],
  },
};

for (const cfg of Object.values(AdminGroupCommandsRegistryDict)) {
  const handlerWrapper = async (ctx: MyContext) => {
    debug("AdminGroupCommand", cfg.command, ctx.chat?.type, "executado por", ctx.from?.username);
    return cfg.handler(ctx);
  };
  registerCommand(
    AdminGroupCommandsRegistry,
    cfg.command,
    cfg.description.pt,
    handlerWrapper,
    cfg.commandPrivate,
  );
}

export { AdminGroupCommandsRegistry };
