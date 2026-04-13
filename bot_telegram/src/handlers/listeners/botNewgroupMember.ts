import { Language } from "../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";
import { mentionUser } from "../../utils/manege_caption/metion_user.js";

async function botNewgroupMember(ctx: any) {
  console.log("Bot add new group ");

  try {
    const newMember = ctx.message.new_chat_members?.[0];
    const chat = ctx.message.chat;
    const addedBy = ctx.message.from;

    if (!newMember) {
      console.log("Nenhum membro encontrado.");
      return;
    }

    // salva no banco
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

    // mensagem para outro chat (fixo)
    const log = ctx.t("add_bot_new_group", {
      name: chat.title || "Grupo sem nome",
      id: chat.id,
      user: mentionUser(`${addedBy.first_name} ${addedBy.last_name}`, addedBy.id)
    });

    await ctx.api.sendMessage(
      process.env.GROUP_ADM,
      log,
      { parse_mode: "Markdown" }
    );

  } catch (error) {
    console.error("Erro em botNewgroupMember:", error);
  }

  console.log("botNewgroupMemberHandler");
}

export { botNewgroupMember };
