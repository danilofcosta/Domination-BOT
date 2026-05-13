import type { Context } from "grammy";

export function mentionUser(username: string, userId: number) {
  //<a href="tg://user?id=123456789">inline mention of a user</a>
  const userMention = `<a href="tg://user?id=${userId}"><b>${username}</b></a>`;
  //const userMention = '<a href="tg://user?id=123456789">inline mention of a user</a>'
  // console.log(userMention);
  return userMention;
}

export async function get_id_mention_User(
  ctx: Context,
  
): Promise<number | false> {
  const entities = ctx.message?.entities;
  const texto = ctx.message?.text;
  const chatId = ctx.chat?.id ||0;

  if (!entities) return false;

  for (const entity of entities) {
    // ✅ Melhor caso: já vem com ID
    if (entity.type === "text_mention") {
      return entity.user?.id ?? false;
    }

    // ⚠️ Caso: @username
    if (entity.type === "mention" && texto) {
      const mention = texto.slice(entity.offset, entity.offset + entity.length);

      const username = mention.replace("@", "").toLowerCase();
   
      return false;
    }
  }

  return false;
}
