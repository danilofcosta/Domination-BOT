//comando para usuarios do com nivel de administrador do bot, para gerenciar comandos e configurações do bot

import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { debug, error } from "../utils/log.js";
import { ProfileType } from "../../generated/prisma/client.js";
import { botPrefix, registerCommand, category_admin_bot, type CommandConfig } from "./botConfigCommands.js";
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

const  AdminBotCommandsRegistry = new CommandGroup<MyContext>();

export const  AdminBotCommandsRegistryDict: Record<string, CommandConfig> = {
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
    command: "cleancollection" + botPrefix,
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
    command: "clearcache" + botPrefix,
    commandPrivate: "clearcache",
    category_admin_bot: category_admin_bot.Admins,
    description: {
      en: "Clear the bot's caches (admin)",
      pt: "Limpar os caches do bot (admin)",
    },
    handler: clearCache,
  },

};

for (const cfg of Object.values( AdminBotCommandsRegistryDict)) {
  const handlerWrapper = async (ctx: MyContext) => {
    if (!cfg.minPermission){
     return  error("Comando sem permissão mínima definida", cfg.command);
    }

    await onlyRoleBotAdmin(cfg.minPermission)(ctx, async () => {
      await cfg.handler(ctx);
    });
  };
  registerCommand( AdminBotCommandsRegistry, cfg);
}

export {  AdminBotCommandsRegistry };
