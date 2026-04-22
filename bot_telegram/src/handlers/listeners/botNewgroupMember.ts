import { Language } from '../../../generated/prisma/client.js';
import { prisma } from '../../../lib/prisma.js';
import { mentionUser } from '../../utils/manege_caption/metion_user.js';
import { info, warn, error, debug } from '../../utils/log.js';

async function botNewgroupMember(ctx: any) {
  info(`botNewgroupMember - bot adicionado a novo grupo`);

  try {
    const newMember = ctx.message.new_chat_members?.[0];
    const chat = ctx.message.chat;
    const addedBy = ctx.message.from;

    if (!newMember) {
      warn(`botNewgroupMember - nenhum membro encontrado`);
      return;
    }

    debug(`botNewgroupMember - dados do grupo`, { groupId: chat.id, groupName: chat.title });

    let memberCount: number | null = null;
    let chatFullInfo: any = null;
    let botIsAdmin = false;
    let botPermissions: any = null;

    try {
      memberCount = await ctx.api.getChatMemberCount(chat.id);
    } catch (e) {
      warn(`botNewgroupMember - erro ao obter memberCount`, e);
    }

    try {
      chatFullInfo = await ctx.api.getChat(chat.id);
    } catch (e) {
      warn(`botNewgroupMember - erro ao obter chat info`, e);
    }

    try {
      const botMember = await ctx.api.getChatMember(chat.id, ctx.bot.id);
      botIsAdmin = ['administrator', 'creator'].includes(botMember.status);
      if (botMember.status === 'administrator') {
        botPermissions = {
          can_delete_messages: botMember.can_delete_messages,
          can_restrict_members: botMember.can_restrict_members,
          can_promote_members: botMember.can_promote_members,
          can_change_info: botMember.can_change_info,
          can_invite_users: botMember.can_invite_users,
          can_pin_messages: botMember.can_pin_messages,
          can_manage_video_chats: botMember.can_manage_video_chats,
        };
      }
    } catch (e) {
      warn(`botNewgroupMember - erro ao verificar admin status`, e);
    }

    const group = await prisma.telegramGroup.create({
      data: {
        groupId: Number(chat.id),
        groupName: chat.title || `Grupo sem nome`,

        configuration: JSON.stringify({
          group_id: chat.id,
          group_username: chat.username || null,
          group_name: chat.title,
          language: Language.PT,
          member_count: memberCount,
          chat_full_info: chatFullInfo,
          bot_is_admin: botIsAdmin,
          bot_permissions: botPermissions,

          addedBy: {
            id: addedBy.id,
            is_bot: addedBy.is_bot,
            first_name: addedBy.first_name,
            last_name: addedBy.last_name,
            username: addedBy.username,
            language_code: addedBy.language_code,
            is_premium: addedBy.is_premium
          }
        })
      }
    });

    debug(`botNewgroupMember - grupo salvo no banco`, { groupId: group.groupId, memberCount, botIsAdmin });

    const log = ctx.t(`add_bot_new_group`, {
      name: chat.title || `Grupo sem nome`,
      id: chat.id,
      user: mentionUser(`${addedBy.first_name} ${addedBy.last_name}`, addedBy.id)
    });

    if (process.env.GROUP_ADM) {
      try {
        await ctx.api.sendMessage(
          process.env.GROUP_ADM,
          log,
          { parse_mode: `HTML` }
        );
        info(`botNewgroupMember - notifica\u00e7\u00e3o enviada`, { groupId: chat.id });
      } catch (e) {
        error(`botNewgroupMember - erro ao enviar notifica\u00e7\u00e3o`, e);
      }
    }

  } catch (err) {
    error(`botNewgroupMember - erro geral`, err);
  }
}

export { botNewgroupMember };

