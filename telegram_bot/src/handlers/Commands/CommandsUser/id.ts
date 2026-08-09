import type { MyContext } from "../../../utils/customTypes.js";

export async function idHandler(ctx: MyContext) {
  const replied = ctx.msg?.reply_to_message;
  const chat = ctx.chat;

  let msg = "";

  if (replied?.from) {
    msg = [
      `Usuário: ${replied.from.first_name}${replied.from.last_name ? ` ${replied.from.last_name}` : ""}`,
      `ID: <code>${replied.from.id}</code>`,
    ].join("\n");
  } else if (chat?.type === "private") {
    msg = [
      `${ctx.from?.first_name || "Usuário"}`,
      `Seu ID: <code>${ctx.from!.id}</code>`,
    ].join("\n");
  } else {
    msg = [
      `Grupo: ${chat?.title || "sem nome"}`,
      `ID do chat: <code>${chat!.id}</code>`,
    ].join("\n");
  }

  await ctx.reply(msg, { parse_mode: "HTML" });
}
