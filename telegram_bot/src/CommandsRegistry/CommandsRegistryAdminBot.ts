//comando para usuarios do com nivel de administrador do bot, para gerenciar comandos e configurações do bot

import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../uteis/CustomTypes.js";
import { debug } from "../uteis/log.js";
import { ProfileType } from "../../generated/prisma/client.js";
import { botPrefix, registerCommand } from "./botConfigCommands.js";
import { onlyRoleBotAdmin } from "../uteis/permissions.js";
import { AddCharacterHandler } from "../handlers/Commands/CommandsAdminBot/manegerCharacters/addcharacter/AddCharacterHandler.js";
import { EditCharacterHandler } from "../handlers/Commands/CommandsAdminBot/manegerCharacters/EditCharacterHandler.js";
import { reload } from "../handlers/Commands/CommandsAdminBot/manegerAdminsBot/reload.js";
import { ban } from "../handlers/Commands/CommandsAdminBot/manegerAdminsBot/ban.js";
import { cleancolletion } from "../handlers/Commands/CommandsAdminBot/manegerAdminsBot/cleancolletion.js";
import { openharem } from "../handlers/Commands/CommandsAdminBot/manegerAdminsBot/openharem.js";
import { upadmin } from "../handlers/Commands/CommandsAdminBot/manegerAdminsBot/upadmin.js";
import { unban } from "../handlers/Commands/CommandsAdminBot/manegerAdminsBot/unban.js";
import { unadmin } from "../handlers/Commands/CommandsAdminBot/manegerAdminsBot/unadmin.js";

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
    handler: reload,
  },

  ban: {
    minPermission: ProfileType.ADMIN,
    command: "ban" + botPrefix,
    description: {
      en: "Ban a user from the bot (admin)",
      pt: "Banir um usuário do bot (admin)",
    },
    handler: ban,
  },

  cleancolletion: {
    minPermission: ProfileType.ADMIN,
    command: "cleancolletion" + botPrefix,
    description: {
      en: "Clean a user's collection (admin)",
      pt: "Limpar a coleção de um usuário (admin)",
    },
    handler: cleancolletion,
  },

  openharem: {
    minPermission: ProfileType.ADMIN,
    command: "openharem" + botPrefix,
    description: {
      en: "Open any user's harem (admin)",
      pt: "Abrir a coleção de qualquer usuário (admin)",
    },
    handler: openharem,
  },

  upadmin: {
    minPermission: ProfileType.SUPER_ADMIN,
    command: "upadmin" + botPrefix,
    description: {
      en: "Promote a user to ADMIN (super admin)",
      pt: "Promover um usuário a ADMIN (super admin)",
    },
    handler: upadmin,
  },

  unban: {
    minPermission: ProfileType.ADMIN,
    command: "unban" + botPrefix,
    description: {
      en: "Unban a user from the bot (admin)",
      pt: "Desbanir um usuário do bot (admin)",
    },
    handler: unban,
  },

  unadmin: {
    minPermission: ProfileType.SUPER_ADMIN,
    command: "unadmin" + botPrefix,
    description: {
      en: "Demote a user from ADMIN (super admin)",
      pt: "Rebaixar um usuário de ADMIN (super admin)",
    },
    handler: unadmin,
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
