import type { NextFunction } from "grammy";
import type { MyContext } from "../../utils/customTypes.js";
import { createMentionUser } from "../../utils/telegram/createMentionUser.js";
import { redis } from "../../cache/redis.js";
import { blockedUsers, blockKey } from "./blockedUsers.js";
import { BLOCK_DURATION_MS, LIMIT, TIMEFAME } from "./constants.js";

export async function rateLimiter(ctx: MyContext, next: NextFunction) {
  const fromId = ctx.from?.id;
  if (fromId === undefined || !fromId) return next();
  if ( !ctx.chat?.id) return next();

  const now = ctx.message?.date ? ctx.message.date * 1000 : Date.now();
  const key = blockKey(ctx.chat?.id, fromId);
  const exceeded = await redis.rateLimitExceeded(
    `rl:${key}`,
    TIMEFAME,
    LIMIT,
  );

  if (exceeded) {
    blockedUsers.set(key, now + BLOCK_DURATION_MS);

    const name = ctx.from?.first_name || ctx.from?.username || "User";
    const userMention = createMentionUser({
      Nome: name,
      telegramiduser: fromId,
    });
    await ctx.reply(
      ctx.t("use-onLimitExceeded", { mentionUser: userMention }),
      { parse_mode: "HTML" },
    );
    return;
  }

  return next();
}
