/**
 * Admin Bot Commands
 * 
 * Comandos executáveis apenas por administradores do bot (role >= ADMIN).
 * Verifica a role do usuário no banco de dados.
 * 
 * Comandos disponíveis:
 *   /addchar{prefix} - Adicionar personagem ao banco
 *   /addcolleton{prefix} - Adicionar personagem à coleção de um usuário
 *   /setrarity{prefix} - Editar configurações de raridade
 *   /setevent{prefix} - Editar configurações de evento
 *   /banuser{prefix} - Banir usuário do bot
 *   /unbanuser{prefix} - Desbanir usuário
 *   /listeban{prefix} - Listar usuários banidos
 *   /statususer{prefix} - Ver status de um usuário
 *   /logserros{prefix} - Enviar logs de erro
 *   /logs{prefix} - Enviar logs gerais
 */

import { CommandGroup, LanguageCodes } from '@grammyjs/commands';
import type { MyContext } from '../utils/customTypes.js';
import { botPrefix, options } from './botConfigCommands.js';
import { ProfileType } from '../../generated/prisma/client.js';
import { onlyRoleBotAdmin } from '../utils/permissions.js';
import { AddCharacterHandler } from '../handlers/Comandos/admin_bot/manager_character/add/add_charecter.js';
import { debug, warn } from '../utils/log.js';
import { getUserRole, roleWeights } from '../utils/permissions.js';
import { add_in_colletion } from '../handlers/Comandos/admin_bot/manage_users/add_in_colletion.js';
import { SetRarityHandler } from '../handlers/Comandos/admin_bot/configs/set_rarity.js';
import { SetEventHandler } from '../handlers/Comandos/admin_bot/configs/set_event.js';
import { enviarLogs } from '../handlers/Comandos/testes_commands.js';
import { banHandler, unbanHandler, listBannedHandler } from '../handlers/Comandos/admin_bot/manage_users/ban_user_handler.js';
import { statusUserHandler } from '../handlers/Comandos/admin_bot/manage_users/status_user.js';

/**
 * Tipo que define um comando admin do bot
 */
type AdminCommand = {
  minPermission: ProfileType;
  command: string;
  description: { en: string; pt: string };
  handler: (ctx: MyContext) => Promise<any>;
  scope: 'all_group_chats';
  botAdminOnly?: boolean;
};

/**
 * Dicionário de comandos admin do bot
 * Cada comando especifica a role mínima necessária (minPermission)
 */
export const adminCommands_bot_dict = {
  addchar: {
    minPermission: ProfileType.ADMIN,
    command: 'addchar' + botPrefix,
    description: {
      en: 'Add a character to the database (admin)',
      pt: 'Adicionar um personagem ao banco de dados (admin)',
    },
    handler: AddCharacterHandler,
    scope: 'all_group_chats' as const,
  },
  add_in_colletion: {
    minPermission: ProfileType.ADMIN,
    command: 'addcolleton' + botPrefix,
    description: {
      en: 'Add a character to the collection user (admin)',
      pt: 'Adicionar um personagem ao harem de um user (admin)',
    },
    handler: add_in_colletion,
    scope: 'all_group_chats' as const,
  },
  setrarity: {
    minPermission: ProfileType.ADMIN,
    command: 'setrarity' + botPrefix,
    description: {
      en: 'Edit rarity settings (emoji, name, emoji_id)',
      pt: 'Editar configuracoes de raridade (emoji, nome, emoji_id)',
    },
    handler: SetRarityHandler,
    scope: 'all_group_chats' as const,
  },
  setevent: {
    minPermission: ProfileType.ADMIN,
    command: 'setevent' + botPrefix,
    description: {
      en: 'Edit event settings (emoji, name, emoji_id)',
      pt: 'Editar configuracoes de evento (emoji, nome, emoji_id)',
    },
    handler: SetEventHandler,
    scope: 'all_group_chats' as const,
  },
  logserros: {
    minPermission: ProfileType.ADMIN,
    command: 'logserros' + botPrefix,
    description: {
      en: 'Send error logs',
      pt: 'Enviar logs de erros',
    },
    handler: enviarLogs,
    scope: 'all_group_chats' as const,
  },
  logs: {
    minPermission: ProfileType.ADMIN,
    command: 'logs' + botPrefix,
    description: {
      en: 'Send combined logs',
      pt: 'Enviar logs gerais',
    },
    handler: enviarLogs,
    scope: 'all_group_chats' as const,
  },
  banuser: {
    minPermission: ProfileType.ADMIN,
    command: 'banuser' + botPrefix,
    description: {
      en: 'Ban a user from the bot',
      pt: 'Banir um usuario do bot',
    },
    handler: banHandler,
    scope: 'all_group_chats' as const,
  },
  unbanuser: {
    minPermission: ProfileType.ADMIN,
    command: 'unbanuser' + botPrefix,
    description: {
      en: 'Unban a user from the bot',
      pt: 'Desbanir um usuario do bot',
    },
    handler: unbanHandler,
    scope: 'all_group_chats' as const,
  },
  listbanned: {
    minPermission: ProfileType.ADMIN,
    command: 'listeban' + botPrefix,
    description: {
      en: 'List all banned users',
      pt: 'Listar todos os usuarios banidos',
    },
    handler: listBannedHandler,
    scope: 'all_group_chats' as const,
  },
  statususer: {
    minPermission: ProfileType.ADMIN,
    command: 'statususer' + botPrefix,
    description: {
      en: 'Get user status information',
      pt: 'Ver informacoes de status do usuario',
    },
    handler: statusUserHandler,
    scope: 'all_group_chats' as const,
  },
} as const;

/** Grupo de comandos do Grammy */
const adminCommands_bot = new CommandGroup<MyContext>();

/**
 * Registra cada comando do dicionário
 * Adiciona verificação de permissão via onlyRoleBotAdmin
 */
for (const [key, value] of Object.entries(adminCommands_bot_dict)) {
  adminCommands_bot
    .command(value.command, value.description.en, options)
    .addToScope({ type: value.scope }, async (ctx: MyContext) => {
      const userId = ctx.from?.id;

      debug(
        'Comando admin',
        value.command,
        'executado por',
        ctx.from?.username || ctx.from?.id,
      );

      /** Executa o handler após verificação de permissão */
      const next = async () => {
        await value.handler(ctx);
      };

      /** Verifica se usuário tem role suficiente */
      if (value.minPermission) {
        return await onlyRoleBotAdmin(value.minPermission)(ctx, next);
      }

      return await next();
    })
    .localize(LanguageCodes.English, value.command, value.description.en)
    .localize(LanguageCodes.Portuguese, value.command, value.description.pt);
}

export { adminCommands_bot };