//comando para usuarios do com nivel de administrador do bot, para gerenciar comandos e configurações do bot

import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { debug } from "../utils/log.js";
import { ProfileType } from "../../generated/prisma/client.js";
import { botPrefix, registerCommand, category_admin_bot } from "./botConfigCommands.js";
import { onlyRoleBotAdmin } from "../utils/permissions.js";
import { addCharacterHandler } from "../handlers/Commands/CommandsAdminBot/managerCharacters/addCharacter/addCharacterHandler.js";
import { editCharacterHandler } from "../handlers/Commands/CommandsAdminBot/managerCharacters/editCharacterHandler.js";
import { reload } from "../handlers/Commands/CommandsAdminBot/managerAdmins/reload.js";
import { ban } from "../handlers/Commands/CommandsAdminBot/managerAdmins/ban.js";
import { cleanCollection } from "../handlers/Commands/CommandsAdminBot/managerAdmins/cleanCollection.js";
import { openharem } from "../handlers/Commands/CommandsAdminBot/managerAdmins/openharem.js";
import { upadmin } from "../handlers/Commands/CommandsAdminBot/managerAdmins/upadmin.js";
import { unban } from "../handlers/Commands/CommandsAdminBot/managerAdmins/unban.js";
import { unadmin } from "../handlers/Commands/CommandsAdminBot/managerAdmins/unadmin.js";
import { clearCache } from "../handlers/Commands/CommandsAdminBot/managerAdmins/clearCache.js";

type AdminCommand = {
  minPermission: ProfileType;
  command: string;
  commandPrivate?: string;
  category_admin_bot: category_admin_bot;
  description: {
    en: string;
    pt: string;
  };
  handler: (ctx: MyContext) => Promise<any>;
};

const AdminCommandsRegistry = new CommandGroup<MyContext>();

export const AdminCommandsRegistryDict: Record<string, AdminCommand> = {
  addchar: {
    minPermission: ProfileType.ADMIN,
    command: "addchar" + botPrefix,
    category_admin_bot: category_admin_bot.Characters,
    description: {
      en: "Add a character to the database (admin)",
      pt: "Adicionar um personagem ao banco de dados (admin)",
    },
    handler: addCharacterHandler,
  },
  editchar: {
    minPermission: ProfileType.ADMIN,
    command: "editchar" + botPrefix,
    category_admin_bot: category_admin_bot.Characters,
    description: {
      en: "edit a character to the database (admin)",
      pt: "editar um personagem ao banco de dados (admin)",
    },
    handler: editCharacterHandler,
  },

  reloadadms: {
    minPermission: ProfileType.SUPER_ADMIN,
    command: "reloadadms" + botPrefix,
    category_admin_bot: category_admin_bot.Admins,
    description: {
      pt: "altualizar lista de adms do bot",
      en: "altualizar lista de adms do bot",

    },
    handler: reload,
  },

  ban: {
    minPermission: ProfileType.ADMIN,
    command: "ban" + botPrefix,
    category_admin_bot: category_admin_bot.Admins,
    description: {
      en: "Ban a user from the bot (admin)",
      pt: "Banir um usuário do bot (admin)",
    },
    handler: ban,
  },

  cleanCollection: {
    minPermission: ProfileType.ADMIN,
    command: "cleanCollection" + botPrefix,
    category_admin_bot: category_admin_bot.Admins,
    description: {
      en: "Clean a user's collection (admin)",
      pt: "Limpar a coleção de um usuário (admin)",
    },
    handler: cleanCollection,
  },

  openharem: {
    minPermission: ProfileType.ADMIN,
    command: "openharem" + botPrefix,
    category_admin_bot: category_admin_bot.Admins,
    description: {
      en: "Open any user's harem (admin)",
      pt: "Abrir a coleção de qualquer usuário (admin)",
    },
    handler: openharem,
  },

  upadmin: {
    minPermission: ProfileType.SUPER_ADMIN,
    command: "upadmin" + botPrefix,
    category_admin_bot: category_admin_bot.Admins,
    description: {
      en: "Promote a user to ADMIN (super admin)",
      pt: "Promover um usuário a ADMIN (super admin)",
    },
    handler: upadmin,
  },

  unban: {
    minPermission: ProfileType.ADMIN,
    command: "unban" + botPrefix,
    category_admin_bot: category_admin_bot.Admins,
    description: {
      en: "Unban a user from the bot (admin)",
      pt: "Desbanir um usuário do bot (admin)",
    },
    handler: unban,
  },

  unadmin: {
    minPermission: ProfileType.SUPER_ADMIN,
    command: "unadmin" + botPrefix,
    category_admin_bot: category_admin_bot.Admins,
    description: {
      en: "Demote a user from ADMIN (super admin)",
      pt: "Rebaixar um usuário de ADMIN (super admin)",
    },
    handler: unadmin,
  },

  clearCache: {
    minPermission: ProfileType.ADMIN,
    command: "clearCache" + botPrefix,
    category_admin_bot: category_admin_bot.Admins,
    description: {
      en: "Clear the bot's caches (admin)",
      pt: "Limpar os caches do bot (admin)",
    },
    handler: clearCache,
  },

};

for (const cfg of Object.values(AdminCommandsRegistryDict)) {
  const handlerWrapper = async (ctx: MyContext) => {
    debug("AdminCommand", cfg.command, "executado por", ctx.from?.username);
    await onlyRoleBotAdmin(cfg.minPermission)(ctx, async () => {
      await cfg.handler(ctx);
    });
  };
  registerCommand(AdminCommandsRegistry, cfg.command, cfg.description.pt, handlerWrapper, cfg.commandPrivate);
}

export { AdminCommandsRegistry };
