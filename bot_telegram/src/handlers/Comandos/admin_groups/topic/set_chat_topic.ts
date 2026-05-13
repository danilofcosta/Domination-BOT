import type { MyContext } from "../../../../utils/customTypes.js";
import { info, warn, debug } from "../../../../utils/log.js";

export async function setChatTopicHandler(ctx: MyContext) {
  const chat = ctx.chat;
  const userId = ctx.from?.id;

  if (!chat || !("id" in chat)) {
    await ctx.reply(ctx.t("error-topic-group-only"));
    return;
  }

  if (!ctx.message?.reply_to_message) {
    await ctx.reply(ctx.t("error-topic-reply-msg"));
    return;
  }

  debug(`setChatTopicHandler - verificando admin do grupo`, { userId, chatId: chat.id });

  const admins = await ctx.api.getChatAdministrators(chat.id);
  const isAdmin = admins.some((admin) => admin.user?.id === userId);

  if (!isAdmin) {
    warn(`setChatTopicHandler - usuário não é admin do grupo`, { userId, chatId: chat.id });
    await ctx.reply(ctx.t("error-topic-not-admin"));
    return;
  }

  const replyMsg = ctx.message.reply_to_message;
  const topicId = replyMsg.message_thread_id;

  if (!topicId) {
    await ctx.reply(ctx.t("error-topic-not-topic"));
    return;
  }

  ctx.session.grupo.directMessagesTopicId = topicId;

  info(`setChatTopicHandler - topic configurado`, { userId, chatId: chat.id, topicId });

  await ctx.reply(
    ctx.t("topic-config-success", { topicId })
  );
}