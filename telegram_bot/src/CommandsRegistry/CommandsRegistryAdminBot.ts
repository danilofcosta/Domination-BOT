//comando para usuarios do com nivel de administrador do bot, para gerenciar comandos e configurações do bot

import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../uteis/CustomTypes.js";
import { debug } from "../uteis/log.js";
import { ProfileType } from "../../generated/prisma/client.js";
import { botPrefix, registerCommand } from "./botConfigCommands.js";
import { onlyRoleBotAdmin } from "../uteis/permissions.js";
import { AddCharacterHandler } from "../handlers/Commands/CommandsAdminBot/addcharacter/AddCharacterHandler.js";
import { EditCharacterHandler } from "../handlers/Commands/CommandsAdminBot/manegerCharacters/EditCharacterHandler.js";

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

  reloadadms: {
    minPermission: ProfileType.SUPER_ADMIN,
    command: "reloadadms" + botPrefix,
    description: {
      pt: "altualizar lista de adms do bot",
      en: "altualizar lista de adms do bot",

    },
    handler: EditCharacterHandler,
  },

};

for (const cfg of Object.values(userCommandsRegistryDict)) {
  const handlerWrapper = async (ctx: MyContext) => {
    debug("AdminCommand", cfg.command, "executado por", ctx.from?.username);
    await onlyRoleBotAdmin(cfg.minPermission)(ctx, async () => {
      await cfg.handler(ctx);
    });
  };
  registerCommand(AdminCommandsRegistry, cfg.command, cfg.description.pt, handlerWrapper, cfg.commandPrivate);
}

export { AdminCommandsRegistry };
