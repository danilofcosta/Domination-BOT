/**
 * Admin Groups Commands
 * 
 * Comandos executáveis apenas por administradores do grupo Telegram.
 * Verifica se o usuário é admin do grupo via getChatMember.
 * 
 * Comandos disponíveis:
 *   /newtopic{prefix} - Criar um novo topic
 *   /renametopic{prefix} - Renomear um topic
 *   /closetopic{prefix} - Fechar um topic
 *   /deletetopic{prefix} - Eliminar um topic
 *   /setchattopic{prefix} - Define o topic para mensagens de drop
 */

import { CommandGroup, LanguageCodes } from '@grammyjs/commands';
import type { MyContext } from '../utils/customTypes.js';
import { newTopicHandler, renameTopicHandler, closeTopicHandler, deleteTopicHandler, setActionTopicHandler } from '../handlers/Comandos/admin_groups/topic/topic_handlers.js';
import { setChatTopicHandler } from '../handlers/Comandos/admin_groups/topic/set_chat_topic.js';
import { botPrefix, options } from './botConfigCommands.js';
import { debug, warn } from '../utils/log.js';

/**
 * Verifica se o usuário é admin do grupo
 * @param ctx - Contexto do Grammy
 * @returns true se for admin ou creator do grupo
 */
async function isGroupAdmin(ctx: MyContext): Promise<boolean> {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;

  if (!userId || !chatId) return false;

  try {
    const member = await ctx.api.getChatMember(chatId, userId);
    return ['creator', 'administrator'].includes(member.status);
  } catch (e) {
    warn('Erro ao verificar admin do grupo', e);
    return false;
  }
}

/**
 * Middleware que verifica se o usuário é admin do grupo
 * @param ctx - Contexto do Grammy
 * @param next - Função a executar se for admin
 */
async function groupAdminOnly(ctx: MyContext, next: () => Promise<void>) {
  if (await isGroupAdmin(ctx)) {
    await next();
  } else {
    await ctx.reply('Apenas administradores do grupo podem usar este comando.');
  }
}

/**
 * Dicionário de comandos admin do grupo
 */
const adminGroupsCommands = new CommandGroup<MyContext>();

export const adminGroupsCommands_dict = {
  newtopic: {
    command: 'newtopic' + botPrefix,
    description: {
      en: 'Create a new forum topic',
      pt: 'Criar um novo topic',
    },
    handler: newTopicHandler,
  },
  renametopic: {
    command: 'renametopic' + botPrefix,
    description: {
      en: 'Rename the current topic',
      pt: 'Renomear o tópico atual',
    },
    handler: renameTopicHandler,
  },
  setactiontopic: {
    command: 'setactiontopic' + botPrefix,
    description: {
      en: 'Set current topic as default action topic',
      pt: 'Definir o tópico atual como padrão para ações',
    },
    handler: setActionTopicHandler,
  },
  closetopic: {
    command: 'closetopic' + botPrefix,
    description: {
      en: 'Close a forum topic',
      pt: 'Fechar um topic',
    },
    handler: closeTopicHandler,
  },
  deletetopic: {
    command: 'deletetopic' + botPrefix,
    description: {
      en: 'Delete a forum topic',
      pt: 'Eliminar um topic',
    },
    handler: deleteTopicHandler,
  },
  setchattopic: {
    command: 'setchattopic' + botPrefix,
    description: {
      en: 'Define the topic for drop messages',
      pt: 'Define o topic para mensagens de drop',
    },
    handler: setChatTopicHandler,
  },
} as const;

/** Registra comandos */
for (const [key, value] of Object.entries(adminGroupsCommands_dict)) {
  adminGroupsCommands
    .command(value.command, value.description.en, options)
    .addToScope({ type: 'all_group_chats' }, async (ctx: MyContext) => {
      const userId = ctx.from?.id;
      debug('Comando adminGroups ' + value.command + ' executado por', ctx.from?.username || userId);

      await groupAdminOnly(ctx, async () => {
        await value.handler(ctx);
      });
    })
    .localize(LanguageCodes.English, value.command, value.description.en)
    .localize(LanguageCodes.Portuguese, value.command, value.description.pt);
}

export { adminGroupsCommands };