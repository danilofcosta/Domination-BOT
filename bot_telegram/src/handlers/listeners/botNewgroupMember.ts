import { InlineKeyboard } from "grammy";
import { Language } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { mentionUser } from "../../utils/mention_user.js";
import { info, warn, error, debug } from "../../utils/log.js";

async function botNewgroupMember(ctx: any) {
  info(`botNewgroupMember - bot adicionado a novo grupo`);

  try {
    const newMembers = ctx.message.new_chat_members;
    const chat = ctx.message.chat;
    const addedBy = ctx.message.from;

    if (!newMembers || newMembers.length === 0) {
      warn(`botNewgroupMember - nenhum membro encontrado`);
      return;
    }

    const botIsNewMember = newMembers.some((m: any) => m?.id === ctx.me.id);
    if (!botIsNewMember) {
      debug(
        `botNewgroupMember - bot não está entre os novos membros, ignorando`,
      );
      return;
    }

    debug(`botNewgroupMember - dados do grupo`, {
      groupId: chat.id,
      groupName: chat.title,
    });

    let memberCount: number | null = null;
    let chatFullInfo: any = null;
    let botIsAdmin = false;
    let botPermissions: any = null;

    try {
      memberCount = await ctx.api.getChatMemberCount(chat.id);
    } catch (e) {
      warn(`botNewgroupMember - erro ao obter memberCount`, e);
    }

    if (process.env.GROUP_ADM) {
      try {
        await ctx.api.sendMessage(
          process.env.GROUP_ADM,
          ctx.t("bot_new_group_member_count", {
            groupName: chat.title || "?",
            count: memberCount ?? "?",
          }),
          { parse_mode: "HTML" },
        );
      } catch (e) {
        warn(`botNewgroupMember - erro ao enviar contagem para adm`, e);
      }
    }

    if (memberCount !== null && memberCount < 40) {
      try {
        await ctx.api.sendMessage(
          chat.id,
          ctx.t("bot_new_group_too_few_members", { count: memberCount }),
          { parse_mode: "HTML" },
        );
      } catch (e) {
        warn(`botNewgroupMember - erro ao avisar grupo sobre saída`, e);
      }

      try {
        await ctx.api.leaveChat(chat.id);
        info(`botNewgroupMember - saiu do grupo ${chat.id} (< 40 membros)`);

        if (process.env.GROUP_ADM) {
          try {
            await ctx.api.sendMessage(
              process.env.GROUP_ADM,
              ctx.t("bot_new_group_left_chat", {
                groupName: chat.title || "?",
                groupId: chat.id,
                count: memberCount,
              }),
              { parse_mode: "HTML" },
            );
          } catch (e) {
            warn(`botNewgroupMember - erro ao notificar adm sobre saída`, e);
          }
        }
      } catch (e) {
        warn(`botNewgroupMember - erro ao sair do grupo`, e);
      }

      return;
    }

    try {
      chatFullInfo = await ctx.api.getChat(chat.id);
    } catch (e) {
      warn(`botNewgroupMember - erro ao obter chat info`, e);
    }

    try {
      const botMember = await ctx.api.getChatMember(chat.id, ctx.me.id);
      botIsAdmin = ["administrator", "creator"].includes(botMember.status);
      if (botMember.status === "administrator") {
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
            is_premium: addedBy.is_premium,
          },
        }),
      },
    });

    debug(`botNewgroupMember - grupo salvo no banco`, {
      groupId: group.groupId,
      memberCount,
      botIsAdmin,
    });

    try {
      await ctx.api.sendMessage(
        addedBy.id,
        ctx.t("thank-you-add-group", { groupName: chat.title || "grupo" }),
        { parse_mode: "HTML" },
      );

      await prisma.telegramUser.upsert({
        where: { telegramId: BigInt(addedBy.id) },
        update: { coins: { increment: 40 } },
        create: {
          telegramId: BigInt(addedBy.id),
          telegramData: addedBy,
          waifuConfig: {},
          husbandoConfig: {},
          coins: 40,
        },
      });

      info(`botNewgroupMember - bônus de 40 coins para ${addedBy.id}`);
    } catch (e) {
      warn(`botNewgroupMember - falha ao dar bônus para ${addedBy.id}`, e);
    }

    const log = ctx.t(`add_bot_new_group`, {
      name: chat.title || `Grupo sem nome`,
      id: chat.id,
      user: mentionUser(
        `${addedBy.first_name} ${addedBy.last_name}`,
        addedBy.id,
      ),
    });

    if (process.env.GROUP_ADM) {
      try {
        const keyboard = new InlineKeyboard().text(
          ctx.t("bot_leave_group_btn"),
          `leavegroup_${chat.id}`,
        );
        await ctx.api.sendMessage(process.env.GROUP_ADM, log, {
          parse_mode: `HTML`,
          reply_markup: keyboard,
        });
        info(`botNewgroupMember - notifica\u00e7\u00e3o enviada`, {
          groupId: chat.id,
        });
      } catch (e) {
        error(`botNewgroupMember - erro ao enviar notifica\u00e7\u00e3o`, e);
      }
    }
  } catch (err) {
    error(`botNewgroupMember - erro geral`, err);
  }
}

export { botNewgroupMember };
