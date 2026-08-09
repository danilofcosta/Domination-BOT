import { prisma } from "../../lib/prisma.js";
import type { MyContext } from "../customTypes.js";
// Tenta extrair o ID do usuário a partir de uma mensagem de contexto, lidando com diferentes tipos de entidades e formatos de menção.
export interface TelegramUserData {
  id: number;
  first_name: string;
  username?: string;
  is_bot?: boolean;
}
// tenta extrair o id do usuário a partir de uma mensagem de contexto
export async function extractUserId(
  ctx: MyContext,
): Promise<TelegramUserData | null> {
  const reply_to_message = ctx.message?.reply_to_message;

  if (reply_to_message?.from) {
    return reply_to_message.from as TelegramUserData;
  }

  if (!ctx.message?.entities) return null;

  for (const entity of ctx.message.entities) {
    switch (entity.type) {
      case "text_mention": {
        return entity.user as TelegramUserData;
      }

      case "phone_number": {
        const phoneText = ctx.message.text?.slice(
          entity.offset,
          entity.offset + entity.length,
        );
        if (!phoneText) return null;
        const id = Number(phoneText.replace(/\D/g, ""));
        if (!id) return null;
        return { id, first_name: phoneText };
      }

      case "mention": {
        const username = ctx.message.text
          ?.slice(entity.offset, entity.offset + entity.length)
          .replace("@", "");

        if (!username) return null;

        const user = await prisma.telegramUser.findFirst({
          where: {
            telegramData: {
              path: ["username"],
              equals: username,
            },
          },
        });

        return (user?.telegramData as TelegramUserData | undefined) ?? null;
      }
    }
  }

  return null;
}
