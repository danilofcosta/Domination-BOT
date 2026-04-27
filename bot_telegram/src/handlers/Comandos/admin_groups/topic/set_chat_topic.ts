import type { MyContext } from "../../../../utils/customTypes.js";
import { info, warn, debug } from "../../../../utils/log.js";

export async function setChatTopicHandler(ctx: MyContext) {
  const chat = ctx.chat;
  const userId = ctx.from?.id;

  if (!chat || !("id" in chat)) {
    await ctx.reply("❌ Este comando deve ser usado em um grupo.");
    return;
  }

  if (!ctx.message?.reply_to_message) {
    await ctx.reply("❌ Responda a uma mensagem do grupo para definir o topic.\n\nUse: /setchattopic replying a uma mensagem");
    return;
  }

  debug(`setChatTopicHandler - verificando admin do grupo`, { userId, chatId: chat.id });

  const admins = await ctx.api.getChatAdministrators(chat.id);
  const isAdmin = admins.some((admin) => admin.user?.id === userId);

  if (!isAdmin) {
    warn(`setChatTopicHandler - usuário não é admin do grupo`, { userId, chatId: chat.id });
    await ctx.reply("❌ Apenas administradores do grupo podem usar este comando.");
    return;
  }

  const replyMsg = ctx.message.reply_to_message;
  const topicId = replyMsg.message_thread_id;

  if (!topicId) {
    await ctx.reply("❌ A mensagem respondida não é de uma topic.\n\nUse este comando respondendo a uma mensagem de uma topic do fórum.");
    return;
  }

  ctx.session.grupo.directMessagesTopicId = topicId;

  info(`setChatTopicHandler - topic configurado`, { userId, chatId: chat.id, topicId });

  await ctx.reply(
    `✅ Topic configurado!\n\n📝 Topic ID: ${topicId}\n\nAgora todas as mensagens de drop serão enviadas nesta topic.`
  );
}