import type { MyContext } from "../../../../utils/customTypes.js";
import { info, warn, error } from "../../../../utils/log.js";

async function checkIsForumChat(ctx: MyContext): Promise<boolean> {
  const chat = ctx.chat;
  if (!chat || !("id" in chat)) return false;
  return chat.is_forum === true;
}

async function checkBotCanManageTopics(ctx: MyContext): Promise<boolean> {
  const chat = ctx.chat;
  if (!chat || !("id" in chat)) return false;

  try {
    const botMember = await ctx.api.getChatMember(chat.id, ctx.me.id);
    return botMember.status === "administrator" && botMember.can_manage_topics === true;
  } catch (e) {
    warn("checkBotCanManageTopics - erro ao verificar permissões do bot", e);
    return false;
  }
}

async function checkUserIsAdmin(ctx: MyContext): Promise<boolean> {
  const userId = ctx.from?.id;
  const chat = ctx.chat;
  if (!userId || !chat || !("id" in chat)) return false;

  try {
    const member = await ctx.api.getChatMember(chat.id, userId);
    return member.status === "creator" || member.status === "administrator";
  } catch (e) {
    warn("checkUserIsAdmin - erro ao verificar admin", e);
    return false;
  }
}

export async function newTopicHandler(ctx: MyContext) {
  const chat = ctx.chat;
  const userId = ctx.from?.id;

  if (!chat || !("id" in chat)) {
    await ctx.reply(ctx.t("error-group-only"));
    return;
  }

  if (!checkIsForumChat(ctx)) {
    await ctx.reply(ctx.t("error-forum-only"));
    return;
  }

  const hasBotPermission = await checkBotCanManageTopics(ctx);
  if (!hasBotPermission) {
    await ctx.reply(ctx.t("error-bot-no-permission-topics"));
    return;
  }

  const isAdmin = await checkUserIsAdmin(ctx);
  if (!isAdmin) {
    await ctx.reply(ctx.t("error-admin-group-only"));
    return;
  }

  const arg = ctx.match as string | undefined;
  const topicName = arg?.replace(/^\/newtopic\S*\s*/, "").trim() || "New Topic";

  try {
    const message = await ctx.reply(topicName, {
      message_thread_id: 1,
    });

    await ctx.api.deleteMessage(chat.id, message.message_id);

    info("newTopicHandler - topic criado", { userId, chatId: chat.id, topicName });

    if (message.message_thread_id) {
      await ctx.reply(ctx.t("newtopic-success", { topicName }), {
        message_thread_id: message.message_thread_id,
      });
    }
  } catch (e) {
    error("newTopicHandler - erro ao criar topic", e);
    await ctx.reply(ctx.t("error-topic-create"));
  }
}

export async function renameTopicHandler(ctx: MyContext) {
  const chat = ctx.chat;
  const userId = ctx.from?.id;

  if (!chat || !("id" in chat)) {
    await ctx.reply(ctx.t("error-group-only"));
    return;
  }

  if (!checkIsForumChat(ctx)) {
    await ctx.reply(ctx.t("error-forum-only"));
    return;
  }

  const hasBotPermission = await checkBotCanManageTopics(ctx);
  if (!hasBotPermission) {
    await ctx.reply(ctx.t("error-bot-no-permission-topics"));
    return;
  }

  const isAdmin = await checkUserIsAdmin(ctx);
  if (!isAdmin) {
    await ctx.reply(ctx.t("error-admin-group-only"));
    return;
  }

  if (!ctx.message?.reply_to_message) {
    await ctx.reply(ctx.t("error-reply-topic"));
    return;
  }

  const arg = ctx.match as string | undefined;
  const newName = arg?.replace(/^\/renametopic\S*\s*/, "").trim();
  if (!newName) {
    await ctx.reply(ctx.t("error-topic-name"));
    return;
  }

  const topicId = ctx.message?.reply_to_message?.message_thread_id 
    || ctx.message?.message_thread_id 
    || ctx.session.grupo.directMessagesTopicId;

  if (!topicId) {
    await ctx.reply(ctx.t("error-topic-id"));
    return;
  }

  try {
    await (ctx.api as any).editForumTopic(chat.id, topicId, { name: newName });

    info("renameTopicHandler - topic renomeado", { userId, chatId: chat.id, topicId, newName });
    await ctx.reply(ctx.t("renametopic-success", { topicName: newName }));
  } catch (e) {
    error("renameTopicHandler - erro ao renomear topic", e);
    await ctx.reply(ctx.t("error-topic-rename"));
  }
}

