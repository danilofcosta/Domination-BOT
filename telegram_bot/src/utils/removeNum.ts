import { Context } from "grammy";
import type { MessageEntity } from "grammy/types";

function removeEntities(text: string, entities?: MessageEntity[]) {
  if (!entities?.length) return text;

  const sorted = [...entities].sort((a, b) => b.offset - a.offset);

  for (const entity of sorted) {
    switch (entity.type) {
      case "mention":
      case "bot_command":
      case "text_mention":
      case "custom_emoji":
      case "code":
      case "pre":
      case "blockquote":
      case "url":
      case "text_link":
        text =
          text.slice(0, entity.offset) +
          text.slice(entity.offset + entity.length);
        break;
    }
  }

  return text.trim();
}

export function extractNumbers(ctx: Context): number[] | true {
  const currentText = removeEntities(
    ctx.message?.text ?? "",
    ctx.message?.entities
  );

  if (currentText.toLowerCase() === "myharem"){
    return true

  }

  const replyText = removeEntities(
    ctx.message?.reply_to_message?.text ?? "",
    ctx.message?.reply_to_message?.entities
  );

  const allText = `${currentText} ${replyText}`;

  return [...allText.matchAll(/\d+/g)].map((m) => Number(m[0]));
}