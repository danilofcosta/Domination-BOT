/**
 * Admin Bot Commands
 */

import { CommandGroup, LanguageCodes } from '@grammyjs/commands';
import { ProfileType, type MyContext } from '../utils/customTypes.js';
import { botPrefix, options } from './botConfigCommands.js';
import { onlyRoleBotAdmin } from '../utils/permissions.js';

import { AddCharacterHandler } from '../handlers/commands/admin_bot/manager_character/add_character/handler.js';
import { addCollection } from '../handlers/commands/admin_bot/manage_users/add_collection.js';

import { SetRarityHandler } from '../handlers/commands/admin_bot/configs/set_rarity.js';
import { SetEventHandler } from '../handlers/commands/admin_bot/configs/set_event.js';

import { enviarLogs } from '../handlers/commands/testes_commands.js';

import {
  banHandler,
  listBannedHandler,
  unbanHandler,
  // unbanHandler,
  // listBannedHandler,
} from '../handlers/commands/admin_bot/manage_users/ban_user_handler.js';

import { statusUserHandler } from '../handlers/commands/admin_bot/manage_users/status_user.js';

import { debug } from '../utils/log.js';
import { OpenHaremUser } from '../handlers/commands/admin_bot/manage_users/open_harem.js';
import { listActiveChats } from '../handlers/commands/admin_bot/manage_users/active_chats.js';
import { SetBotPicHandler } from '../handlers/commands/admin_bot/manage_bot/set_bot_pic.js';
import { editCharHandler } from '../handlers/commands/admin_bot/manager_character/edit_character/handler.js';
import { leaveGroupHandler } from '../handlers/commands/admin_groups/leaveGroup.js';

type AdminCommand = {
  minPermission: ProfileType;
  command: string;
  description: {
    en: string;
    pt: string;
  };
  handler: (ctx: MyContext) => Promise<any>;
};

export const adminCommands_bot_dict = {
  addchar: {
    minPermission: ProfileType.ADMIN,
    command: 'addchar' + botPrefix,
    description: {
      en: 'Add a character to the database (admin)',
      pt: 'Adicionar um personagem ao banco de dados (admin)',
    },
    handler: AddCharacterHandler,
  },
  // editchar: {
  //   minPermission: ProfileType.ADMIN,
  //   command: 'editchar' + botPrefix,
  //   description: {
  //     en: 'Edit a character in the database (admin)',
  //     pt: 'Editar um personagem no banco de dados (admin)',
  //   },
  //   handler: editCharHandler,
  // },

  addCollection: {
    minPermission: ProfileType.ADMIN,
    command: 'addCollection' + botPrefix,
    description: {
      en: 'Add a character to the collection user (admin)',
      pt: 'Adicionar um personagem ao harem de um user (admin)',
    },
    handler: addCollection,
  },

  // setrarity: {
  //   minPermission: ProfileType.ADMIN,
  //   command: 'setrarity' + botPrefix,
  //   description: {
  //     en: 'Edit rarity settings (emoji, name, emoji_id)',
  //     pt: 'Editar configuracoes de raridade (emoji, nome, emoji_id)',
  //   },
  //   handler: SetRarityHandler,
  // },

  // setevent: {
  //   minPermission: ProfileType.ADMIN,
  //   command: 'setevent' + botPrefix,
  //   description: {
  //     en: 'Edit event settings (emoji, name, emoji_id)',
  //     pt: 'Editar configuracoes de evento (emoji, nome, emoji_id)',
  //   },
  //   handler: SetEventHandler,
  // },

  logserros: {
    minPermission: ProfileType.ADMIN,
    command: 'logserros' + botPrefix,
    description: {
      en: 'Send error logs',
      pt: 'Enviar logs de erros',
    },
    handler: enviarLogs,
  },

  logs: {
    minPermission: ProfileType.ADMIN,
    command: 'logs' + botPrefix,
    description: {
      en: 'Send combined logs',
      pt: 'Enviar logs gerais',
    },
    handler: enviarLogs,
  },

  banuser: {
    minPermission: ProfileType.SUPER_ADMIN,
    command: 'banuser' + botPrefix,
    description: {
      en: 'Ban a user from the bot',
      pt: 'Banir um usuario do bot',
    },
    handler: banHandler,
  },

  unbanuser: {
    minPermission: ProfileType.ADMIN,
    command: 'unbanuser' + botPrefix,
    description: {
      en: 'Unban a user from the bot',
      pt: 'Desbanir um usuario do bot',
    },
    handler: unbanHandler,
  },

  listbanned: {
    minPermission: ProfileType.ADMIN,
    command: 'listeban' + botPrefix,
    description: {
      en: 'List all banned users',
      pt: 'Listar todos os usuarios banidos',
    },
    handler: listBannedHandler,
  },

  statususer: {
    minPermission: ProfileType.ADMIN,
    command: 'statususer' + botPrefix,
    description: {
      en: 'Get user status information',
      pt: 'Ver informacoes de status do usuario',
    },
    handler: statusUserHandler,
  },
  activechats: {
    minPermission: ProfileType.ADMIN,
    command: 'activechats' + botPrefix,
    description: {
      en: 'List all active chats where the bot is used',
      pt: 'Listar todos os chats ativos onde o bot é usado',
    },
    handler: listActiveChats,
  },
  openharemuser: {
    minPermission: ProfileType.ADMIN,
    command: 'openharem' + botPrefix,
    description: {
      en: '-',
      pt: 'abrir Harem do user ',
    },
    handler: OpenHaremUser,
  },

  setbotpic: {
    minPermission: ProfileType.SUPER_ADMIN,
    command: 'setbotpic' + botPrefix,
    description: {
      en: 'Change bot profile picture (reply to a photo)',
      pt: 'Alterar foto de perfil do bot (responda a uma foto)',
    },
    handler: SetBotPicHandler,
  },

  leavegroup: {
    minPermission: ProfileType.ADMIN,
    command: 'leavegroup' + botPrefix,
    description: {
      en: 'Make the bot leave the group',
      pt: 'Faz o bot sair do grupo',
    },
    handler: leaveGroupHandler,
  },
  
} as const satisfies Record<string, AdminCommand>;

const adminCommands_bot = new CommandGroup<MyContext>();

for (const [key, value] of Object.entries(adminCommands_bot_dict)) {
  const handlerWrapper = async (ctx: MyContext) => {
    debug("AdminCommand", value.command, "executado por", ctx.from?.username);
    await onlyRoleBotAdmin(value.minPermission)(ctx, async () => {
      await value.handler(ctx);
    });
  };

  adminCommands_bot
    .command(value.command, value.description.pt, handlerWrapper, options)
    .addToScope({ type: "all_private_chats" }, handlerWrapper);
}

export { adminCommands_bot };