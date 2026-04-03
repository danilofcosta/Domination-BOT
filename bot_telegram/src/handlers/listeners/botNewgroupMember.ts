import { prisma } from "../../../lib/prisma.js";
import type { MyContext } from "../../utils/customTypes.js";

async function botNewgroupMember(ctx: any) {
  console.log("bot new group member");

  // try {
  //   const newMember = ctx.message.new_chat_members?.[0];
  //   const chat = ctx.message.chat;
  //   const addedBy = ctx.message.from;

  //   if (!newMember) {
  //     console.log("Nenhum membro encontrado.");
  //     return;
  //   }

  //   // salva no banco
  //   const group = await prisma.telegram_groups.create({
  //     data: {
  //       group_id: Number(chat.id),
  //       group_name: chat.title || "Grupo sem nome",
  //       language: language.PT, // se sua tabela tiver esse campo
  //       configuration: JSON.stringify({
  //         group_id: chat.id,
  //         group_username: chat.username || null,
  //         group_name: chat.title,
  //         language: language.PT,

  //         addedBy: {
  //           id: addedBy.id,
  //           is_bot: addedBy.is_bot,
  //           first_name: addedBy.first_name,
  //           last_name: addedBy.last_name,
  //           username: addedBy.username,
  //           language_code: addedBy.language_code,
  //           is_premium: addedBy.is_premium
  //         }
  //       })
  //     }
  //   });

  //   // mensagem para outro chat (fixo)
  //   const text = ctx.t("add_bot_new_group", {
  //     name: chat.title || "Grupo sem nome",
  //     id: chat.id,
  //     user: addedBy.first_name
  //   });

  //   await ctx.api.sendMessage(
  //    process.env.GROUP_ADM, // ID de outro grupo/canal
  //     text,
  //     { parse_mode: "Markdown" }
  //   );

  // } catch (error) {
  //   console.error("Erro em botNewgroupMember:", error);
  // }

  // console.log("botNewgroupMemberHandler");
}

export { botNewgroupMember };
