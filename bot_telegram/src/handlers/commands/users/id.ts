import type { MyContext } from "../../../utils/customTypes.js";

export async function idHandler(ctx: MyContext) {
  const userId = ctx.from?.id;
  const chat = ctx.chat;
  let msg = "";

  if (userId) {
    msg += `Seu ID: <code>${userId}</code>\n`;
  }

  if (chat && chat.type !== "private") {
    msg += `ID do grupo (${chat.title || "sem nome"}): <code>${chat.id}</code>`;
  }

  await ctx.reply(msg, { parse_mode: "HTML" });
}
