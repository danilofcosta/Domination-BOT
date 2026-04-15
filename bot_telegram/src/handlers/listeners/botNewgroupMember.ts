import { Language } from "../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";
import { mentionUser } from "../../utils/manege_caption/metion_user.js";
import { info, warn, error, debug } from "../../utils/log.js";

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

    const group = await prisma.telegramGroup.create({
      data: {
        groupId: Number(chat.id),
        groupName: chat.title || "Grupo sem nome",

        configuration: JSON.stringify({
          group_id: chat.id,
          group_username: chat.username || null,
          group_name: chat.title,
          language: Language.PT,

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

    debug(`botNewgroupMember - grupo salvo no banco`, { groupId: group.groupId });

    const log = ctx.t("add_bot_new_group", {
      name: chat.title || "Grupo sem nome",
      id: chat.id,
      user: mentionUser(`${addedBy.first_name} ${addedBy.last_name}`, addedBy.id)
    });

    if (process.env.GROUP_ADM) {
      try {
        await ctx.api.sendMessage(
          process.env.GROUP_ADM,
          log,
          { parse_mode: "Markdown" }
        );
        info(`botNewgroupMember - notificação enviada`, { groupId: chat.id });
      } catch (e) {
        error(`botNewgroupMember - erro ao enviar notificação`, e);
      }
    }

  } catch (err) {
    error(`botNewgroupMember - erro geral`, err);
  }
}

export { botNewgroupMember };
