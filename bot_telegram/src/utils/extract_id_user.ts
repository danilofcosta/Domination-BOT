import { prisma } from "../lib/prisma.js";
import type { MyContext } from "./customTypes.js";

export interface TelegramUserData {
  id: number;
  first_name: string;
  username?: string;
  is_bot?: boolean;
}

export async function Extract_id_user(ctx: MyContext): Promise<TelegramUserData | null> {
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

      case "mention": {
        const username = ctx.message.text
          ?.slice(entity.offset, entity.offset + entity.length)
          .replace("@", "");

        if (!username) return null;

        const user = await prisma.user.findFirst({
          where: {
            telegramData: {
              path: ["username"],
              equals: username,
            },
          },
        });

        return user?.telegramData as TelegramUserData | undefined ?? null;
      }
    }
  }

  return null;
}