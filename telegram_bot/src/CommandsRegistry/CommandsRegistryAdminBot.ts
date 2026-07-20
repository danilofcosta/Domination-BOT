//comando para usuarios do com nivel de administrador do bot, para gerenciar comandos e configurações do bot

import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../uteis/CustomTypes.js";
import { debug } from "../uteis/log.js";
import { ProfileType } from "../../generated/prisma/client.js";
import { botPrefix, options } from "./botConfigCommands.js";
import { onlyRoleBotAdmin } from "../uteis/permissions.js";
import { AddCharacterHandler } from "../handlers/Commands/CommandsAdminBot/addcharacter/AddCharacterHandler.js";
import { EditCharacterHandler } from "../handlers/Commands/CommandsAdminBot/EditCharacterHandler.js";
type AdminCommand = {
  minPermission: ProfileType;
  command: string;
  commandPrivate?: string;
  description: {
    en: string;
    pt: string;
  };
  handler: (ctx: MyContext) => Promise<any>;
};
const AdminCommandsRegistry = new CommandGroup<MyContext>();

const userCommandsRegistryDict: Record<string, AdminCommand> = {
  addchar: {
    minPermission: ProfileType.ADMIN,
    command: "addchar" + botPrefix,
    description: {
      en: "Add a character to the database (admin)",
      pt: "Adicionar um personagem ao banco de dados (admin)",
    },
    handler: AddCharacterHandler,
  },
  editchar: {
    minPermission: ProfileType.ADMIN,
    command: "editchar" + botPrefix,
    description: {
      en: "edit a character to the database (admin)",
      pt: "editar um personagem ao banco de dados (admin)",
    },
    handler: EditCharacterHandler,
  },
};

function registerCommand(cfg: AdminCommand) {
  const handlerWrapper = async (ctx: MyContext) => {
    debug("AdminCommand", cfg.command, "executado por", ctx.from?.username);
    await onlyRoleBotAdmin(cfg.minPermission)(ctx, async () => {
      await cfg.handler(ctx);
    });
  };

  const groupCmd = AdminCommandsRegistry.command(
    cfg.command,
    cfg.description.pt,
    handlerWrapper,
    options,
  );

  groupCmd.addToScope({ type: "all_group_chats" }, handlerWrapper);

  if (cfg.commandPrivate) {
    const privateCmd = AdminCommandsRegistry.command(
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

export { AdminCommandsRegistry };
