import { create } from "domain";
import type { MyContext } from "../../uteis/CustomTypes.js";
import { debug, info, warn } from "../../uteis/log.js";
import { SendMensageCustom } from "../../uteis/sendMensageCustom.js";
import { CreateMentionUser } from "../../uteis/uteis_telegram/CreateMentionUser.js";
import { CreateOneBtn } from "../../uteis/buildButtons/createOneButton.js";

export async function botNewgroupMember(ctx: MyContext) {
  info("botNewgroupMember - bot adicionado ao grupo", { chatId: ctx.chat?.id });
  if (!ctx || !ctx.message) return;
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
  } debug(`botNewgroupMember - dados do grupo`, {
    groupId: chat.id,
    groupName: chat.title,
  });



  let memberCount: number | null = null;
  let chatFullInfo: any = null;
  let botIsAdmin = false;
  let botPermissions: any = null;

  try {
    memberCount = await ctx.api.getChatMemberCount(chat.id);
    chatFullInfo = await ctx.api.getChat(chat.id);
  } catch (e) {
    warn(`botNewgroupMember - erro ao obter memberCount`, e);
  }

  if (process.env.GROUP_ADM) {
    try {
      SendMensageCustom({
        ctx,
        chat_id: process.env.GROUP_ADM,
        caption: ctx.t("bot_new_group_msg_group_adms", {
          id: chatFullInfo.id,
          invite_link: chatFullInfo.invite_link,
          join_to_send_messages: chatFullInfo.join_to_send_messages,
          title: chatFullInfo.title,
          type: chatFullInfo.type,
          description: chatFullInfo.description,
          memberCount: String(memberCount ?? 0),
          addedBy:CreateMentionUser({Nome:addedBy.first_name,telegramiduser:addedBy.id})
        }),
        reply_markup:CreateOneBtn({
          text:'sair do grupo',callback:`leave_group_${chatFullInfo.id}`
        })


      });
    } catch (e) {
      warn(`botNewgroupMember - erro ao enviar contagem para adm`, e);
    }
  }

}
