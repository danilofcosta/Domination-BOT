/**
 * Admin Bot Commands
 */

import { CommandGroup, LanguageCodes } from '@grammyjs/commands';
import { ProfileType, type MyContext } from '../utils/customTypes.js';
import { botPrefix, options } from './botConfigCommands.js';
import { onlyRoleBotAdmin } from '../utils/permissions.js';

import { AddCharacterHandler } from '../handlers/Comandos/admin_bot/manager_character/add/add_charecter.js';
import { add_in_colletion } from '../handlers/Comandos/admin_bot/manage_users/add_in_colletion.js';

import { SetRarityHandler } from '../handlers/Comandos/admin_bot/configs/set_rarity.js';
import { SetEventHandler } from '../handlers/Comandos/admin_bot/configs/set_event.js';

import { enviarLogs } from '../handlers/Comandos/testes_commands.js';

import {
  banHandler,
  // unbanHandler,
  // listBannedHandler,
} from '../handlers/Comandos/admin_bot/manage_users/ban_user_handler.js';

import { statusUserHandler } from '../handlers/Comandos/admin_bot/manage_users/status_user.js';

import { debug } from '../utils/log.js';

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

  add_in_colletion: {
    minPermission: ProfileType.ADMIN,
    command: 'addcolleton' + botPrefix,
    description: {
      en: 'Add a character to the collection user (admin)',
      pt: 'Adicionar um personagem ao harem de um user (admin)',
    },
    handler: add_in_colletion,
  },

  setrarity: {
    minPermission: ProfileType.ADMIN,
    command: 'setrarity' + botPrefix,
    description: {
      en: 'Edit rarity settings (emoji, name, emoji_id)',
      pt: 'Editar configuracoes de raridade (emoji, nome, emoji_id)',
    },
    handler: SetRarityHandler,
  },

  setevent: {
    minPermission: ProfileType.ADMIN,
    command: 'setevent' + botPrefix,
    description: {
      en: 'Edit event settings (emoji, name, emoji_id)',
      pt: 'Editar configuracoes de evento (emoji, nome, emoji_id)',
    },
    handler: SetEventHandler,
  },

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
    minPermission: ProfileType.ADMIN,
    command: 'banuser' + botPrefix,
    description: {
      en: 'Ban a user from the bot',
      pt: 'Banir um usuario do bot',
    },
    handler: banHandler,
  },

  // unbanuser: {
  //   minPermission: ProfileType.ADMIN,
  //   command: 'unbanuser' + botPrefix,
  //   description: {
  //     en: 'Unban a user from the bot',
  //     pt: 'Desbanir um usuario do bot',
  //   },
  //   handler: unbanHandler,
  // },

  // listbanned: {
  //   minPermission: ProfileType.ADMIN,
  //   command: 'listeban' + botPrefix,
  //   description: {
  //     en: 'List all banned users',
  //     pt: 'Listar todos os usuarios banidos',
  //   },
  //   handler: listBannedHandler,
  // },

  statususer: {
    minPermission: ProfileType.ADMIN,
    command: 'statususer' + botPrefix,
    description: {
      en: 'Get user status information',
      pt: 'Ver informacoes de status do usuario',
    },
    handler: statusUserHandler,
  },
} as const satisfies Record<string, AdminCommand>;

const adminCommands_bot = new CommandGroup<MyContext>();

for (const value of Object.values(adminCommands_bot_dict)) {
  adminCommands_bot
    .command(value.command, value.description.en, async (ctx) => {
      debug(
        'Comando admin',
        value.command,
        'executado por',
        ctx.from?.username || ctx.from?.id,
      );

      const next = async () => {
        await value.handler(ctx);
      };

      if (value.minPermission) {
        return await onlyRoleBotAdmin(value.minPermission)(ctx, next);
      }

      return await next();
    },options
  
  
  
  
  
  
  )
    // .localize(LanguageCodes.English, value.command, value.description.en)
    .localize(
      LanguageCodes.Portuguese,
      value.command,
      value.description.pt,
    );
}

export { adminCommands_bot };