export async function setActionTopicHandler(ctx: MyContext) {
  const chat = ctx.chat;
  const userId = ctx.from?.id;

  if (!chat || !("id" in chat)) {
    await ctx.reply(ctx.t("error-group-only"));
    return;
  }

  if (!checkIsForumChat(ctx)) {
    await ctx.reply(ctx.t("error-forum-only"));
    return;
  }

  const hasBotPermission = await checkBotCanManageTopics(ctx);
  if (!hasBotPermission) {
    await ctx.reply(ctx.t("error-bot-no-permission-topics"));
    return;
  }

  const isAdmin = await checkUserIsAdmin(ctx);
  if (!isAdmin) {
    await ctx.reply(ctx.t("error-admin-group-only"));
    return;
  }

  const topicId = ctx.message?.message_thread_id || ctx.session.grupo.directMessagesTopicId;

  if (!topicId) {
    await ctx.reply(ctx.t("error-topic-id"));
    return;
  }

  ctx.session.grupo.directMessagesTopicId = topicId;

  info("setActionTopicHandler - topic de ação configurado", { userId, chatId: chat.id, topicId });
  await ctx.reply(ctx.t("setactiontopic-success"));
}

export async function closeTopicHandler(ctx: MyContext) {
  const chat = ctx.chat;
  const userId = ctx.from?.id;

  if (!chat || !("id" in chat)) {
    await ctx.reply(ctx.t("error-group-only"));
    return;
  }

  if (!checkIsForumChat(ctx)) {
    await ctx.reply(ctx.t("error-forum-only"));
    return;
  }

  const hasBotPermission = await checkBotCanManageTopics(ctx);
  if (!hasBotPermission) {
    await ctx.reply(ctx.t("error-bot-no-permission-topics"));
    return;
  }

  const isAdmin = await checkUserIsAdmin(ctx);
  if (!isAdmin) {
    await ctx.reply(ctx.t("error-admin-group-only"));
    return;
  }

  let topicId: number | undefined | null;

  if (ctx.message?.reply_to_message) {
    topicId = ctx.message.reply_to_message.message_thread_id;
  } else {
    topicId = ctx.message?.message_thread_id || ctx.session.grupo.directMessagesTopicId;
  }

  if (!topicId) {
    await ctx.reply(ctx.t("error-topic-id"));
    return;
  }

  try {
    await (ctx.api as any).editForumTopic(chat.id, topicId, { is_closed: true });

    info("closeTopicHandler - topic fechado", { userId, chatId: chat.id, topicId });
    await ctx.reply(ctx.t("closetopic-success"));
  } catch (e) {
    error("closeTopicHandler - erro ao fechar topic", e);
    await ctx.reply(ctx.t("error-topic-close"));
  }
}

export async function deleteTopicHandler(ctx: MyContext) {
  const chat = ctx.chat;
  const userId = ctx.from?.id;

  if (!chat || !("id" in chat)) {
    await ctx.reply(ctx.t("error-group-only"));
    return;
  }

  if (!checkIsForumChat(ctx)) {
    await ctx.reply(ctx.t("error-forum-only"));
    return;
  }

  const hasBotPermission = await checkBotCanManageTopics(ctx);
  if (!hasBotPermission) {
    await ctx.reply(ctx.t("error-bot-no-permission-topics"));
    return;
  }

  const isAdmin = await checkUserIsAdmin(ctx);
  if (!isAdmin) {
    await ctx.reply(ctx.t("error-admin-group-only"));
    return;
  }

  let topicId: number | undefined | null;

  if (ctx.message?.reply_to_message) {
    topicId = ctx.message.reply_to_message.message_thread_id;
  } else {
    topicId = ctx.message?.message_thread_id || ctx.session.grupo.directMessagesTopicId;
  }

  if (!topicId) {
    await ctx.reply(ctx.t("error-topic-id"));
    return;
  }

  try {
    await ctx.api.deleteForumTopic(chat.id, topicId);

    info("deleteTopicHandler - topic eliminado", { userId, chatId: chat.id, topicId });
    await ctx.reply(ctx.t("deletetopic-success"));
  } catch (e) {
    error("deleteTopicHandler - erro ao eliminar topic", e);
    await ctx.reply(ctx.t("error-topic-delete"));
  }
}