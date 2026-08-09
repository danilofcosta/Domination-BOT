import type { MyContext } from "../../utils/customTypes.js";
import { debug, info, warn } from "../../utils/log.js";
import { sendMessageCustom } from "../../utils/sendMessageCustom.js";
import { createMentionUser } from "../../utils/telegram/createMentionUser.js";
import { CreateOneBtn } from "../../utils/buildButtons/createOneButton.js";
import { InlineKeyboard } from "grammy";

export async function botNewgroupMember(ctx: MyContext) {
  info("botNewgroupMember - bot adicionado ao grupo", { chatId: ctx.chat?.id });
  if (!ctx || !ctx.message) return;

  const newMembers = ctx.message.new_chat_members;
  const chat = ctx.message.chat;
  const addedBy = ctx.message.from;

  if (!newMembers || newMembers.length === 0) {
    warn("botNewgroupMember - nenhum membro encontrado");
    return;
  }

  const botIsNewMember = newMembers.some((m: any) => m?.id === ctx.me.id);
  if (!botIsNewMember) {
    debug("botNewgroupMember - bot não está entre os novos membros, ignorando");
    return;
  }

  debug("botNewgroupMember - dados do grupo", {
    groupId: chat.id,
    groupName: chat.title,
  });

  try {
    const reply_markup = new InlineKeyboard()
      .url(
        ctx.t("start_btn_addme"),
        `https://t.me/${ctx.me?.username}?startgroup=true`,
      )
      .style("success")
      .url(
        ctx.t("start_btn_grupo"),
        process.env.OFICIAL_GROUP_URL ||
          `https://t.me/${ctx.me?.username}?start=canal`,
      )
      .style("primary");

    await sendMessageCustom({
      ctx,
      caption: ctx.t("bot_new_group_msg", {
        botName: ctx.me.username,
      }),
      reply_markup,
    });
  } catch (e) {
    warn("botNewgroupMember - erro ao enviar boas-vindas no grupo", e);
  }

  let memberCount: number | null = null;
  let chatFullInfo: any = null;

  try {
    memberCount = await ctx.api.getChatMemberCount(chat.id);
    chatFullInfo = await ctx.api.getChat(chat.id);
  } catch (e) {
    warn("botNewgroupMember - erro ao obter memberCount", e);
  }

  if (process.env.GROUP_ADM) {
    try {
      await sendMessageCustom({
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
          addedBy: createMentionUser({
            Nome: addedBy.first_name,
            telegramiduser: addedBy.id,
          }),
        }),
        reply_markup: CreateOneBtn({
          text: "sair do grupo",
          callback: `leave_group_${chatFullInfo.id}`,
        }),
      });
    } catch (e) {
      warn("botNewgroupMember - erro ao enviar contagem para adm", e);
    }
  }
}
