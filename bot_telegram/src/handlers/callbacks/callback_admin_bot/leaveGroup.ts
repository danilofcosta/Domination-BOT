import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../../utils/customTypes.js";
import { info, warn } from "../../../utils/log.js";

async function leaveGroupCallback(ctx: MyContext) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  const parts = data.split("_");
  const action = parts[1];
  const chatId = parts[2] ? Number(parts[2]) : null;

  if (!chatId) {
    await ctx.answerCallbackQuery("Erro: ID do grupo inválido");
    return;
  }

  if (action === "confirm") {
    try {
      const chat = await ctx.api.getChat(chatId);
      const groupName = chat.title || `${chatId}`;

      await ctx.api.leaveChat(chatId);
      info(`leaveGroupCallback - saiu do grupo ${chatId} por solicitação de admin`);

      await ctx.editMessageText(
        ctx.t("bot_leave_group_done", { groupName }),
        { parse_mode: "HTML" },
      );
    } catch (e) {
      warn(`leaveGroupCallback - erro ao sair do grupo ${chatId}`, e);
      await ctx.answerCallbackQuery("Erro ao sair do grupo");
    }
    await ctx.answerCallbackQuery();
    return;
  }

  if (action === "cancel") {
    const chat = await ctx.api.getChat(chatId);
    const groupName = chat.title || `${chatId}`;

    const keyboard = new InlineKeyboard().text(
      ctx.t("bot_leave_group_btn"),
      `leavegroup_${chatId}`,
    );

    await ctx.editMessageText(
      ctx.t("add_bot_new_group", {
        name: groupName,
        id: chatId,
        user: "",
      }),
      { parse_mode: "HTML", reply_markup: keyboard },
    );
    await ctx.answerCallbackQuery();
    return;
  }

  const chat = await ctx.api.getChat(chatId);
  const groupName = chat.title || `${chatId}`;

  const keyboard = new InlineKeyboard()
    .text(ctx.t("bot_leave_group_confirm_btn"), `leavegroup_confirm_${chatId}`)
    .text(ctx.t("bot_leave_group_cancel_btn"), `leavegroup_cancel_${chatId}`);

  try {
    await ctx.editMessageText(
      ctx.t("bot_leave_group_confirm", { groupName }),
      { parse_mode: "HTML", reply_markup: keyboard },
    );
  } catch (e) {
    warn(`leaveGroupCallback - erro ao editar mensagem`, e);
  }

  await ctx.answerCallbackQuery();
}

export { leaveGroupCallback };
