import type { NextFunction } from "grammy";
import type { MyContext } from "../../uteis/CustomTypes.js";
import { CreateMentionUser } from "../../uteis/uteis_telegram/CreateMentionUser.js";
import { redis } from "../../cache/redis.js";
import { blockedUsers } from "./blockedUsers.js";
import { BLOCK_DURATION_MS, LIMIT, TIMEFAME } from "./constants.js";

export async function rateLimiter(ctx: MyContext, next: NextFunction) {
  const fromId = ctx.from?.id;
  if (fromId === undefined) return next();

  const now = Date.now();
  const exceeded = await redis.rateLimitExceeded(
    `rl:${fromId}`,
    TIMEFAME,
    LIMIT,
  );

  if (exceeded) {
    blockedUsers.set(fromId, now + BLOCK_DURATION_MS);

    const name = ctx.from?.first_name || ctx.from?.username || "User";
    const userMention = CreateMentionUser({
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
