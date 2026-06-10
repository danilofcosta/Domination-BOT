import type { MyContext } from "../../../utils/customTypes.js";
import { info, warn } from "../../../utils/log.js";

export async function leaveGroupHandler(ctx: MyContext) {
  const match = (ctx.match as string)?.trim();

  if (!match) {
    await ctx.reply("Use: /leavegroup" + " <id_do_grupo>");
    return;
  }

  const chatId = Number(match.replace(/\D/g, ""));
  if (!chatId) {
    await ctx.reply("ID inválido.");
    return;
  }

  try {
    const chat = await ctx.api.getChat(chatId);
    const groupName = chat.title || "grupo";

    await ctx.reply(`Saindo do grupo "${groupName}" (${chatId})...`);

    info(`leaveGroupHandler - saindo do grupo ${chatId} por solicitacao de admin`, {
      adminId: ctx.from?.id,
    });

    await ctx.api.leaveChat(chatId);
  } catch (e) {
    warn(`leaveGroupHandler - erro ao sair do grupo ${chatId}`, e);
    await ctx.reply(`Erro ao sair do grupo: nao encontrado ou o bot nao esta nele.`);
  }
}
